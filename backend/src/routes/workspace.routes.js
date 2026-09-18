import { Router } from 'express'
import { deleteInvitation, getInvitations, postInvitation } from '../controllers/invitation.controller.js'
import { deleteMember, getCurrentWorkspace, getMemberById, getMembers, patchMember } from '../controllers/team.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireWorkspace, requireWorkspaceRole } from '../middleware/workspace-context.js'

export const workspaceRouter = Router()

workspaceRouter.use(authenticate, requireWorkspace)
workspaceRouter.get('/current', getCurrentWorkspace)
workspaceRouter.get('/members', getMembers)
workspaceRouter.get('/members/:memberId', getMemberById)
workspaceRouter.patch('/members/:memberId', requireWorkspaceRole('ADMIN', 'MANAGER'), patchMember)
workspaceRouter.delete('/members/:memberId', requireWorkspaceRole('ADMIN'), deleteMember)
workspaceRouter.get('/invitations', requireWorkspaceRole('ADMIN'), getInvitations)
workspaceRouter.post('/invitations', requireWorkspaceRole('ADMIN'), postInvitation)
workspaceRouter.delete('/invitations/:invitationId', requireWorkspaceRole('ADMIN'), deleteInvitation)
