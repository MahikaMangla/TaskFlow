import { login, logout, refresh, register, toPublicUser } from '../services/auth.service.js'
import { asyncHandler } from '../utils/async-handler.js'
import { validateLogin, validateRefresh, validateRegistration } from '../validators/auth.validator.js'

function metadataFrom(request) {
  return { userAgent: request.get('user-agent')?.slice(0, 500), ipAddress: request.ip }
}

export const registerUser = asyncHandler(async (request, response) => {
  const result = await register(validateRegistration(request.body), metadataFrom(request))
  response.status(201).json(result)
})

export const loginUser = asyncHandler(async (request, response) => {
  const result = await login(validateLogin(request.body), metadataFrom(request))
  response.status(200).json(result)
})

export const refreshSession = asyncHandler(async (request, response) => {
  const { refreshToken } = validateRefresh(request.body)
  const result = await refresh(refreshToken, metadataFrom(request))
  response.status(200).json(result)
})

export const logoutUser = asyncHandler(async (request, response) => {
  const refreshToken = typeof request.body?.refreshToken === 'string' ? request.body.refreshToken : null
  await logout(refreshToken)
  response.status(204).end()
})

export const getCurrentUser = asyncHandler(async (request, response) => {
  response.status(200).json({ user: toPublicUser(request.user) })
})
