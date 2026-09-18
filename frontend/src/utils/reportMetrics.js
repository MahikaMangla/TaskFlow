import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/tasks'
import { computeTeamStats } from './teamMetrics'
import { computeSprintMetrics } from './sprintMetrics'

export const STATUS_CHART_COLORS = {
  todo: '#a1a1aa',
  in_progress: '#6366f1',
  in_review: '#f59e0b',
  done: '#10b981',
}

export const PRIORITY_CHART_COLORS = {
  low: '#94a3b8',
  medium: '#06b6d4',
  high: '#f59e0b',
  critical: '#ef4444',
}

function isOverdue(task) {
  if (task.status === 'done' || !task.dueDate) return false
  const due = new Date(task.dueDate)
  due.setHours(23, 59, 59, 999)
  return due < new Date()
}

function countInDateRange(items, start, end, dateField = 'updatedAt') {
  return items.filter((item) => {
    const date = new Date(item[dateField])
    return date >= start && date <= end
  }).length
}

function computeTrend(current, previous) {
  if (previous === 0) {
    return current > 0 ? { change: 100, trend: 'up' } : { change: 0, trend: 'neutral' }
  }
  const change = Math.round(((current - previous) / previous) * 100)
  return {
    change,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
  }
}

export function getCompletionTrend(tasks, weeks = 6) {
  const now = new Date()
  now.setHours(23, 59, 59, 999)

  return Array.from({ length: weeks }, (_, index) => {
    const weekOffset = weeks - 1 - index
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() - weekOffset * 7)

    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)

    const completed = tasks.filter((task) => {
      if (task.status !== 'done') return false
      const updated = new Date(task.updatedAt)
      return updated >= weekStart && updated <= weekEnd
    }).length

    const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    return { label, count: completed, weekStart, weekEnd }
  })
}

export function computeReportMetrics({ projects, tasks, sprints, members }) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const activeTasks = tasks.filter((t) =>
    ['todo', 'in_progress', 'in_review'].includes(t.status),
  ).length
  const overdueTasks = tasks.filter(isOverdue).length
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const recentCompletions = tasks.filter(
    (t) => t.status === 'done' && new Date(t.updatedAt) >= thirtyDaysAgo,
  ).length
  const previousCompletions = countInDateRange(
    tasks.filter((t) => t.status === 'done'),
    sixtyDaysAgo,
    thirtyDaysAgo,
  )
  const completionTrend = computeTrend(recentCompletions, previousCompletions)

  const recentOverdue = tasks.filter((t) => {
    if (!isOverdue(t)) return false
    return new Date(t.updatedAt) >= thirtyDaysAgo
  }).length

  const kpiStats = [
    {
      id: 'active-projects',
      label: 'Active Projects',
      value: activeProjects,
      change: projects.length - activeProjects,
      trend: 'neutral',
      icon: 'folder',
      suffix: `of ${projects.length} total`,
    },
    {
      id: 'total-tasks',
      label: 'Total Tasks',
      value: totalTasks,
      change: activeTasks,
      trend: 'neutral',
      icon: 'list',
      suffix: `${activeTasks} in progress`,
    },
    {
      id: 'completed-tasks',
      label: 'Completed Tasks',
      value: completedTasks,
      change: Math.abs(completionTrend.change),
      trend: completionTrend.trend,
      icon: 'check',
      suffix: `${completionRate}% completion rate`,
    },
    {
      id: 'overdue-tasks',
      label: 'Overdue Tasks',
      value: overdueTasks,
      change: recentOverdue,
      trend: overdueTasks > 0 ? 'down' : 'up',
      icon: 'alert',
      suffix: recentOverdue > 0 ? `${recentOverdue} updated recently` : 'All on schedule',
    },
  ]

  const tasksByStatus = Object.entries(TASK_STATUSES).map(([status, { label }]) => ({
    key: status,
    label,
    count: tasks.filter((t) => t.status === status).length,
    color: STATUS_CHART_COLORS[status],
  }))

  const tasksByPriority = Object.entries(TASK_PRIORITIES)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([priority, { label }]) => ({
      key: priority,
      label,
      count: tasks.filter((t) => t.priority === priority).length,
      color: PRIORITY_CHART_COLORS[priority],
    }))

  const projectProgress = [...projects]
    .sort((a, b) => b.progress - a.progress)
    .map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id)
      const done = projectTasks.filter((t) => t.status === 'done').length

      const computedProgress = projectTasks.length
        ? Math.round((done / projectTasks.length) * 100)
        : project.progress ?? 0

      const tasksCount = projectTasks.length || project.tasksTotal || 0

      const tasksDone = projectTasks.length
        ? done
        : Math.round((computedProgress / 100) * tasksCount)

      return {
        ...project,
        computedProgress,
        tasksDone,
        tasksCount,
      }
    })

  const sprintPerformance = sprints.map((sprint) => {
    const metrics = computeSprintMetrics(sprint, tasks)
    return {
      ...sprint,
      metrics,
      progressPercent: metrics.committedPoints
        ? Math.round((metrics.completedPoints / metrics.committedPoints) * 100)
        : metrics.progress,
    }
  })

  const teamStats = computeTeamStats(members, tasks)
  const teamWorkload = teamStats.workloads.map((member) => ({
    id: member.id,
    name: member.name,
    initials: member.initials,
    role: member.title,
    color: member.color,
    assigned: member.workload.assignedPercent,
    tasksActive: member.workload.tasksActive,
    tasksTotal: member.workload.tasksTotal,
    availability: member.availability,
  }))

  const completionTrendData = getCompletionTrend(tasks)
  const maxTrendCount = Math.max(
    ...completionTrendData.map((w) => w.count),
    1,
  )

  const inProgressCount =
    tasksByStatus.find((s) => s.key === 'in_progress')?.count ?? 0
  const inReviewCount = tasksByStatus.find((s) => s.key === 'in_review')?.count ?? 0

  return {
    kpiStats,
    completionRate,
    completedTasks,
    activeTasks,
    totalTasks,
    overdueTasks,
    tasksByStatus,
    tasksByPriority,
    projectProgress,
    sprintPerformance,
    teamWorkload,
    teamStats,
    completionTrend: completionTrendData,
    maxTrendCount,
    inProgressCount,
    inReviewCount,
    activeSprints: sprints.filter((s) => s.status === 'active').length,
    completedSprints: sprints.filter((s) => s.status === 'completed').length,
  }
}
