import { prisma } from '../lib/prisma.js'
import { listTasks, updateTask } from './task.service.js'
import { toSprint } from '../utils/api-mappers.js'
import { AppError } from '../utils/app-error.js'
import { logActivity } from './activity.service.js'

const metricTaskSelect = { status: true, priority: true, storyPoints: true }

async function requireSprint(workspaceId, sprintId, client = prisma) {
  const sprint = await client.sprint.findFirst({ where: { id: sprintId, workspaceId } })
  if (!sprint) throw new AppError(404, 'Sprint not found.')
  return sprint
}

async function sprintWithMetrics(workspaceId, sprintId, client = prisma) {
  const sprint = await requireSprint(workspaceId, sprintId, client)
  const tasks = await client.task.findMany({ where: { workspaceId, sprintId }, select: metricTaskSelect })
  return toSprint(sprint, tasks)
}

export async function listSprints(workspaceId) {
  const sprints = await prisma.sprint.findMany({ where: { workspaceId }, orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }] })
  const taskGroups = await prisma.task.findMany({ where: { workspaceId, sprintId: { not: null } }, select: { sprintId: true, ...metricTaskSelect } })
  const tasksBySprint = new Map()
  for (const task of taskGroups) tasksBySprint.set(task.sprintId, [...(tasksBySprint.get(task.sprintId) ?? []), task])
  return sprints.map((sprint) => toSprint(sprint, tasksBySprint.get(sprint.id) ?? []))
}

export async function getSprint(workspaceId, sprintId) {
  return sprintWithMetrics(workspaceId, sprintId)
}

export async function createSprint(workspaceId, data, actorId) {
  try {
    const sprint = await prisma.sprint.create({ data: { ...data, workspaceId } })
    await logActivity({ workspaceId, actorId, type: 'SPRINT_CREATED', description: `Created sprint ${sprint.name}.`, sprintId: sprint.id })
    return toSprint(sprint)
  } catch (error) {
    if (error.code === 'P2002') throw new AppError(409, 'A sprint with this name already exists in this workspace.')
    throw error
  }
}

export async function updateSprint(workspaceId, sprintId, data, actorId) {
  const current = await requireSprint(workspaceId, sprintId)
  const nextStartDate = data.startDate ?? current.startDate
  const nextEndDate = data.endDate ?? current.endDate
  if (nextEndDate < nextStartDate) throw new AppError(400, 'End date must not be before start date.')
  try {
    await prisma.$transaction(async (transaction) => {
      if (data.status === 'ACTIVE') {
        await transaction.sprint.updateMany({
          where: { workspaceId, id: { not: sprintId }, status: 'ACTIVE' },
          data: { status: 'PAUSED' },
        })
      }

      if (data.status === 'COMPLETED') {
        const tasks = await transaction.task.findMany({ where: { workspaceId, sprintId }, select: metricTaskSelect })
        const metrics = toSprint(await requireSprint(workspaceId, sprintId, transaction), tasks)
        data.completedPoints = metrics.calculatedCompletedPoints
        data.velocity = metrics.calculatedCompletedPoints
      }
      await transaction.sprint.update({ where: { id: sprintId }, data })
    })
  } catch (error) {
    if (error.code === 'P2002') throw new AppError(409, 'A sprint with this name already exists in this workspace.')
    throw error
  }
  const sprint = await getSprint(workspaceId, sprintId)
  await logActivity({ workspaceId, actorId, type: sprint.status === 'completed' ? 'SPRINT_COMPLETED' : 'SPRINT_UPDATED', description: `${sprint.status === 'completed' ? 'Completed' : 'Updated'} sprint ${sprint.name}.`, sprintId })
  return sprint
}

export async function deleteSprint(workspaceId, sprintId, actorId) {
  const sprint = await requireSprint(workspaceId, sprintId)
  await logActivity({ workspaceId, actorId, type: 'SPRINT_DELETED', description: `Deleted sprint ${sprint.name}.` })
  await prisma.sprint.delete({ where: { id: sprintId } })
}

export async function getSprintTasks(workspaceId, sprintId) {
  await requireSprint(workspaceId, sprintId)
  return listTasks(workspaceId, { sprintId, sort: 'updated-desc' })
}

export async function assignTasksToSprint(workspaceId, sprintId, taskIds, actorId) {
  await requireSprint(workspaceId, sprintId)
  const tasks = await prisma.task.findMany({ where: { workspaceId, id: { in: taskIds } }, select: { id: true } })
  if (tasks.length !== taskIds.length) throw new AppError(400, 'Every task must belong to this workspace.')
  for (const taskId of taskIds) await updateTask(workspaceId, taskId, { sprintId }, actorId)
  return getSprint(workspaceId, sprintId)
}

export async function removeTaskFromSprint(workspaceId, sprintId, taskId, actorId) {
  await requireSprint(workspaceId, sprintId)
  const task = await prisma.task.findFirst({ where: { id: taskId, workspaceId, sprintId } })
  if (!task) throw new AppError(404, 'Task is not in this sprint.')
  return updateTask(workspaceId, taskId, { sprintId: null }, actorId)
}
