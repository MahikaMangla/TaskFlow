import { AppError } from '../utils/app-error.js'

const statuses = new Set(['planning', 'active', 'paused', 'completed'])

function optionalString(value, field, max = 5000) {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'string' || value.trim().length > max) throw new AppError(400, `${field} must be a string up to ${max} characters.`)
  return value.trim()
}

function requiredString(value, field, min, max) {
  const result = optionalString(value, field, max)
  if (!result || result.length < min) throw new AppError(400, `${field} must be between ${min} and ${max} characters.`)
  return result
}

function date(value, field, required = false) {
  if (value === undefined && !required) return undefined
  const parsed = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : null
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new AppError(400, `${field} must be a valid YYYY-MM-DD date.`)
  return parsed
}

function status(value) {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !statuses.has(value)) throw new AppError(400, 'Sprint status is invalid.')
  return value.toUpperCase()
}

function points(value, field) {
  if (value === undefined) return undefined
  if (!Number.isInteger(value) || value < 0 || value > 100_000) throw new AppError(400, `${field} must be a whole number from 0 to 100000.`)
  return value
}

export function validateSprint(body = {}, { partial = false } = {}) {
  const data = {
    name: partial ? optionalString(body.name, 'Sprint name', 120) : requiredString(body.name, 'Sprint name', 2, 120),
    goal: partial ? optionalString(body.goal, 'Sprint goal', 500) : requiredString(body.goal, 'Sprint goal', 2, 500),
    description: optionalString(body.description, 'Description'),
    status: status(body.status), startDate: date(body.startDate, 'Start date', !partial), endDate: date(body.endDate, 'End date', !partial),
    committedPoints: points(body.committedPoints, 'Committed points'),
  }
  if (data.startDate && data.endDate && data.endDate < data.startDate) throw new AppError(400, 'End date must not be before start date.')
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
}

export function validateTaskIds(body = {}) {
  if (!Array.isArray(body.taskIds) || body.taskIds.length === 0 || body.taskIds.length > 100 || body.taskIds.some((id) => typeof id !== 'string' || !id.trim() || id.length > 255)) throw new AppError(400, 'taskIds must contain 1 to 100 IDs.')
  return [...new Set(body.taskIds)]
}
