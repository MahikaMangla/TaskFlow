import assert from 'node:assert/strict'
import test from 'node:test'
import { app } from '../src/app.js'

test('GET /api/health returns service status', async () => {
  const server = app.listen(0)

  try {
    await new Promise((resolve) => server.once('listening', resolve))
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/health`)
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.status, 'ok')
    assert.equal(typeof body.environment, 'string')
    assert.equal(typeof body.timestamp, 'string')
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    )
  }
})
