import { Router } from 'express'
import { getLabels, getTaskById, getTasks, patchTask, patchTaskStatus, postTask, removeTask } from '../controllers/task.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireWorkspace } from '../middleware/workspace-context.js'

export const taskRouter = Router()
taskRouter.use(authenticate, requireWorkspace)
taskRouter.get('/labels', getLabels)
taskRouter.get('/', getTasks)
taskRouter.post('/', postTask)
taskRouter.get('/:taskId', getTaskById)
taskRouter.patch('/:taskId', patchTask)
taskRouter.patch('/:taskId/status', patchTaskStatus)
taskRouter.delete('/:taskId', removeTask)
