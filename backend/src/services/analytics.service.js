import { prisma } from '../lib/prisma.js'
import { toSprint } from '../utils/api-mappers.js'

const day = 86_400_000
const metricTaskSelect = { id: true, status: true, priority: true, storyPoints: true, dueDate: true, createdAt: true, projectId: true, sprintId: true, assigneeId: true, title: true }
const pointsFor = (task) => task.storyPoints ?? ({ LOW: 1, MEDIUM: 3, HIGH: 5, CRITICAL: 8 }[task.priority] ?? 3)
const statusCounts = (tasks) => Object.fromEntries(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((status) => [status.toLowerCase(), tasks.filter((task) => task.status === status).length]))

async function workspaceData(workspaceId) {
  const [projects, tasks, sprints, members, activities] = await Promise.all([
    prisma.project.findMany({ where: { workspaceId }, select: { id: true, name: true, color: true, status: true, endDate: true, createdAt: true, updatedAt: true } }),
    prisma.task.findMany({ where: { workspaceId }, select: { ...metricTaskSelect, project: { select: { name: true, color: true } }, assignee: { select: { id: true, name: true, initials: true, color: true } } } }),
    prisma.sprint.findMany({ where: { workspaceId }, orderBy: { startDate: 'desc' } }),
    prisma.workspaceMember.findMany({ where: { workspaceId }, include: { user: { select: { id: true, name: true, initials: true, color: true, capacity: true } } } }),
    prisma.activity.findMany({ where: { workspaceId }, take: 10, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], include: { actor: { select: { id: true, name: true, initials: true, color: true } }, project: { select: { id: true, name: true, color: true } } } }),
  ])
  return { projects, tasks, sprints, members, activities }
}

function sprintMetrics(sprints, tasks) {
  const bySprint = new Map()
  for (const task of tasks) if (task.sprintId) bySprint.set(task.sprintId, [...(bySprint.get(task.sprintId) ?? []), task])
  return sprints.map((sprint) => toSprint(sprint, bySprint.get(sprint.id) ?? []))
}

export async function getDashboard(workspaceId) {
  const { projects, tasks, sprints, members, activities } = await workspaceData(workspaceId)
  const now = new Date()
  const done = tasks.filter((task) => task.status === 'DONE')
  const activeProjects = projects.filter((project) => project.status === 'ACTIVE').length
  const overdue = tasks.filter((task) => task.status !== 'DONE' && task.dueDate && task.dueDate < now).length
  const sprintData = sprintMetrics(sprints, tasks)
  const activeSprint = sprintData.find((sprint) => sprint.status === 'active') ?? sprintData.find((sprint) => sprint.status === 'paused') ?? null
  const projectCards = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id)
    const completed = projectTasks.filter((task) => task.status === 'DONE').length
    const isOverdue = project.endDate && project.endDate < now && project.status !== 'COMPLETED'
    return { id: project.id, name: project.name, color: project.color, progress: projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0, tasksComplete: completed, tasksTotal: projectTasks.length, dueDate: project.endDate, status: isOverdue ? 'delayed' : project.status === 'ON_HOLD' ? 'at-risk' : 'on-track' }
  })
  return {
    kpiStats: [
      { id: 'active-projects', label: 'Active Projects', value: activeProjects, trend: 'neutral' },
      { id: 'tasks-completed', label: 'Tasks Completed', value: done.length, trend: 'neutral' },
      { id: 'overdue-tasks', label: 'Overdue Tasks', value: overdue, trend: overdue ? 'down' : 'neutral' },
      { id: 'team-members', label: 'Team Members', value: members.length, trend: 'neutral' },
    ],
    projects: projectCards,
    currentSprint: activeSprint,
    upcomingDeadlines: tasks.filter((task) => task.status !== 'DONE' && task.dueDate).sort((a, b) => a.dueDate - b.dueDate).slice(0, 5).map((task) => ({ id: task.id, title: task.title, project: task.project?.name ?? '', projectColor: task.project?.color ?? null, dueDate: task.dueDate, priority: task.priority.toLowerCase(), assignee: task.assignee ? { id: task.assignee.id, name: task.assignee.name, initials: task.assignee.initials, color: task.assignee.color } : null })),
    recentActivity: activities.map((activity) => ({ id: activity.id, type: activity.type.toLowerCase().replaceAll('_', '-'), user: activity.actor, description: activity.description, project: activity.project?.name ?? null, projectId: activity.projectId, timestamp: activity.createdAt })),
    teamWorkload: members.map(({ user }) => { const assigned = tasks.filter((task) => task.assigneeId === user.id); const completed = assigned.filter((task) => task.status === 'DONE').length; return { id: user.id, name: user.name, initials: user.initials, color: user.color, capacity: user.capacity, assignedTasks: assigned.length, completedTasks: completed, activeTasks: assigned.length - completed } }),
    taskStatusBreakdown: statusCounts(tasks),
  }
}

export async function getReportsOverview(workspaceId) {
  const { projects, tasks, sprints, members } = await workspaceData(workspaceId)
  const now = new Date()
  const completed = tasks.filter((task) => task.status === 'DONE')
  const overdue = tasks.filter((task) => task.status !== 'DONE' && task.dueDate && task.dueDate < now)
  const sprintsWithMetrics = sprintMetrics(sprints, tasks)
  const weekStarts = Array.from({ length: 6 }, (_, index) => new Date(now.getTime() - (5 - index) * 7 * day))
  const completionTrend = weekStarts.map((start) => { const end = new Date(start.getTime() + 7 * day); return { startDate: start, completedTasks: completed.filter((task) => task.updatedAt >= start && task.updatedAt < end).length, completedPoints: completed.filter((task) => task.updatedAt >= start && task.updatedAt < end).reduce((sum, task) => sum + pointsFor(task), 0) } })
  return {
    summary: { totalProjects: projects.length, activeProjects: projects.filter((project) => project.status === 'ACTIVE').length, totalTasks: tasks.length, completedTasks: completed.length, activeTasks: tasks.length - completed.length, overdueTasks: overdue.length, completionRate: tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0, totalSprints: sprints.length, activeSprints: sprints.filter((sprint) => sprint.status === 'ACTIVE').length, averageVelocity: sprintsWithMetrics.filter((sprint) => sprint.status === 'completed').length ? Math.round(sprintsWithMetrics.filter((sprint) => sprint.status === 'completed').reduce((sum, sprint) => sum + sprint.currentVelocity, 0) / sprintsWithMetrics.filter((sprint) => sprint.status === 'completed').length) : 0 },
    taskBreakdown: { byStatus: statusCounts(tasks), byPriority: Object.fromEntries(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => [priority.toLowerCase(), tasks.filter((task) => task.priority === priority).length])) },
    projects: projects.map((project) => { const projectTasks = tasks.filter((task) => task.projectId === project.id); const projectDone = projectTasks.filter((task) => task.status === 'DONE').length; return { id: project.id, name: project.name, color: project.color, status: project.status.toLowerCase(), totalTasks: projectTasks.length, completedTasks: projectDone, progress: projectTasks.length ? Math.round((projectDone / projectTasks.length) * 100) : 0, overdueTasks: projectTasks.filter((task) => task.status !== 'DONE' && task.dueDate && task.dueDate < now).length } }),
    sprints: sprintsWithMetrics,
    completionTrend,
    teamWorkload: members.map(({ user }) => ({ userId: user.id, name: user.name, initials: user.initials, assignedTasks: tasks.filter((task) => task.assigneeId === user.id).length, completedTasks: tasks.filter((task) => task.assigneeId === user.id && task.status === 'DONE').length })),
  }
}
