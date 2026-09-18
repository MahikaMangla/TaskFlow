import { prisma } from '../lib/prisma.js'
import { verifyAccessToken } from '../services/token.service.js'
import { AppError } from '../utils/app-error.js'
import { asyncHandler } from '../utils/async-handler.js'

export const authenticate = asyncHandler(async (request, _response, next) => {
  const authorization = request.headers.authorization
  if (!authorization?.startsWith('Bearer ')) throw new AppError(401, 'Authentication is required.')

  let payload
  try {
    payload = verifyAccessToken(authorization.slice(7))
  } catch {
    throw new AppError(401, 'Access token is invalid or expired.')
  }
  if (payload.type !== 'access' || typeof payload.sub !== 'string') throw new AppError(401, 'Access token is invalid.')

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user) throw new AppError(401, 'Account no longer exists.')
  request.user = user
  next()
})
