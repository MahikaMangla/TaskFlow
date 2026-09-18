import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import bcrypt from 'bcrypt'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

test('authentication lifecycle registers, refreshes, and revokes a session', async () => {
  const server = app.listen(0)
  const email = `auth-test-${randomUUID()}@example.com`
  let userId

  try {
    await new Promise((resolve) => server.once('listening', resolve))
    const baseUrl = `http://127.0.0.1:${server.address().port}`
    const password = 'SecurePassword123'

    const registration = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Auth Test User', email, password, workspaceName: 'Auth Test Workspace' }),
    })
    const registered = await registration.json()
    userId = registered.user.id

    assert.equal(registration.status, 201)
    assert.equal(registered.user.email, email)
    assert.equal(typeof registered.tokens.accessToken, 'string')
    assert.equal(typeof registered.tokens.refreshToken, 'string')
    assert.equal('passwordHash' in registered.user, false)

    const storedUser = await prisma.user.findUnique({ where: { id: userId } })
    assert.equal(await bcrypt.compare(password, storedUser.passwordHash), true)

    const me = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { authorization: `Bearer ${registered.tokens.accessToken}` },
    })
    assert.equal(me.status, 200)

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const loggedIn = await loginResponse.json()
    assert.equal(loginResponse.status, 200)
    assert.equal(loggedIn.user.id, userId)

    const refreshedResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: loggedIn.tokens.refreshToken }),
    })
    const refreshed = await refreshedResponse.json()
    assert.equal(refreshedResponse.status, 200)
    assert.notEqual(refreshed.tokens.refreshToken, registered.tokens.refreshToken)

    const reusedResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: loggedIn.tokens.refreshToken }),
    })
    assert.equal(reusedResponse.status, 401)

    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshed.tokens.refreshToken }),
    })
    assert.equal(logout.status, 204)

    const revokedResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshed.tokens.refreshToken }),
    })
    assert.equal(revokedResponse.status, 401)
  } finally {
    if (userId) {
      const membership = await prisma.workspaceMember.findFirst({ where: { userId } })
      if (membership) await prisma.workspace.delete({ where: { id: membership.workspaceId } })
      await prisma.user.delete({ where: { id: userId } })
    }
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
    await prisma.$disconnect()
  }
})
