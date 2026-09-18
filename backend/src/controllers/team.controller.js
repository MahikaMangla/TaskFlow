import { getMember, getWorkspace, listMembers, removeMember, updateMember } from '../services/team.service.js'
import { asyncHandler } from '../utils/async-handler.js'
import { validateMemberUpdate } from '../validators/workspace.validator.js'

export const getCurrentWorkspace = asyncHandler(async (request, response) => {
  const workspace = await getWorkspace(request.workspace.id)
  response.status(200).json({
    workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug, createdAt: workspace.createdAt, updatedAt: workspace.updatedAt, role: request.workspaceMembership.role.toLowerCase() },
  })
})

export const getMembers = asyncHandler(async (request, response) => {
  response.status(200).json({ members: await listMembers(request.workspace.id) })
})

export const getMemberById = asyncHandler(async (request, response) => {
  response.status(200).json({ member: await getMember(request.workspace.id, request.params.memberId) })
})

export const patchMember = asyncHandler(async (request, response) => {
  response.status(200).json({ member: await updateMember(request.workspace.id, request.params.memberId, validateMemberUpdate(request.body), request.user.id) })
})

export const deleteMember = asyncHandler(async (request, response) => {
  await removeMember(request.workspace.id, request.params.memberId, request.user.id)
  response.status(204).end()
})
