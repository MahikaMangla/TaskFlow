import { prisma } from '../lib/prisma.js'
import { toTask } from '../utils/api-mappers.js'
import { AppError } from '../utils/app-error.js'
import { logActivity } from './activity.service.js'

const taskInclude = {
  assignee: true,
  labels: { include: { label: true }, orderBy: { label: { name: 'asc' } } },
}

async function requireTask(workspaceId, taskId, client = prisma) {
  const task = await client.task.findFirst({ where: { id: taskId, workspaceId }, include: taskInclude })
  if (!task) throw new AppError(404, 'Task not found.')
  return task
}

async function validateReferences(workspaceId, data, currentTask = null, client = prisma) {
  const projectId = data.projectId ?? currentTask?.projectId
  if (projectId) {
    const project = await client.project.findFirst({ where: { id: projectId, workspaceId } })
    if (!project) throw new AppError(400, 'Project does not belong to this workspace.')
  }
  if (data.sprintId) {
    const sprint = await client.sprint.findFirst({ where: { id: data.sprintId, workspaceId } })
    if (!sprint) throw new AppError(400, 'Sprint does not belong to this workspace.')
  }
  const assigneeId = data.assigneeId === undefined ? currentTask?.assigneeId : data.assigneeId
  if (assigneeId) {
    const membership = await client.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId: assigneeId } } })
    if (!membership) throw new AppError(400, 'Assignee does not belong to this workspace.')
    const projectMembership = await client.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: assigneeId } } })
    if (!projectMembership) throw new AppError(400, 'Assignee must be a member of this task\'s project.')
  }
}

function labelCreates(workspaceId, labels) {
  return labels.map((name) => ({
    label: {
      connectOrCreate: {
        where: { workspaceId_name: { workspaceId, name } },
        create: { workspaceId, name },
      },
    },
  }))
}

function priorityOrder(priority) {
  return { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[priority]
}

function buildWhere(workspaceId, filters) {
  const where = { workspaceId }
  if (filters.projectId) where.projectId = filters.projectId
  if (filters.sprintId === 'none') where.sprintId = null
  else if (filters.sprintId) where.sprintId = filters.sprintId
  if (filters.assigneeId === 'unassigned') where.assigneeId = null
  else if (filters.assigneeId) where.assigneeId = filters.assigneeId
  if (filters.status) where.status = filters.status
  if (filters.priority) where.priority = filters.priority
  if (filters.label) where.labels = { some: { label: { name: filters.label } } }
  if (filters.search) where.OR = [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }]
  return where
}

export async function listTasks(workspaceId, filters) {
  const tasks = await prisma.task.findMany({ where: buildWhere(workspaceId, filters), include: taskInclude, orderBy: [{ status: 'asc' }, { position: 'asc' }] })
  if (filters.sort === 'priority-desc') tasks.sort((a, b) => priorityOrder(b.priority) - priorityOrder(a.priority))
  if (filters.sort === 'priority-asc') tasks.sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority))
  if (filters.sort === 'dueDate-asc') tasks.sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity))
  if (filters.sort === 'dueDate-desc') tasks.sort((a, b) => (b.dueDate?.getTime() ?? -Infinity) - (a.dueDate?.getTime() ?? -Infinity))
  if (filters.sort === 'updated-desc') tasks.sort((a, b) => b.updatedAt - a.updatedAt)
  return tasks.map(toTask)
}

export async function getTask(workspaceId, taskId) {
  return toTask(await requireTask(workspaceId, taskId))
}

export async function listLabels(workspaceId) {
  return prisma.label.findMany({ where: { workspaceId }, orderBy: { name: 'asc' } })
}

export async function createTask(workspaceId, creatorId, data) {
  await validateReferences(workspaceId, data)
  const max = await prisma.task.aggregate({ where: { workspaceId, status: data.status ?? 'TODO' }, _max: { position: true } })
  const labels = data.labels ?? []
  delete data.labels
  const task = await prisma.task.create({
    data: {
      ...data, storyPoints: data.storyPoints ?? 3, workspaceId, creatorId, position: (max._max.position ?? -1) + 1,
      labels: { create: labelCreates(workspaceId, labels) },
    }, include: taskInclude,
  })
  await logActivity({ workspaceId, actorId: creatorId, type: 'TASK_CREATED', description: `Created task ${task.title}.`, projectId: task.projectId, sprintId: task.sprintId, taskId: task.id })
  return toTask(task)
}

export async function updateTask(workspaceId, taskId, data, actorId) {
  const current = await requireTask(workspaceId, taskId)
  await validateReferences(workspaceId, data, current)
  const labels = data.labels
  delete data.labels
  const requestedStatus = data.status
  delete data.status
  if (Object.keys(data).length || labels !== undefined) {
    await prisma.task.update({
      where: { id: current.id },
      data: {
        ...data,
        ...(labels !== undefined ? { labels: { deleteMany: {}, create: labelCreates(workspaceId, labels) } } : {}),
      },
    })
  }
  if (requestedStatus && requestedStatus !== current.status) return moveTask(workspaceId, taskId, requestedStatus, undefined, actorId)
  const task = await getTask(workspaceId, taskId)
  if (Object.keys(data).length || labels !== undefined) {
    const type = data.assigneeId !== undefined ? 'TASK_ASSIGNED' : 'TASK_UPDATED'
    await logActivity({ workspaceId, actorId, type, description: `${type === 'TASK_ASSIGNED' ? 'Updated assignee for' : 'Updated'} task ${task.title}.`, projectId: task.projectId, sprintId: task.sprintId, taskId: task.id })
  }
  return task
}

export async function moveTask(workspaceId, taskId, targetStatus, requestedOrder, actorId) {
  const moved = await prisma.$transaction(async (transaction) => {
    const task = await requireTask(workspaceId, taskId, transaction)
    const sourceStatus = task.status
    const sourceTasks = await transaction.task.findMany({ where: { workspaceId, status: sourceStatus, id: { not: task.id } }, orderBy: { position: 'asc' } })
    const targetTasks = sourceStatus === targetStatus
      ? sourceTasks
      : await transaction.task.findMany({ where: { workspaceId, status: targetStatus, id: { not: task.id } }, orderBy: { position: 'asc' } })
    const targetOrder = Math.min(requestedOrder ?? targetTasks.length, targetTasks.length)
    const orderedTarget = [...targetTasks]
    orderedTarget.splice(targetOrder, 0, task)

    if (sourceStatus !== targetStatus) {
      for (let index = 0; index < sourceTasks.length; index += 1) {
        await transaction.task.update({ where: { id: sourceTasks[index].id }, data: { position: index } })
      }
    }
    for (let index = 0; index < orderedTarget.length; index += 1) {
      await transaction.task.update({ where: { id: orderedTarget[index].id }, data: { status: targetStatus, position: index } })
    }
    return toTask(await requireTask(workspaceId, taskId, transaction))
  })
  if (actorId) {
    const type = moved.status === 'done' ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED'
    await logActivity({ workspaceId, actorId, type, description: `${type === 'TASK_COMPLETED' ? 'Completed' : 'Moved'} task ${moved.title}${type === 'TASK_STATUS_CHANGED' ? ` to ${moved.status.replaceAll('_', ' ')}` : '.'}`, projectId: moved.projectId, sprintId: moved.sprintId, taskId: moved.id })
  }
  return moved
}

export async function deleteTask(workspaceId, taskId, actorId) {
  const task = await requireTask(workspaceId, taskId)
  await logActivity({ workspaceId, actorId, type: 'TASK_DELETED', description: `Deleted task ${task.title}.`, projectId: task.projectId, sprintId: task.sprintId })
  await prisma.$transaction(async (transaction) => {
    await transaction.task.delete({ where: { id: task.id } })
    const remaining = await transaction.task.findMany({ where: { workspaceId, status: task.status }, orderBy: { position: 'asc' } })
    for (let index = 0; index < remaining.length; index += 1) {
      await transaction.task.update({ where: { id: remaining[index].id }, data: { position: index } })
    }
  })
}
