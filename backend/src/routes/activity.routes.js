import { Router } from 'express'
import { getActivities } from '../controllers/activity.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireWorkspace } from '../middleware/workspace-context.js'

export const activityRouter = Router()
activityRouter.use(authenticate, requireWorkspace)
activityRouter.get('/', getActivities)
