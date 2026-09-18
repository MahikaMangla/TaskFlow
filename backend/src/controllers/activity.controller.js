import { listActivities } from '../services/activity.service.js'
import { asyncHandler } from '../utils/async-handler.js'
import { validateActivityQuery } from '../validators/activity.validator.js'

export const getActivities = asyncHandler(async (request, response) => {
  response.status(200).json(await listActivities(request.workspace.id, validateActivityQuery(request.query)))
})
