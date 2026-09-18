import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

async function register(baseUrl, label) {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: `${label} User`,
      email: `${label}-${randomUUID()}@example.com`,
      password: 'SecurePassword123',
      workspaceName: `${label} Workspace`,
    }),
  })
  assert.equal(response.status, 201)
  return response.json()
}

test('task APIs validate workspace references, labels, filtering, and Kanban order', async () => {
  const server = app.listen(0)
  const workspaceIds = []
  const userIds = []

  try {
    await new Promise((resolve) => server.once('listening', resolve))
    const baseUrl = `http://127.0.0.1:${server.address().port}`
    const owner = await register(baseUrl, 'TaskOwner')
    const teammate = await register(baseUrl, 'TaskTeammate')
    const outsider = await register(baseUrl, 'TaskOutsider')
    userIds.push(owner.user.id, teammate.user.id, outsider.user.id)

    const ownerMembership = await prisma.workspaceMember.findFirst({ where: { userId: owner.user.id } })
    const teammateMembership = await prisma.workspaceMember.findFirst({ where: { userId: teammate.user.id } })
    const outsiderMembership = await prisma.workspaceMember.findFirst({ where: { userId: outsider.user.id } })
    workspaceIds.push(ownerMembership.workspaceId, teammateMembership.workspaceId, outsiderMembership.workspaceId)
    await prisma.workspaceMember.create({ data: { workspaceId: ownerMembership.workspaceId, userId: teammate.user.id, role: 'MEMBER' } })

    const headers = { authorization: `Bearer ${owner.tokens.accessToken}`, 'content-type': 'application/json' }
    const teammateHeaders = { authorization: `Bearer ${teammate.tokens.accessToken}`, 'x-workspace-id': ownerMembership.workspaceId }
    const project = await prisma.project.create({
      data: {
        workspaceId: ownerMembership.workspaceId, ownerId: owner.user.id, name: 'Task API Project',
        members: { create: [
          { userId: owner.user.id, role: 'PROJECT_MANAGER' },
          { userId: teammate.user.id, role: 'FRONTEND_DEVELOPER' },
        ] },
      },
    })
    const sprint = await prisma.sprint.create({
      data: { workspaceId: ownerMembership.workspaceId, name: `Task API Sprint ${randomUUID()}`, goal: 'Test tasks', startDate: new Date('2026-09-01'), endDate: new Date('2026-09-15') },
    })
    const outsiderProject = await prisma.project.create({
      data: { workspaceId: outsiderMembership.workspaceId, ownerId: outsider.user.id, name: 'Outside Project' },
    })

    const invalidReference = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST', headers,
      body: JSON.stringify({ title: 'Rejected task', projectId: outsiderProject.id }),
    })
    assert.equal(invalidReference.status, 400)

    const create = async (title, extra = {}) => {
      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST', headers,
        body: JSON.stringify({ title, projectId: project.id, status: 'todo', priority: 'medium', ...extra }),
      })
      assert.equal(response.status, 201)
      return response.json()
    }

    const first = await create('First task', {
      sprintId: sprint.id, assigneeId: teammate.user.id, dueDate: '2026-09-10', labels: ['Backend', 'API'], storyPoints: 5,
    })

    const rejectedAssignee = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST', headers,
      body: JSON.stringify({ title: 'Rejected assignee', projectId: project.id, assigneeId: outsider.user.id }),
    })
    assert.equal(rejectedAssignee.status, 400)
    const rejectedPoints = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST', headers,
      body: JSON.stringify({ title: 'Rejected points', projectId: project.id, storyPoints: 4 }),
    })
    assert.equal(rejectedPoints.status, 400)
    const second = await create('Second task', { priority: 'critical', labels: ['backend'] })
    const third = await create('Third task')

    assert.equal(first.task.status, 'todo')
    assert.equal(first.task.assignee.id, teammate.user.id)
    assert.deepEqual(first.task.labels, ['api', 'backend'])
    assert.equal(first.task.order, 0)
    assert.equal(first.task.storyPoints, 5)
    assert.equal(second.task.order, 1)
    assert.equal(third.task.order, 2)

    const labelsResponse = await fetch(`${baseUrl}/api/tasks/labels`, { headers })
    const labels = await labelsResponse.json()
    assert.equal(labelsResponse.status, 200)
    assert.deepEqual(labels.labels.map((label) => label.name), ['api', 'backend'])

    const filteredResponse = await fetch(`${baseUrl}/api/tasks?label=backend&assigneeId=${teammate.user.id}&sort=priority-desc`, { headers })
    const filtered = await filteredResponse.json()
    assert.equal(filteredResponse.status, 200)
    assert.deepEqual(filtered.tasks.map((task) => task.id), [first.task.id])

    const movedResponse = await fetch(`${baseUrl}/api/tasks/${third.task.id}/status`, {
      method: 'PATCH', headers, body: JSON.stringify({ status: 'todo', order: 0 }),
    })
    const moved = await movedResponse.json()
    assert.equal(movedResponse.status, 200)
    assert.equal(moved.task.order, 0)

    const orderedResponse = await fetch(`${baseUrl}/api/tasks?projectId=${project.id}&status=todo&sort=updated-desc`, { headers })
    const ordered = await orderedResponse.json()
    const storedOrder = await prisma.task.findMany({ where: { workspaceId: ownerMembership.workspaceId, status: 'TODO' }, orderBy: { position: 'asc' } })
    assert.deepEqual(storedOrder.map((task) => task.id), [third.task.id, first.task.id, second.task.id])
    assert.equal(orderedResponse.status, 200)
    assert.equal(ordered.tasks.length, 3)

    const updateResponse = await fetch(`${baseUrl}/api/tasks/${first.task.id}`, {
      method: 'PATCH', headers,
      body: JSON.stringify({ status: 'in_progress', labels: ['platform'], assigneeId: null, sprintId: null, storyPoints: 8 }),
    })
    const updated = await updateResponse.json()
    assert.equal(updateResponse.status, 200)
    assert.equal(updated.task.status, 'in_progress')
    assert.equal(updated.task.assignee, null)
    assert.equal(updated.task.sprintId, null)
    assert.equal(updated.task.storyPoints, 8)
    assert.deepEqual(updated.task.labels, ['platform'])

    const crossWorkspaceTask = await fetch(`${baseUrl}/api/tasks/${first.task.id}`, {
      headers: { authorization: `Bearer ${outsider.tokens.accessToken}` },
    })
    assert.equal(crossWorkspaceTask.status, 404)

    const memberRead = await fetch(`${baseUrl}/api/tasks/${first.task.id}`, { headers: teammateHeaders })
    assert.equal(memberRead.status, 200)

    const deleteResponse = await fetch(`${baseUrl}/api/tasks/${second.task.id}`, { method: 'DELETE', headers })
    assert.equal(deleteResponse.status, 204)
  } finally {
    for (const workspaceId of workspaceIds) await prisma.workspace.delete({ where: { id: workspaceId } }).catch(() => {})
    for (const userId of userIds) await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
    await prisma.$disconnect()
  }
})
