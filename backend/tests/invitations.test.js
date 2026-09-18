import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

async function register(baseUrl, label) {
  const email = `${label}-${randomUUID()}@example.com`
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: `${label} User`,
      email,
      password: 'SecurePassword123',
      workspaceName: `${label} Workspace`,
    }),
  })
  assert.equal(response.status, 201)
  return { ...(await response.json()), email }
}

test('workspace invitations support create, preview, accept, revoke, and one-time use', async () => {
  const server = app.listen(0)
  const userIds = []
  let workspaceId

  try {
    await new Promise((resolve) => server.once('listening', resolve))
    const baseUrl = `http://127.0.0.1:${server.address().port}`

    const admin = await register(baseUrl, 'InviteAdmin')
    const member = await register(baseUrl, 'InviteMember')
    userIds.push(admin.user.id, member.user.id)

    const adminMembership = await prisma.workspaceMember.findFirst({ where: { userId: admin.user.id } })
    workspaceId = adminMembership.workspaceId
    await prisma.workspaceMember.create({
      data: { workspaceId, userId: member.user.id, role: 'MEMBER' },
    })

    const adminHeaders = {
      authorization: `Bearer ${admin.tokens.accessToken}`,
      'content-type': 'application/json',
      'x-workspace-id': workspaceId,
    }
    const memberHeaders = {
      authorization: `Bearer ${member.tokens.accessToken}`,
      'content-type': 'application/json',
      'x-workspace-id': workspaceId,
    }

    const deniedCreate = await fetch(`${baseUrl}/api/workspaces/invitations`, {
      method: 'POST',
      headers: memberHeaders,
      body: JSON.stringify({ email: 'new-member@example.com', name: 'New Member', title: 'Engineer' }),
    })
    assert.equal(deniedCreate.status, 403)

    const inviteEmail = `invitee-${randomUUID()}@example.com`
    const createResponse = await fetch(`${baseUrl}/api/workspaces/invitations`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        email: inviteEmail,
        role: 'member',
        name: 'Invited Member',
        title: 'Product Designer',
        roleKey: 'product_designer',
        department: 'design',
      }),
    })
    const created = await createResponse.json()
    assert.equal(createResponse.status, 201)
    assert.equal(created.invitation.email, inviteEmail)
    assert.equal(created.invitation.status, 'pending')
    assert.match(created.acceptUrl, /accept-invitation\?token=/)

    const token = new URL(created.acceptUrl).searchParams.get('token')
    assert.ok(token)

    const previewResponse = await fetch(`${baseUrl}/api/invitations/preview?token=${encodeURIComponent(token)}`)
    const preview = await previewResponse.json()
    assert.equal(previewResponse.status, 200)
    assert.equal(preview.invitation.email, inviteEmail)
    assert.equal(preview.requiresAccount, true)
    assert.equal(preview.invitation.metadata.title, 'Product Designer')

    const listResponse = await fetch(`${baseUrl}/api/workspaces/invitations`, { headers: adminHeaders })
    const listed = await listResponse.json()
    assert.equal(listResponse.status, 200)
    assert.equal(listed.invitations.some((invitation) => invitation.id === created.invitation.id), true)

    const acceptResponse = await fetch(`${baseUrl}/api/invitations/accept`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, name: 'Invited Member', password: 'SecurePassword456' }),
    })
    const accepted = await acceptResponse.json()
    assert.equal(acceptResponse.status, 200)
    assert.equal(accepted.user.email, inviteEmail)
    assert.equal(typeof accepted.tokens.accessToken, 'string')
    userIds.push(accepted.user.id)

    const membersResponse = await fetch(`${baseUrl}/api/workspaces/members`, { headers: adminHeaders })
    const members = await membersResponse.json()
    assert.equal(membersResponse.status, 200)
    assert.equal(members.members.some((item) => item.email === inviteEmail), true)

    const reusedResponse = await fetch(`${baseUrl}/api/invitations/accept`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, name: 'Invited Member', password: 'SecurePassword456' }),
    })
    assert.equal(reusedResponse.status, 410)

    const secondInviteEmail = `existing-${randomUUID()}@example.com`
    const existingInvitee = await register(baseUrl, 'ExistingInvitee')
    userIds.push(existingInvitee.user.id)

    const createExistingResponse = await fetch(`${baseUrl}/api/workspaces/invitations`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ email: existingInvitee.email, role: 'manager' }),
    })
    const existingInvite = await createExistingResponse.json()
    assert.equal(createExistingResponse.status, 201)

    const existingToken = new URL(existingInvite.acceptUrl).searchParams.get('token')
    const unauthenticatedAccept = await fetch(`${baseUrl}/api/invitations/accept`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: existingToken }),
    })
    assert.equal(unauthenticatedAccept.status, 401)

    const wrongAccountAccept = await fetch(`${baseUrl}/api/invitations/accept`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${admin.tokens.accessToken}`,
      },
      body: JSON.stringify({ token: existingToken }),
    })
    assert.equal(wrongAccountAccept.status, 401)

    const authenticatedAccept = await fetch(`${baseUrl}/api/invitations/accept`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${existingInvitee.tokens.accessToken}`,
      },
      body: JSON.stringify({ token: existingToken }),
    })
    assert.equal(authenticatedAccept.status, 200)

    const acceptedMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: existingInvitee.user.id } },
    })
    assert.equal(acceptedMembership.role, 'MANAGER')
    assert.equal(await prisma.user.count({ where: { email: existingInvitee.user.email } }), 1)
    const acceptedInvitation = await prisma.invitation.findUnique({ where: { id: existingInvite.invitation.id } })
    assert.equal(acceptedInvitation.status, 'ACCEPTED')
    assert.ok(acceptedInvitation.acceptedAt)

    const afterAcceptList = await fetch(`${baseUrl}/api/workspaces/invitations`, { headers: adminHeaders })
    const invitationsAfterAccept = await afterAcceptList.json()
    assert.equal(invitationsAfterAccept.invitations.some((invitation) => invitation.id === existingInvite.invitation.id && invitation.status === 'pending'), false)

    const reusedExistingInvite = await fetch(`${baseUrl}/api/invitations/accept`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${existingInvitee.tokens.accessToken}`,
      },
      body: JSON.stringify({ token: existingToken }),
    })
    assert.equal(reusedExistingInvite.status, 410)

    const revokeTargetEmail = `revoke-${randomUUID()}@example.com`
    const revokeCreateResponse = await fetch(`${baseUrl}/api/workspaces/invitations`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ email: revokeTargetEmail, title: 'Temp' }),
    })
    const revokeCreated = await revokeCreateResponse.json()
    assert.equal(revokeCreateResponse.status, 201)

    const revokeResponse = await fetch(`${baseUrl}/api/workspaces/invitations/${revokeCreated.invitation.id}`, {
      method: 'DELETE',
      headers: adminHeaders,
    })
    const revoked = await revokeResponse.json()
    assert.equal(revokeResponse.status, 200)
    assert.equal(revoked.invitation.status, 'revoked')

    const revokedPreview = await fetch(
      `${baseUrl}/api/invitations/preview?token=${encodeURIComponent(new URL(revokeCreated.acceptUrl).searchParams.get('token'))}`,
    )
    assert.equal(revokedPreview.status, 410)
  } finally {
    if (workspaceId) {
      await prisma.workspace.delete({ where: { id: workspaceId } }).catch(() => {})
    }
    for (const userId of userIds) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    }
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
    await prisma.$disconnect()
  }
})
