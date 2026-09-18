import { Router } from 'express'
import { getInvitationPreview, postAcceptInvitation } from '../controllers/invitation.controller.js'
import { createRateLimiter } from '../middleware/security.js'

export const invitationRouter = Router()

const invitationRateLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 20 })

invitationRouter.get('/preview', invitationRateLimiter, getInvitationPreview)
invitationRouter.post('/accept', invitationRateLimiter, postAcceptInvitation)
