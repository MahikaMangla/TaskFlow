import { app } from './app.js'
import { env } from './config/env.js'

const server = app.listen(env.port, () => {
  console.log(`TaskFlow API listening on http://localhost:${env.port}`)
})

function shutDown(signal) {
  console.log(`${signal} received. Closing TaskFlow API...`)
  server.close(() => process.exit(0))
}

process.on('SIGINT', () => shutDown('SIGINT'))
process.on('SIGTERM', () => shutDown('SIGTERM'))
