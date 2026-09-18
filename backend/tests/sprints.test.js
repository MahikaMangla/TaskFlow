import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

async function register(baseUrl, label) {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: `${label} User`, email: `${label}-${randomUUID()}@example.com`, password: 'SecurePassword123', workspaceName: `${label} Workspace` }),
  })
  assert.equal(response.status, 201)
  return response.json()
}

test('sprint APIs support workspace-safe CRUD, task workflows, and progress metrics', async () => {
  const server = app.listen(0)
  const workspaceIds = []
  const userIds = []

  try {
    await new Promise((resolve) => server.once('listening', resolve))
    const baseUrl = `http://127.0.0.1:${server.address().port}`
    const owner = await register(baseUrl, 'SprintOwner')
    const member = await register(baseUrl, 'SprintMember')
    const outsider = await register(baseUrl, 'SprintOutsider')
    userIds.push(owner.user.id, member.user.id, outsider.user.id)

    const ownerMembership = await prisma.workspaceMember.findFirst({ where: { userId: owner.user.id } })
    const memberMembership = await prisma.workspaceMember.findFirst({ where: { userId: member.user.id } })
    const outsiderMembership = await prisma.workspaceMember.findFirst({ where: { userId: outsider.user.id } })
    workspaceIds.push(ownerMembership.workspaceId, memberMembership.workspaceId, outsiderMembership.workspaceId)
    await prisma.workspaceMember.create({ data: { workspaceId: ownerMembership.workspaceId, userId: member.user.id, role: 'MEMBER' } })

    const ownerHeaders = { authorization: `Bearer ${owner.tokens.accessToken}`, 'content-type': 'application/json' }
    const memberHeaders = { authorization: `Bearer ${member.tokens.accessToken}`, 'content-type': 'application/json', 'x-workspace-id': ownerMembership.workspaceId }
    const project = await prisma.project.create({ data: { workspaceId: ownerMembership.workspaceId, ownerId: owner.user.id, name: 'Sprint Test Project' } })

    const invalidDates = await fetch(`${baseUrl}/api/sprints`, {
      method: 'POST', headers: ownerHeaders,
      body: JSON.stringify({ name: 'Bad dates', goal: 'Fail validation', startDate: '2026-09-20', endDate: '2026-09-10' }),
    })
    assert.equal(invalidDates.status, 400)

    const invalidStatus = await fetch(`${baseUrl}/api/sprints`, {
      method: 'POST', headers: ownerHeaders,
      body: JSON.stringify({ name: 'Bad status', goal: 'Fail validation', status: 'invalid', startDate: '2026-09-01', endDate: '2026-09-14' }),
    })
    assert.equal(invalidStatus.status, 400)

    const deniedCreate = await fetch(`${baseUrl}/api/sprints`, {
      method: 'POST', headers: memberHeaders,
      body: JSON.stringify({ name: 'Denied', goal: 'Regular members cannot create', startDate: '2026-09-01', endDate: '2026-09-14' }),
    })
    assert.equal(deniedCreate.status, 403)

    async function createSprint(name, status = 'planning') {
      const response = await fetch(`${baseUrl}/api/sprints`, {
        method: 'POST', headers: ownerHeaders,
        body: JSON.stringify({ name, goal: `${name} goal`, description: 'Sprint API integration test.', status, startDate: '2026-09-01', endDate: '2026-09-14', committedPoints: 20 }),
      })
      assert.equal(response.status, 201)
      return response.json()
    }

    const sprintA = await createSprint('Sprint API A')
    const sprintB = await createSprint('Sprint API B')
    assert.equal(sprintA.sprint.status, 'planning')
    assert.equal(sprintA.sprint.totalTasks, 0)

    const detailResponse = await fetch(`${baseUrl}/api/sprints/${sprintA.sprint.id}`, { headers: ownerHeaders })
    const detail = await detailResponse.json()
    assert.equal(detailResponse.status, 200)
    assert.equal(detail.sprint.id, sprintA.sprint.id)

    const invalidPartialDates = await fetch(`${baseUrl}/api/sprints/${sprintA.sprint.id}`, {
      method: 'PATCH', headers: ownerHeaders, body: JSON.stringify({ startDate: '2026-10-01' }),
    })
    assert.equal(invalidPartialDates.status, 400)

    const listedResponse = await fetch(`${baseUrl}/api/sprints`, { headers: ownerHeaders })
    const listed = await listedResponse.json()
    assert.equal(listedResponse.status, 200)
    assert.equal(listed.sprints.some((sprint) => sprint.id === sprintA.sprint.id), true)

    async function createTask(title, extra = {}) {
      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST', headers: ownerHeaders,
        body: JSON.stringify({ title, projectId: project.id, priority: 'medium', ...extra }),
      })
      assert.equal(response.status, 201)
      return response.json()
    }

    const todoTask = await createTask('Sprint todo task', { priority: 'high', storyPoints: 5 })
    const doneTask = await createTask('Sprint done task', { status: 'done', storyPoints: 3 })

    const assignResponse = await fetch(`${baseUrl}/api/sprints/${sprintA.sprint.id}/tasks`, {
      method: 'POST', headers: memberHeaders,
      body: JSON.stringify({ taskIds: [todoTask.task.id, doneTask.task.id] }),
    })
    const assigned = await assignResponse.json()
    assert.equal(assignResponse.status, 200)
    assert.equal(assigned.sprint.totalTasks, 2)
    assert.equal(assigned.sprint.completedTasks, 1)
    assert.equal(assigned.sprint.progress, 15)
    assert.equal(assigned.sprint.completedPoints, 3)
    assert.equal(assigned.sprint.remainingPoints, 5)
    assert.deepEqual(assigned.sprint.tasksByStatus, { todo: 1, in_progress: 0, in_review: 0, done: 1 })
    assert.equal(assigned.sprint.calculatedCommittedPoints, 8)
    assert.equal(assigned.sprint.calculatedCompletedPoints, 3)

    const sprintTasksResponse = await fetch(`${baseUrl}/api/sprints/${sprintA.sprint.id}/tasks`, { headers: memberHeaders })
    const sprintTasks = await sprintTasksResponse.json()
    assert.equal(sprintTasksResponse.status, 200)
    assert.deepEqual(sprintTasks.tasks.map((task) => task.id).sort(), [todoTask.task.id, doneTask.task.id].sort())

    const moveResponse = await fetch(`${baseUrl}/api/sprints/${sprintB.sprint.id}/tasks`, {
      method: 'POST', headers: memberHeaders, body: JSON.stringify({ taskIds: [todoTask.task.id] }),
    })
    assert.equal(moveResponse.status, 200)
    const oldSprintTasks = await (await fetch(`${baseUrl}/api/sprints/${sprintA.sprint.id}/tasks`, { headers: memberHeaders })).json()
    assert.deepEqual(oldSprintTasks.tasks.map((task) => task.id), [doneTask.task.id])

    const removeTaskResponse = await fetch(`${baseUrl}/api/sprints/${sprintB.sprint.id}/tasks/${todoTask.task.id}`, { method: 'DELETE', headers: memberHeaders })
    const removedTask = await removeTaskResponse.json()
    assert.equal(removeTaskResponse.status, 200)
    assert.equal(removedTask.task.sprintId, null)

    const completionResponse = await fetch(`${baseUrl}/api/sprints/${sprintA.sprint.id}`, {
      method: 'PATCH', headers: ownerHeaders, body: JSON.stringify({ status: 'completed' }),
    })
    const completed = await completionResponse.json()
    assert.equal(completionResponse.status, 200)
    assert.equal(completed.sprint.status, 'completed')
    assert.equal(completed.sprint.completedPoints, 3)
    assert.equal(completed.sprint.velocity, 3)

    const crossWorkspace = await fetch(`${baseUrl}/api/sprints/${sprintA.sprint.id}`, { headers: { authorization: `Bearer ${outsider.tokens.accessToken}` } })
    assert.equal(crossWorkspace.status, 404)

    const deniedDelete = await fetch(`${baseUrl}/api/sprints/${sprintA.sprint.id}`, { method: 'DELETE', headers: memberHeaders })
    assert.equal(deniedDelete.status, 403)

    const tempTask = await createTask('Sprint deletion task')
    await fetch(`${baseUrl}/api/sprints/${sprintB.sprint.id}/tasks`, { method: 'POST', headers: ownerHeaders, body: JSON.stringify({ taskIds: [tempTask.task.id] }) })
    const deleteResponse = await fetch(`${baseUrl}/api/sprints/${sprintB.sprint.id}`, { method: 'DELETE', headers: ownerHeaders })
    assert.equal(deleteResponse.status, 204)
    const afterDelete = await (await fetch(`${baseUrl}/api/tasks/${tempTask.task.id}`, { headers: ownerHeaders })).json()
    assert.equal(afterDelete.task.sprintId, null)
  } finally {
    for (const workspaceId of workspaceIds) await prisma.workspace.delete({ where: { id: workspaceId } }).catch(() => {})
    for (const userId of userIds) await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
    await prisma.$disconnect()
  }
})
