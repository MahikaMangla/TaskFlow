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

test('activity, dashboard, and reports are calculated from workspace-scoped data', async () => {
  const server = app.listen(0)
  const workspaceIds = []
  const userIds = []
  try {
    await new Promise((resolve) => server.once('listening', resolve))
    const baseUrl = `http://127.0.0.1:${server.address().port}`
    const owner = await register(baseUrl, 'AnalyticsOwner')
    const member = await register(baseUrl, 'AnalyticsMember')
    const outsider = await register(baseUrl, 'AnalyticsOutsider')
    userIds.push(owner.user.id, member.user.id, outsider.user.id)
    const ownerMembership = await prisma.workspaceMember.findFirst({ where: { userId: owner.user.id } })
    const outsiderMembership = await prisma.workspaceMember.findFirst({ where: { userId: outsider.user.id } })
    workspaceIds.push(ownerMembership.workspaceId, outsiderMembership.workspaceId)
    await prisma.workspaceMember.create({ data: { workspaceId: ownerMembership.workspaceId, userId: member.user.id, role: 'MEMBER' } })
    const headers = { authorization: `Bearer ${owner.tokens.accessToken}`, 'content-type': 'application/json' }
    const memberHeaders = { authorization: `Bearer ${member.tokens.accessToken}`, 'x-workspace-id': ownerMembership.workspaceId }

    assert.equal((await fetch(`${baseUrl}/api/dashboard`)).status, 401)
    assert.equal((await fetch(`${baseUrl}/api/activity`)).status, 401)
    assert.equal((await fetch(`${baseUrl}/api/reports/overview`)).status, 401)
    const empty = await fetch(`${baseUrl}/api/dashboard`, { headers })
    assert.equal(empty.status, 200)
    assert.equal((await empty.json()).dashboard.projects.length, 0)

    const projectResponse = await fetch(`${baseUrl}/api/projects`, { method: 'POST', headers, body: JSON.stringify({ name: 'Analytics Project', status: 'active', endDate: '2020-01-01' }) })
    assert.equal(projectResponse.status, 201)
    const project = (await projectResponse.json()).project
    await prisma.projectMember.create({ data: { projectId: project.id, userId: member.user.id, role: 'DEVELOPER' } })
    const taskResponse = await fetch(`${baseUrl}/api/tasks`, { method: 'POST', headers, body: JSON.stringify({ title: 'Overdue completed task', projectId: project.id, assigneeId: member.user.id, priority: 'high', storyPoints: 5, dueDate: '2020-01-02' }) })
    assert.equal(taskResponse.status, 201)
    const task = (await taskResponse.json()).task
    const sprintResponse = await fetch(`${baseUrl}/api/sprints`, { method: 'POST', headers, body: JSON.stringify({ name: `Analytics Sprint ${randomUUID()}`, goal: 'Measure progress', status: 'active', startDate: '2020-01-01', endDate: '2030-01-14' }) })
    assert.equal(sprintResponse.status, 201)
    const sprint = (await sprintResponse.json()).sprint
    assert.equal((await fetch(`${baseUrl}/api/sprints/${sprint.id}/tasks`, { method: 'POST', headers, body: JSON.stringify({ taskIds: [task.id] }) })).status, 200)
    assert.equal((await fetch(`${baseUrl}/api/tasks/${task.id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'done', order: 0 }) })).status, 200)
    assert.equal((await fetch(`${baseUrl}/api/workspaces/members/${member.user.id}`, { method: 'PATCH', headers, body: JSON.stringify({ title: 'Engineer' }) })).status, 200)

    const activityResponse = await fetch(`${baseUrl}/api/activity?limit=2&page=1`, { headers })
    const activity = await activityResponse.json()
    assert.equal(activityResponse.status, 200)
    assert.equal(activity.activities.length, 2)
    assert.equal(activity.pagination.total >= 5, true)
    assert.equal(activity.activities[0].user.id, owner.user.id)
    const createdOnly = await fetch(`${baseUrl}/api/activities?type=project-created&projectId=${project.id}`, { headers })
    const createdActivities = await createdOnly.json()
    assert.equal(createdOnly.status, 200)
    assert.equal(createdActivities.activities.length, 1)
    assert.equal((await fetch(`${baseUrl}/api/activity?limit=101`, { headers })).status, 400)
    assert.equal((await fetch(`${baseUrl}/api/activity?type=not-a-type`, { headers })).status, 400)

    const dashboardResponse = await fetch(`${baseUrl}/api/dashboard`, { headers: memberHeaders })
    const dashboard = await dashboardResponse.json()
    assert.equal(dashboardResponse.status, 200)
    assert.equal(dashboard.dashboard.projects[0].progress, 100)
    assert.equal(dashboard.dashboard.kpiStats.find((item) => item.id === 'overdue-tasks').value, 0)
    assert.equal(dashboard.dashboard.currentSprint.id, sprint.id)
    assert.equal(dashboard.dashboard.recentActivity.length > 0, true)

    const reportsResponse = await fetch(`${baseUrl}/api/reports/overview`, { headers: memberHeaders })
    const report = await reportsResponse.json()
    assert.equal(reportsResponse.status, 200)
    assert.equal(report.report.summary.totalProjects, 1)
    assert.equal(report.report.summary.completedTasks, 1)
    assert.equal(report.report.summary.overdueTasks, 0)
    assert.equal(report.report.taskBreakdown.byStatus.done, 1)
    assert.equal(report.report.sprints.find((item) => item.id === sprint.id).completedTasks, 1)
    assert.equal(report.report.completionTrend.length, 6)

    const outsiderHeaders = { authorization: `Bearer ${outsider.tokens.accessToken}`, 'x-workspace-id': outsiderMembership.workspaceId }
    const isolatedActivity = await fetch(`${baseUrl}/api/activity?projectId=${project.id}`, { headers: outsiderHeaders })
    assert.equal(isolatedActivity.status, 200)
    assert.equal((await isolatedActivity.json()).activities.length, 0)
    const isolatedReport = await fetch(`${baseUrl}/api/reports/overview`, { headers: outsiderHeaders })
    assert.equal(isolatedReport.status, 200)
    assert.equal((await isolatedReport.json()).report.summary.totalTasks, 0)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    for (const workspaceId of workspaceIds) await prisma.workspace.delete({ where: { id: workspaceId } }).catch(() => {})
    for (const userId of userIds) await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    await prisma.$disconnect()
  }
})
