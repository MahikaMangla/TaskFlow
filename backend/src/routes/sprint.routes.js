import { Router } from 'express'
import { addTasksToSprint, deleteTaskFromSprint, getSprintById, getSprints, getTasksForSprint, patchSprint, postSprint, removeSprint } from '../controllers/sprint.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireWorkspace, requireWorkspaceRole } from '../middleware/workspace-context.js'

export const sprintRouter = Router()

sprintRouter.use(authenticate, requireWorkspace)
sprintRouter.get('/', getSprints)
sprintRouter.post('/', requireWorkspaceRole('ADMIN', 'MANAGER'), postSprint)
sprintRouter.get('/:sprintId', getSprintById)
sprintRouter.patch('/:sprintId', requireWorkspaceRole('ADMIN', 'MANAGER'), patchSprint)
sprintRouter.delete('/:sprintId', requireWorkspaceRole('ADMIN'), removeSprint)
sprintRouter.get('/:sprintId/tasks', getTasksForSprint)
sprintRouter.post('/:sprintId/tasks', addTasksToSprint)
sprintRouter.delete('/:sprintId/tasks/:taskId', deleteTaskFromSprint)
