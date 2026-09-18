import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'
import { healthRouter } from './routes/health.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { projectRouter } from './routes/project.routes.js'
import { workspaceRouter } from './routes/workspace.routes.js'
import { taskRouter } from './routes/task.routes.js'
import { sprintRouter } from './routes/sprint.routes.js'
import { activityRouter } from './routes/activity.routes.js'
import { dashboardRouter, reportsRouter } from './routes/analytics.routes.js'
import { invitationRouter } from './routes/invitation.routes.js'
import { corsOptions, securityHeaders } from './middleware/security.js'

export const app = express()

app.disable('x-powered-by')
app.use(securityHeaders)
app.use(cors({ origin: corsOptions }))
app.use(express.json({ limit: '1mb' }))

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/invitations', invitationRouter)
app.use('/api/workspaces', workspaceRouter)
app.use('/api/projects', projectRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/sprints', sprintRouter)
app.use('/api/activity', activityRouter)
app.use('/api/activities', activityRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/reports', reportsRouter)

app.use(notFound)
app.use(errorHandler)
