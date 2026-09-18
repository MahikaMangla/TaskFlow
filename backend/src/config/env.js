import 'dotenv/config'

const allowedEnvironments = new Set(['development', 'test', 'production'])

function parsePort(value) {
  const port = Number(value)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a whole number between 1 and 65535.')
  }

  return port
}

function parsePositiveInteger(value, name) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive whole number.`)
  }
  return parsed
}

function requireSecret(value, name) {
  if (!value || value.length < 32) {
    throw new Error(`${name} must be at least 32 characters long.`)
  }
  return value
}

function parseCorsOrigins(value) {
  const origins = value.split(',').map((origin) => origin.trim()).filter(Boolean)
  if (!origins.length || origins.includes('*')) throw new Error('CORS_ORIGIN must contain one or more explicit origins.')
  return origins
}

const nodeEnv = process.env.NODE_ENV ?? 'development'

if (!allowedEnvironments.has(nodeEnv)) {
  throw new Error('NODE_ENV must be development, test, or production.')
}

export const env = Object.freeze({
  nodeEnv,
  port: parsePort(process.env.PORT ?? '4000'),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN ?? 'http://localhost:5173'),
  jwtAccessSecret: requireSecret(process.env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET'),
  jwtRefreshSecret: requireSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  invitationExpiresDays: parsePositiveInteger(process.env.INVITATION_EXPIRES_DAYS ?? '7', 'INVITATION_EXPIRES_DAYS'),
  appOrigin: (process.env.APP_ORIGIN ?? process.env.CORS_ORIGIN?.split(',')[0] ?? 'http://localhost:5173').replace(/\/$/, ''),
  bcryptSaltRounds: parsePositiveInteger(process.env.BCRYPT_SALT_ROUNDS ?? '12', 'BCRYPT_SALT_ROUNDS'),
  isProduction: nodeEnv === 'production',
})
