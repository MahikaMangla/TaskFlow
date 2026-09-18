import { getDashboard, getReportsOverview } from '../services/analytics.service.js'
import { asyncHandler } from '../utils/async-handler.js'

export const dashboard = asyncHandler(async (request, response) => response.status(200).json({ dashboard: await getDashboard(request.workspace.id) }))
export const reportsOverview = asyncHandler(async (request, response) => response.status(200).json({ report: await getReportsOverview(request.workspace.id) }))
