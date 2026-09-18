import { AppError } from '../utils/app-error.js'

const workspaceRoles = new Set(['member', 'manager', 'admin'])
const availability = new Set(['available', 'busy', 'away', 'offline'])

function requireEmail(value) {
  if (typeof value !== 'string' || value.trim().length < 3 || value.trim().length > 320) {
    throw new AppError(400, 'Email must be between 3 and 320 characters.')
  }
  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError(400, 'Email must be valid.')
  return email
}

function optionalString(value, field, max = 5000) {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string' || value.trim().length > max) {
    throw new AppError(400, `${field} must be a string up to ${max} characters.`)
  }
  return value.trim()
}

function requirePassword(value) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) {
    throw new AppError(400, 'Password must be between 8 and 128 characters.')
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    throw new AppError(400, 'Password must include at least one letter and one number.')
  }
  return value
}

function requireToken(value) {
  if (typeof value !== 'string' || value.length < 20 || value.length > 512) {
    throw new AppError(400, 'Invitation token is invalid.')
  }
  return value
}

export function validateInvitationCreate(body = {}) {
  const email = requireEmail(body.email)
  const role = body.role === undefined ? 'MEMBER' : optionalWorkspaceRole(body.role)
  const metadata = {}

  const name = optionalString(body.name, 'Name', 100)
  const title = optionalString(body.title, 'Title', 120)
  const roleKey = optionalString(body.roleKey, 'Role key', 100)
  const department = optionalString(body.department, 'Department', 100)
  const color = optionalString(body.color, 'Color', 20)
  const location = optionalString(body.location, 'Location', 160)
  const bio = optionalString(body.bio, 'Bio')

  if (name) metadata.name = name
  if (title) metadata.title = title
  if (roleKey) metadata.roleKey = roleKey
  if (department) metadata.department = department
  if (color) metadata.color = color
  if (location) metadata.location = location
  if (bio) metadata.bio = bio

  if (body.availability !== undefined) {
    if (typeof body.availability !== 'string' || !availability.has(body.availability)) {
      throw new AppError(400, 'Availability is invalid.')
    }
    metadata.availability = body.availability
  }

  return {
    email,
    role,
    metadata: Object.keys(metadata).length ? metadata : null,
  }
}

export function validateInvitationAccept(body = {}) {
  const token = requireToken(body.token)
  const name = optionalString(body.name, 'Name', 100)
  const password = body.password === undefined ? undefined : requirePassword(body.password)

  if (password && !name) throw new AppError(400, 'Name is required when setting a password.')
  if (name && !password) throw new AppError(400, 'Password is required when creating a new account.')

  return { token, name, password }
}

function optionalWorkspaceRole(value) {
  if (typeof value !== 'string' || !workspaceRoles.has(value)) {
    throw new AppError(400, 'Workspace role is invalid.')
  }
  return value.toUpperCase()
}
