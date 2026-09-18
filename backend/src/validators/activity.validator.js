import { AppError } from '../utils/app-error.js'

function optionalId(value, name) {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !value.trim()) throw new AppError(400, `${name} must be a non-empty string.`)
  return value.trim()
}

export function validateActivityQuery(query) {
  const page = query.page === undefined ? 1 : Number(query.page)
  const limit = query.limit === undefined ? 20 : Number(query.limit)
  if (!Number.isInteger(page) || page < 1) throw new AppError(400, 'page must be a positive integer.')
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new AppError(400, 'limit must be an integer from 1 to 100.')
  return {
    page, limit,
    ...(query.type !== undefined ? { type: String(query.type) } : {}),
    actorId: optionalId(query.actorId, 'actorId'), projectId: optionalId(query.projectId, 'projectId'),
    sprintId: optionalId(query.sprintId, 'sprintId'), taskId: optionalId(query.taskId, 'taskId'),
  }
}
