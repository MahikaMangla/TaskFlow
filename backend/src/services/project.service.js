import { prisma } from '../lib/prisma.js'
import { toProject } from '../utils/api-mappers.js'
import { AppError } from '../utils/app-error.js'
import { logActivity } from './activity.service.js'

const projectInclude = {
  owner: true,
  members: { include: { user: true }, orderBy: { user: { name: 'asc' } } },
  tasks: { select: { status: true } },
}

async function findProject(workspaceId, projectId) {
  const project = await prisma.project.findFirst({ where: { id: projectId, workspaceId }, include: projectInclude })
  if (!project) throw new AppError(404, 'Project not found.')
  return project
}

export async function listProjects(workspaceId) {
  const projects = await prisma.project.findMany({ where: { workspaceId }, include: projectInclude, orderBy: { updatedAt: 'desc' } })
  return projects.map(toProject)
}

export async function getProject(workspaceId, projectId) {
  return toProject(await findProject(workspaceId, projectId))
}

export async function createProject(workspaceId, ownerId, data) {
  const project = await prisma.project.create({
    data: {
      ...data, workspaceId, ownerId,
      members: { create: { userId: ownerId, role: 'PROJECT_MANAGER' } },
    },
    include: projectInclude,
  })
  await logActivity({ workspaceId, actorId: ownerId, type: 'PROJECT_CREATED', description: `Created project ${project.name}.`, projectId: project.id })
  return toProject(project)
}

export async function updateProject(workspaceId, projectId, data, actorId) {
  await findProject(workspaceId, projectId)
  const project = await prisma.project.update({ where: { id: projectId }, data, include: projectInclude })
  await logActivity({ workspaceId, actorId, type: 'PROJECT_UPDATED', description: `Updated project ${project.name}.`, projectId: project.id })
  return toProject(project)
}

export async function deleteProject(workspaceId, projectId, actorId) {
  const project = await findProject(workspaceId, projectId)
  await logActivity({ workspaceId, actorId, type: 'PROJECT_DELETED', description: `Deleted project ${project.name}.` })
  await prisma.project.delete({ where: { id: projectId } })
}

export async function replaceProjectMembers(workspaceId, projectId, members, ownerId, actorId) {
  const existing = await findProject(workspaceId, projectId)
  const byUserId = new Map(members.map((member) => [member.userId, member]))
  byUserId.set(ownerId, { userId: ownerId, role: 'PROJECT_MANAGER' })
  const normalizedMembers = [...byUserId.values()]
  const ids = normalizedMembers.map((member) => member.userId)
  const availableMembers = await prisma.workspaceMember.count({ where: { workspaceId, userId: { in: ids } } })
  if (availableMembers !== ids.length) throw new AppError(400, 'Every project member must belong to this workspace.')
  const project = await prisma.$transaction(async (transaction) => {
    await transaction.projectMember.deleteMany({ where: { projectId } })
    await transaction.projectMember.createMany({ data: normalizedMembers.map((member) => ({ projectId, userId: member.userId, role: member.role })) })
    return transaction.project.findUnique({ where: { id: projectId }, include: projectInclude })
  })
  await logActivity({ workspaceId, actorId, type: 'PROJECT_UPDATED', description: `Updated members for project ${existing.name}.`, projectId })
  return toProject(project)
}
