import { AppError } from '../utils/app-error.js'

function requireString(value, field, { min = 1, max = 255 } = {}) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
    throw new AppError(400, `${field} must be between ${min} and ${max} characters.`)
  }
  return value.trim()
}

function requireEmail(value) {
  const email = requireString(value, 'Email', { min: 3, max: 320 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError(400, 'Email must be valid.')
  return email
}

function requirePassword(value) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) throw new AppError(400, 'Password must be between 8 and 128 characters.')
  const password = value
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new AppError(400, 'Password must include at least one letter and one number.')
  return password
}

export function validateRegistration(body = {}) {
  return {
    name: requireString(body.name, 'Name', { min: 2, max: 100 }),
    email: requireEmail(body.email),
    password: requirePassword(body.password),
    workspaceName: body.workspaceName === undefined ? undefined : requireString(body.workspaceName, 'Workspace name', { min: 2, max: 100 }),
  }
}

export function validateLogin(body = {}) {
  if (typeof body.password !== 'string' || body.password.length < 1 || body.password.length > 128) throw new AppError(400, 'Password must be between 1 and 128 characters.')
  return { email: requireEmail(body.email), password: body.password }
}

export function validateRefresh(body = {}) {
  return { refreshToken: requireString(body.refreshToken, 'Refresh token', { min: 20, max: 4096 }) }
}
