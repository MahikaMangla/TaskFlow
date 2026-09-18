import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

async function register(baseUrl, label) {
  const email = `${label}-${randomUUID()}@example.com`
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: `${label} User`, email, password: 'SecurePassword123', workspaceName: `${label} Workspace` }),
  })
  assert.equal(response.status, 201)
  return response.json()
}

test('workspace and project APIs enforce workspace membership and roles', async () => {
  const server = app.listen(0)
  const userIds = []
  const workspaceIds = []

  try {
    await new Promise((resolve) => server.once('listening', resolve))
    const baseUrl = `http://127.0.0.1:${server.address().port}`
    const owner = await register(baseUrl, 'ProjectOwner')
    const member = await register(baseUrl, 'ProjectMember')
    userIds.push(owner.user.id, member.user.id)

    const ownerMembership = await prisma.workspaceMember.findFirst({ where: { userId: owner.user.id } })
    const memberMembership = await prisma.workspaceMember.findFirst({ where: { userId: member.user.id } })
    workspaceIds.push(ownerMembership.workspaceId, memberMembership.workspaceId)
    await prisma.workspaceMember.create({ data: { workspaceId: ownerMembership.workspaceId, userId: member.user.id, role: 'MEMBER' } })

    const ownerHeaders = { authorization: `Bearer ${owner.tokens.accessToken}`, 'content-type': 'application/json' }
    const memberHeaders = { authorization: `Bearer ${member.tokens.accessToken}`, 'content-type': 'application/json', 'x-workspace-id': ownerMembership.workspaceId }

    const workspaceResponse = await fetch(`${baseUrl}/api/workspaces/current`, { headers: ownerHeaders })
    const workspace = await workspaceResponse.json()
    assert.equal(workspaceResponse.status, 200)
    assert.equal(workspace.workspace.id, ownerMembership.workspaceId)
    assert.equal(workspace.workspace.role, 'admin')

    const createResponse = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST', headers: ownerHeaders,
      body: JSON.stringify({ name: 'API Test Project', description: 'A project created by the integration test.', status: 'active', priority: 'high', color: '#6366f1', startDate: '2026-09-01', endDate: '2026-10-01' }),
    })
    const created = await createResponse.json()
    assert.equal(createResponse.status, 201)
    assert.equal(created.project.ownerId, owner.user.id)
    assert.equal(created.project.members.length, 1)

    const deniedCreate = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST', headers: memberHeaders,
      body: JSON.stringify({ name: 'Denied Project' }),
    })
    assert.equal(deniedCreate.status, 403)

    const listAsMember = await fetch(`${baseUrl}/api/projects`, { headers: memberHeaders })
    const memberProjects = await listAsMember.json()
    assert.equal(listAsMember.status, 200)
    assert.equal(memberProjects.projects.some((project) => project.id === created.project.id), true)

    const replaceMembers = await fetch(`${baseUrl}/api/projects/${created.project.id}/members`, {
      method: 'PUT', headers: ownerHeaders, body: JSON.stringify({ members: [{ userId: member.user.id, role: 'frontend-developer' }] }),
    })
    const withMember = await replaceMembers.json()
    assert.equal(replaceMembers.status, 200)
    assert.deepEqual(withMember.project.members.map((item) => item.id).sort(), [owner.user.id, member.user.id].sort())
    assert.equal(withMember.project.members.find((item) => item.id === owner.user.id).projectRole, 'project-manager')
    assert.equal(withMember.project.members.find((item) => item.id === member.user.id).projectRole, 'frontend-developer')

    const assignedTaskResponse = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({ title: 'Project-owned task', projectId: created.project.id, assigneeId: member.user.id }),
    })
    const assignedTask = await assignedTaskResponse.json()
    assert.equal(assignedTaskResponse.status, 201)
    assert.equal(assignedTask.task.assigneeId, member.user.id)

    const updateMemberResponse = await fetch(`${baseUrl}/api/workspaces/members/${member.user.id}`, {
      method: 'PATCH', headers: ownerHeaders, body: JSON.stringify({ availability: 'away', capacity: 80 }),
    })
    const updatedMember = await updateMemberResponse.json()
    assert.equal(updateMemberResponse.status, 200)
    assert.equal(updatedMember.member.availability, 'away')
    assert.equal(updatedMember.member.capacity, 80)

    const isolatedProject = await fetch(`${baseUrl}/api/projects/${created.project.id}`, {
      headers: { authorization: `Bearer ${member.tokens.accessToken}` },
    })
    assert.equal(isolatedProject.status, 404)

    const deniedDelete = await fetch(`${baseUrl}/api/projects/${created.project.id}`, { method: 'DELETE', headers: memberHeaders })
    assert.equal(deniedDelete.status, 403)

    const deleteResponse = await fetch(`${baseUrl}/api/projects/${created.project.id}`, { method: 'DELETE', headers: ownerHeaders })
    assert.equal(deleteResponse.status, 204)
    assert.equal(await prisma.project.count({ where: { id: created.project.id } }), 0)
    assert.equal(await prisma.projectMember.count({ where: { projectId: created.project.id } }), 0)
    assert.equal(await prisma.task.count({ where: { id: assignedTask.task.id } }), 0)
    assert.equal(await prisma.workspaceMember.count({ where: { workspaceId: ownerMembership.workspaceId, userId: member.user.id } }), 1)
    assert.equal(await prisma.user.count({ where: { id: member.user.id } }), 1)
  } finally {
    for (const workspaceId of workspaceIds) {
      await prisma.workspace.delete({ where: { id: workspaceId } }).catch(() => {})
    }
    for (const userId of userIds) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    }
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
    await prisma.$disconnect()
  }
})
