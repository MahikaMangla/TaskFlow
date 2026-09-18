import { AppError } from '../utils/app-error.js'

const statuses = new Set(['todo', 'in_progress', 'in_review', 'done'])
const priorities = new Set(['low', 'medium', 'high', 'critical'])
const storyPointValues = new Set([1, 2, 3, 5, 8, 13, 21])

function optionalString(value, field, max = 5000) {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'string' || value.trim().length > max) throw new AppError(400, `${field} must be a string up to ${max} characters.`)
  return value.trim()
}

function requiredString(value, field, min = 1, max = 255) {
  const result = optionalString(value, field, max)
  if (!result || result.length < min) throw new AppError(400, `${field} must be between ${min} and ${max} characters.`)
  return result
}

function optionalDate(value) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const parsed = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : null
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new AppError(400, 'Due date must be a valid YYYY-MM-DD date.')
  return parsed
}

function enumValue(value, field, allowed) {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !allowed.has(value)) throw new AppError(400, `${field} is invalid.`)
  return value.toUpperCase()
}

function optionalId(value, field) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (typeof value !== 'string' || !value.trim()) throw new AppError(400, `${field} must be an ID or null.`)
  return value.trim()
}

function labels(value) {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.length > 50 || value.some((item) => typeof item !== 'string' || !item.trim() || item.trim().length > 80)) throw new AppError(400, 'Labels must contain at most 50 names up to 80 characters each.')
  return [...new Set(value.map((item) => item.trim().toLowerCase()))]
}

export function validateTask(body = {}, { partial = false } = {}) {
  const data = {
    title: partial ? optionalString(body.title, 'Title', 200) : requiredString(body.title, 'Title', 1, 200),
    description: optionalString(body.description, 'Description'),
    status: enumValue(body.status, 'Task status', statuses), priority: enumValue(body.priority, 'Task priority', priorities),
    projectId: partial ? optionalId(body.projectId, 'Project') : requiredString(body.projectId, 'Project', 1, 255),
    sprintId: optionalId(body.sprintId, 'Sprint'), assigneeId: optionalId(body.assigneeId, 'Assignee'),
    dueDate: optionalDate(body.dueDate), labels: labels(body.labels),
  }
  if (body.storyPoints !== undefined) {
    if (body.storyPoints === null || body.storyPoints === '') data.storyPoints = null
    else if (!Number.isInteger(body.storyPoints) || !storyPointValues.has(body.storyPoints)) throw new AppError(400, 'Story points must be one of 1, 2, 3, 5, 8, 13, or 21.')
    else data.storyPoints = body.storyPoints
  }
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
}

export function validateTaskMove(body = {}) {
  const status = enumValue(body.status, 'Task status', statuses)
  if (!status) throw new AppError(400, 'Task status is required.')
  if (body.order !== undefined && (!Number.isInteger(body.order) || body.order < 0)) throw new AppError(400, 'Order must be a non-negative whole number.')
  return { status, order: body.order }
}

export function validateTaskQuery(query = {}) {
  const allowedSorts = new Set(['updated-desc', 'dueDate-asc', 'dueDate-desc', 'priority-desc', 'priority-asc'])
  if (query.sort !== undefined && (!allowedSorts.has(query.sort))) throw new AppError(400, 'Sort option is invalid.')
  const queryValue = (value, field, max = 255) => {
    if (value === undefined) return undefined
    if (typeof value !== 'string' || !value.trim() || value.length > max) throw new AppError(400, `${field} is invalid.`)
    return value.trim()
  }
  return {
    projectId: queryValue(query.projectId, 'projectId'),
    sprintId: queryValue(query.sprintId, 'sprintId'),
    assigneeId: queryValue(query.assigneeId, 'assigneeId'),
    status: query.status === 'all' || query.status === undefined ? undefined : enumValue(query.status, 'Task status', statuses),
    priority: query.priority === 'all' || query.priority === undefined ? undefined : enumValue(query.priority, 'Task priority', priorities),
    label: query.label === undefined ? undefined : queryValue(query.label, 'label', 80).toLowerCase(),
    search: query.search === undefined ? undefined : queryValue(query.search, 'search', 200),
    sort: query.sort ?? 'updated-desc',
  }
}
