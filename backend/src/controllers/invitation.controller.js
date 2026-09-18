import {
  acceptInvitation,
  createInvitation,
  listInvitations,
  previewInvitation,
  revokeInvitation,
} from '../services/invitation.service.js'
import { verifyAccessToken } from '../services/token.service.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/app-error.js'
import { asyncHandler } from '../utils/async-handler.js'
import { validateInvitationAccept, validateInvitationCreate } from '../validators/invitation.validator.js'

function requirePreviewToken(value) {
  if (typeof value !== 'string' || value.length < 20 || value.length > 512) {
    throw new AppError(400, 'Invitation token is required.')
  }
  return value
}

function metadataFrom(request) {
  return { userAgent: request.get('user-agent')?.slice(0, 500), ipAddress: request.ip }
}

async function optionalAuthenticatedUser(request) {
  const authorization = request.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return null

  try {
    const payload = verifyAccessToken(authorization.slice(7))
    if (payload.type !== 'access' || typeof payload.sub !== 'string') return null
    return prisma.user.findUnique({ where: { id: payload.sub } })
  } catch {
    return null
  }
}

export const getInvitationPreview = asyncHandler(async (request, response) => {
  response.status(200).json(await previewInvitation(requirePreviewToken(request.query.token)))
})

export const postAcceptInvitation = asyncHandler(async (request, response) => {
  const input = validateInvitationAccept(request.body)
  const authenticatedUser = await optionalAuthenticatedUser(request)
  const result = await acceptInvitation(input.token, input, authenticatedUser, metadataFrom(request))
  response.status(200).json(result)
})

export const getInvitations = asyncHandler(async (request, response) => {
  response.status(200).json({ invitations: await listInvitations(request.workspace.id) })
})

export const postInvitation = asyncHandler(async (request, response) => {
  const result = await createInvitation(
    request.workspace.id,
    request.user.id,
    validateInvitationCreate(request.body),
  )
  response.status(201).json(result)
})

export const deleteInvitation = asyncHandler(async (request, response) => {
  response.status(200).json({
    invitation: await revokeInvitation(request.workspace.id, request.params.invitationId),
  })
})
