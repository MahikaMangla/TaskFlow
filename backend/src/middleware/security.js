import { AppError } from '../utils/app-error.js'
import { env } from '../config/env.js'

export function securityHeaders(request, response, next) {
  response.set({
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  })
  if (env.isProduction && request.secure) response.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains')
  next()
}

export function corsOptions(origin, callback) {
  if (!origin || env.corsOrigins.includes(origin)) return callback(null, true)
  return callback(new AppError(403, 'Origin is not allowed by CORS policy.'))
}

export function createRateLimiter({ windowMs, max, key = (request) => request.ip }) {
  const requests = new Map()
  return (request, response, next) => {
    const now = Date.now()
    const bucketKey = `${key(request)}:${request.path}`
    const entries = (requests.get(bucketKey) ?? []).filter((timestamp) => timestamp > now - windowMs)
    if (entries.length >= max) {
      response.set('Retry-After', String(Math.ceil((entries[0] + windowMs - now) / 1000)))
      return next(new AppError(429, 'Too many requests. Please try again later.'))
    }
    entries.push(now)
    requests.set(bucketKey, entries)
    next()
  }
}
