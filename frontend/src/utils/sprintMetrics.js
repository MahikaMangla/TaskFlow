import { PRIORITY_STORY_POINTS } from '../constants/sprints'
import { getDaysUntil } from './format'

export function getTaskStoryPoints(task) {
  return task.storyPoints ?? PRIORITY_STORY_POINTS[task.priority] ?? 3
}

export function getBackendSprintMetrics(sprint) {
  return {
    tasksByStatus: sprint.tasksByStatus ?? { todo: 0, in_progress: 0, in_review: 0, done: 0 },
    totalTasks: sprint.totalTasks ?? 0,
    completedTasks: sprint.completedTasks ?? 0,
    progress: sprint.progress ?? 0,
    committedPoints: sprint.committedPoints ?? 0,
    completedPoints: sprint.completedPoints ?? 0,
    velocity: sprint.velocity ?? 0,
    daysRemaining: sprint.daysRemaining ?? null,
  }
}

export function computeSprintMetrics(sprint, tasks) {
  const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id)

  const tasksByStatus = {
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
  }

  sprintTasks.forEach((task) => {
    if (tasksByStatus[task.status] !== undefined) {
      tasksByStatus[task.status]++
    }
  })

  const totalTasks = sprintTasks.length
  const completedTasks = tasksByStatus.done
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  const committedPoints = sprintTasks.reduce(
    (sum, t) => sum + getTaskStoryPoints(t),
    0,
  )
  const completedPoints = sprintTasks
    .filter((t) => t.status === 'done')
    .reduce((sum, t) => sum + getTaskStoryPoints(t), 0)

  const velocity =
    sprint.status === 'completed' && sprint.velocity != null
      ? sprint.velocity
      : completedPoints

  let daysRemaining = null
  if (sprint.status === 'active' || sprint.status === 'paused') {
    daysRemaining = getDaysUntil(sprint.endDate)
  }

  return {
    sprintTasks,
    tasksByStatus,
    totalTasks,
    completedTasks,
    progress,
    committedPoints,
    completedPoints,
    velocity,
    daysRemaining,
  }
}

export function groupSprintsBySection(sprints) {
  return {
    current: sprints.filter((s) => s.status === 'active' || s.status === 'paused'),
    upcoming: sprints.filter((s) => s.status === 'planning'),
    completed: sprints.filter((s) => s.status === 'completed'),
  }
}
