import { createHash, randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

function getExpirationDate(token) {
  const decoded = jwt.decode(token)
  if (!decoded?.exp) throw new Error('JWT is missing an expiration time.')
  return new Date(decoded.exp * 1000)
}

export function createAccessToken(userId) {
  return jwt.sign({ sub: userId, type: 'access' }, env.jwtAccessSecret, {
    algorithm: 'HS256', expiresIn: env.jwtAccessExpiresIn,
  })
}

export function createRefreshToken(userId) {
  const tokenId = randomUUID()
  const token = jwt.sign({ sub: userId, jti: tokenId, type: 'refresh' }, env.jwtRefreshSecret, {
    algorithm: 'HS256', expiresIn: env.jwtRefreshExpiresIn,
  })
  return { token, tokenId, tokenHash: hashToken(token), expiresAt: getExpirationDate(token) }
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret, { algorithms: ['HS256'] })
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret, { algorithms: ['HS256'] })
}

export function getTokenHash(token) {
  return hashToken(token)
}
