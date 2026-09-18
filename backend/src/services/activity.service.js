import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/app-error.js'

const activityInclude = {
  actor: { select: { id: true, name: true, initials: true, color: true } },
  project: { select: { id: true, name: true, color: true } },
  sprint: { select: { id: true, name: true } },
  task: { select: { id: true, title: true } },
}

const typeKeys = Object.fromEntries([
  'TASK_CREATED', 'TASK_COMPLETED', 'TASK_STATUS_CHANGED', 'TASK_UPDATED', 'TASK_DELETED', 'TASK_ASSIGNED',
  'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED', 'SPRINT_CREATED', 'SPRINT_UPDATED', 'SPRINT_COMPLETED',
  'SPRINT_DELETED', 'TEAM_MEMBER_UPDATED', 'TEAM_MEMBER_REMOVED', 'COMMENT_ADDED',
].map((type) => [type.toLowerCase().replaceAll('_', '-'), type]))

function toActivity(activity) {
  return {
    id: activity.id,
    type: activity.type.toLowerCase().replaceAll('_', '-'),
    description: activity.description,
    metadata: activity.metadata,
    workspaceId: activity.workspaceId,
    projectId: activity.projectId,
    sprintId: activity.sprintId,
    taskId: activity.taskId,
    timestamp: activity.createdAt,
    createdAt: activity.createdAt,
    user: activity.actor ? { id: activity.actor.id, name: activity.actor.name, initials: activity.actor.initials, color: activity.actor.color } : null,
    project: activity.project ? { id: activity.project.id, name: activity.project.name, color: activity.project.color } : null,
    sprint: activity.sprint ? { id: activity.sprint.id, name: activity.sprint.name } : null,
    task: activity.task ? { id: activity.task.id, title: activity.task.title } : null,
  }
}

export async function logActivity(input, client = prisma) {
  const { workspaceId, actorId, type, description, projectId, sprintId, taskId, metadata } = input
  if (!actorId) return null
  return client.activity.create({
    data: { workspaceId, actorId, type, description, projectId, sprintId, taskId, metadata },
  })
}

export async function listActivities(workspaceId, filters) {
  const page = Number(filters.page ?? 1)
  const limit = Number(filters.limit ?? 20)
  const type = filters.type ? typeKeys[String(filters.type).toLowerCase()] : undefined
  if (filters.type && !type) throw new AppError(400, 'Activity type is not valid.')

  const where = {
    workspaceId,
    ...(type ? { type } : {}),
    ...(filters.actorId ? { actorId: filters.actorId } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.sprintId ? { sprintId: filters.sprintId } : {}),
    ...(filters.taskId ? { taskId: filters.taskId } : {}),
  }
  const [total, activities] = await prisma.$transaction([
    prisma.activity.count({ where }),
    prisma.activity.findMany({ where, include: activityInclude, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * limit, take: limit }),
  ])
  return { activities: activities.map(toActivity), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}
