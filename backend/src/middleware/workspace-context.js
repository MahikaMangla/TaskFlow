import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/app-error.js'
import { asyncHandler } from '../utils/async-handler.js'

export const requireWorkspace = asyncHandler(async (request, _response, next) => {
  const requestedWorkspaceId = request.get('x-workspace-id')
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: request.user.id,
      ...(requestedWorkspaceId ? { workspaceId: requestedWorkspaceId } : {}),
    },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  })

  if (!membership) throw new AppError(403, 'You do not belong to the requested workspace.')
  request.workspace = membership.workspace
  request.workspaceMembership = membership
  next()
})

export function requireWorkspaceRole(...roles) {
  return (request, _response, next) => {
    if (!roles.includes(request.workspaceMembership.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action.'))
    }
    next()
  }
}
