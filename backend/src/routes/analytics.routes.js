import { Router } from 'express'
import { dashboard, reportsOverview } from '../controllers/analytics.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireWorkspace } from '../middleware/workspace-context.js'

export const dashboardRouter = Router()
dashboardRouter.use(authenticate, requireWorkspace)
dashboardRouter.get('/', dashboard)

export const reportsRouter = Router()
reportsRouter.use(authenticate, requireWorkspace)
reportsRouter.get('/overview', reportsOverview)
