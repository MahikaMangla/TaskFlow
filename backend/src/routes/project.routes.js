import { Router } from 'express'
import { getProjectById, getProjects, patchProject, postProject, putProjectMembers, removeProject } from '../controllers/project.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireWorkspace, requireWorkspaceRole } from '../middleware/workspace-context.js'

export const projectRouter = Router()

projectRouter.use(authenticate, requireWorkspace)
projectRouter.get('/', getProjects)
projectRouter.get('/:projectId', getProjectById)
projectRouter.post('/', requireWorkspaceRole('ADMIN', 'MANAGER'), postProject)
projectRouter.patch('/:projectId', requireWorkspaceRole('ADMIN', 'MANAGER'), patchProject)
projectRouter.put('/:projectId/members', requireWorkspaceRole('ADMIN', 'MANAGER'), putProjectMembers)
projectRouter.delete('/:projectId', requireWorkspaceRole('ADMIN'), removeProject)
