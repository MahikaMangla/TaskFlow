import { env } from '../config/env.js'

export function errorHandler(error, _request, response, _next) {
  const isMalformedJson = error instanceof SyntaxError && error.type === 'entity.parse.failed'
  const statusCode = isMalformedJson ? 400 : Number.isInteger(error.statusCode) ? error.statusCode : 500
  const message = statusCode >= 500 && env.isProduction
    ? 'An unexpected error occurred.'
    : isMalformedJson ? 'Request body contains invalid JSON.' : error.message || 'An unexpected error occurred.'

  const body = { error: { message } }

  if (!env.isProduction && error.stack) {
    body.error.stack = error.stack
  }

  response.status(statusCode).json(body)
}
