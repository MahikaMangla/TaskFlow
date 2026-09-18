import { prisma } from '../lib/prisma.js'
import { toMember } from '../utils/api-mappers.js'
import { AppError } from '../utils/app-error.js'
import { logActivity } from './activity.service.js'

const memberInclude = { user: true }

export async function getWorkspace(workspaceId) {
  return prisma.workspace.findUnique({ where: { id: workspaceId } })
}

export async function listMembers(workspaceId) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { workspaceId }, include: memberInclude, orderBy: { user: { name: 'asc' } },
  })
  return memberships.map((membership) => toMember(membership.user, membership.role))
}

export async function getMember(workspaceId, userId) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } }, include: memberInclude,
  })
  if (!membership) throw new AppError(404, 'Team member not found.')
  return toMember(membership.user, membership.role)
}

export async function updateMember(workspaceId, userId, data, actorId) {
  const membership = await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId } } })
  if (!membership) throw new AppError(404, 'Team member not found.')
  const user = await prisma.user.update({ where: { id: userId }, data })
  await logActivity({ workspaceId, actorId, type: 'TEAM_MEMBER_UPDATED', description: `Updated team member ${user.name}.`, metadata: { memberId: userId } })
  return toMember(user, membership.role)
}

export async function removeMember(workspaceId, userId, actorId) {
  if (userId === actorId) throw new AppError(400, 'You cannot remove yourself from a workspace.')
  const membership = await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId } } })
  if (!membership) throw new AppError(404, 'Team member not found.')
  if (membership.role === 'ADMIN') {
    const admins = await prisma.workspaceMember.count({ where: { workspaceId, role: 'ADMIN' } })
    if (admins <= 1) throw new AppError(400, 'The last workspace admin cannot be removed.')
  }
  const member = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
  await logActivity({ workspaceId, actorId, type: 'TEAM_MEMBER_REMOVED', description: `Removed team member ${member.name}.`, metadata: { memberId: userId } })
  await prisma.workspaceMember.delete({ where: { workspaceId_userId: { workspaceId, userId } } })
}
