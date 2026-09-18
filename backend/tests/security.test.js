import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

test('security middleware rejects unsafe requests and preserves valid API behavior', async () => {
  const server = app.listen(0)
  const userIds = []
  const workspaceIds = []
  try {
    await new Promise((resolve) => server.once('listening', resolve))
    const baseUrl = `http://127.0.0.1:${server.address().port}`

    const health = await fetch(`${baseUrl}/api/health`, { headers: { origin: 'http://localhost:5173' } })
    assert.equal(health.status, 200)
    assert.equal(health.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(health.headers.get('x-frame-options'), 'DENY')
    assert.equal(health.headers.get('content-security-policy').includes("default-src 'none'"), true)
    assert.equal(health.headers.get('access-control-allow-origin'), 'http://localhost:5173')
    assert.equal((await fetch(`${baseUrl}/api/health`, { headers: { origin: 'https://untrusted.example' } })).status, 403)

    const malformed = await fetch(`${baseUrl}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad json' })
    assert.equal(malformed.status, 400)
    assert.equal((await malformed.json()).error.message, 'Request body contains invalid JSON.')

    const registration = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Security User', email: `security-${randomUUID()}@example.com`, password: 'SafePassword123', workspaceName: 'Security Workspace' }),
    })
    assert.equal(registration.status, 201)
    const account = await registration.json()
    userIds.push(account.user.id)
    const membership = await prisma.workspaceMember.findFirst({ where: { userId: account.user.id } })
    workspaceIds.push(membership.workspaceId)
    const headers = { authorization: `Bearer ${account.tokens.accessToken}`, 'content-type': 'application/json' }
    const projectResponse = await fetch(`${baseUrl}/api/projects`, { method: 'POST', headers, body: JSON.stringify({ name: 'Security Project' }) })
    assert.equal(projectResponse.status, 201)
    const project = (await projectResponse.json()).project
    const invalidDate = await fetch(`${baseUrl}/api/tasks`, { method: 'POST', headers, body: JSON.stringify({ title: 'Invalid date', projectId: project.id, dueDate: '2026-02-30' }) })
    assert.equal(invalidDate.status, 400)
    const tooManyLabels = await fetch(`${baseUrl}/api/tasks`, { method: 'POST', headers, body: JSON.stringify({ title: 'Many labels', projectId: project.id, labels: Array.from({ length: 51 }, (_, index) => `label-${index}`) }) })
    assert.equal(tooManyLabels.status, 400)
    assert.equal((await fetch(`${baseUrl}/api/tasks?search=${'a'.repeat(201)}`, { headers })).status, 400)

    let throttled
    for (let attempt = 0; attempt < 11; attempt += 1) {
      throttled = await fetch(`${baseUrl}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'unknown@example.com', password: 'SafePassword123' }) })
    }
    assert.equal(throttled.status, 429)
    assert.equal(throttled.headers.has('retry-after'), true)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    for (const workspaceId of workspaceIds) await prisma.workspace.delete({ where: { id: workspaceId } }).catch(() => {})
    for (const userId of userIds) await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    await prisma.$disconnect()
  }
})
