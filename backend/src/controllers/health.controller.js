import { env } from '../config/env.js'

export function getHealth(_request, response) {
  response.status(200).json({
    status: 'ok',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  })
}
