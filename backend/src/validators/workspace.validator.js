import { AppError } from '../utils/app-error.js'

const projectStatuses = new Set(['planning', 'active', 'on-hold', 'completed', 'archived'])
const priorities = new Set(['low', 'medium', 'high', 'critical'])
const availability = new Set(['available', 'busy', 'away', 'offline'])
const projectRoles = new Set(['project-manager', 'frontend-developer', 'backend-developer', 'developer', 'ui-ux-designer', 'qa-engineer', 'product-manager'])

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

function optionalDate(value, field) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const parsed = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : null
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new AppError(400, `${field} must be a valid YYYY-MM-DD date.`)
  return parsed
}

function enumValue(value, field, allowed) {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !allowed.has(value)) throw new AppError(400, `${field} is invalid.`)
  return value.toUpperCase().replace('-', '_')
}

export function validateProject(body = {}, { partial = false } = {}) {
  const data = {
    name: partial ? optionalString(body.name, 'Name', 120) : requiredString(body.name, 'Name', 2, 120),
    description: optionalString(body.description, 'Description'),
    color: optionalString(body.color, 'Color', 20),
    status: enumValue(body.status, 'Project status', projectStatuses),
    priority: enumValue(body.priority, 'Project priority', priorities),
    startDate: optionalDate(body.startDate, 'Start date'),
    endDate: optionalDate(body.endDate, 'End date'),
  }
  if (data.startDate && data.endDate && data.endDate < data.startDate) throw new AppError(400, 'End date must not be before start date.')
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
}

export function validateMemberUpdate(body = {}) {
  const data = {
    name: optionalString(body.name, 'Name', 100), title: optionalString(body.title, 'Title', 120),
    roleKey: optionalString(body.roleKey, 'Role key', 100), department: optionalString(body.department, 'Department', 100),
    color: optionalString(body.color, 'Color', 20), avatarUrl: optionalString(body.avatarUrl, 'Avatar URL', 2048),
    bio: optionalString(body.bio, 'Bio'), location: optionalString(body.location, 'Location', 160), timezone: optionalString(body.timezone, 'Timezone', 100),
    availability: enumValue(body.availability, 'Availability', availability),
  }
  if (body.capacity !== undefined) {
    if (!Number.isInteger(body.capacity) || body.capacity < 0 || body.capacity > 200) throw new AppError(400, 'Capacity must be a whole number from 0 to 200.')
    data.capacity = body.capacity
  }
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
}

export function validateMemberIds(body = {}) {
  if (!Array.isArray(body.memberIds) || body.memberIds.length > 100 || body.memberIds.some((id) => typeof id !== 'string' || !id || id.length > 255)) throw new AppError(400, 'memberIds must contain at most 100 user IDs.')
  return [...new Set(body.memberIds)]
}

export function validateProjectMembers(body = {}) {
  if (Array.isArray(body.memberIds)) {
    return validateMemberIds(body).map((userId) => ({ userId, role: 'DEVELOPER' }))
  }
  if (!Array.isArray(body.members) || body.members.length > 100) {
    throw new AppError(400, 'members must contain at most 100 project members.')
  }

  const byUserId = new Map()
  for (const member of body.members) {
    if (!member || typeof member.userId !== 'string' || !member.userId.trim() || member.userId.length > 255) {
      throw new AppError(400, 'Each project member must include a userId.')
    }
    const role = member.role ?? member.projectRole ?? 'developer'
    if (typeof role !== 'string' || !projectRoles.has(role)) {
      throw new AppError(400, 'Project role is invalid.')
    }
    byUserId.set(member.userId.trim(), { userId: member.userId.trim(), role: role.toUpperCase().replaceAll('-', '_') })
  }
  return [...byUserId.values()]
}
