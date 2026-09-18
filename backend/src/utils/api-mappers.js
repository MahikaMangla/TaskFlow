function isoDate(value) {
  return value ? value.toISOString().slice(0, 10) : null
}

function enumToKey(value) {
  return value.toLowerCase().replaceAll('_', '-')
}

export function toMember(user, workspaceRole) {
  return {
    id: user.id, name: user.name, email: user.email, initials: user.initials,
    title: user.title, roleKey: user.roleKey, department: user.department,
    color: user.color, avatar: user.avatarUrl, availability: enumToKey(user.availability),
    capacity: user.capacity, bio: user.bio, location: user.location, timezone: user.timezone,
    joinedAt: user.joinedAt, createdAt: user.createdAt, updatedAt: user.updatedAt,
    ...(workspaceRole ? { workspaceRole: workspaceRole.toLowerCase() } : {}),
  }
}

export function toProject(project) {
  const tasks = project.tasks ?? []
  const tasksTotal = tasks.length
  const tasksCompleted = tasks.filter((task) => task.status === 'DONE').length
  return {
    id: project.id, name: project.name, description: project.description ?? '', color: project.color,
    status: enumToKey(project.status), priority: enumToKey(project.priority),
    startDate: isoDate(project.startDate), endDate: isoDate(project.endDate),
    ownerId: project.ownerId, createdAt: project.createdAt, updatedAt: project.updatedAt,
    tasksTotal, tasksCompleted, progress: tasksTotal ? Math.round((tasksCompleted / tasksTotal) * 100) : 0,
    owner: project.owner ? toMember(project.owner) : undefined,
    members: (project.members ?? []).map((membership) => ({
      ...toMember(membership.user),
      projectRole: enumToKey(membership.role),
    })),
  }
}

export function toTask(task) {
  return {
    id: task.id, title: task.title, description: task.description ?? '',
    status: task.status.toLowerCase(), priority: task.priority.toLowerCase(),
    projectId: task.projectId, sprintId: task.sprintId, assigneeId: task.assigneeId,
    storyPoints: task.storyPoints, dueDate: isoDate(task.dueDate), order: task.position,
    labels: (task.labels ?? []).map((item) => item.label.name),
    createdAt: task.createdAt, updatedAt: task.updatedAt,
    assignee: task.assignee ? {
      id: task.assignee.id, name: task.assignee.name, initials: task.assignee.initials,
      role: task.assignee.title, color: task.assignee.color,
    } : null,
  }
}

const priorityStoryPoints = { LOW: 1, MEDIUM: 3, HIGH: 5, CRITICAL: 8 }

export function toSprint(sprint, tasks = []) {
  const tasksByStatus = { todo: 0, in_progress: 0, in_review: 0, done: 0 }
  let calculatedCommittedPoints = 0
  let calculatedCompletedPoints = 0
  let remainingPoints = 0

  for (const task of tasks) {
    const status = task.status.toLowerCase()
    tasksByStatus[status] += 1
    const points = task.storyPoints ?? priorityStoryPoints[task.priority] ?? 3
    calculatedCommittedPoints += points
    if (task.status === 'DONE') calculatedCompletedPoints += points
    else remainingPoints += points
  }

  const totalTasks = tasks.length
  const completedTasks = tasksByStatus.done
  const active = sprint.status === 'ACTIVE' || sprint.status === 'PAUSED'
  const daysRemaining = active
    ? Math.ceil((sprint.endDate.getTime() - Date.now()) / 86_400_000)
    : null

  return {
    id: sprint.id, name: sprint.name, goal: sprint.goal, description: sprint.description ?? '',
    status: sprint.status.toLowerCase(), startDate: isoDate(sprint.startDate), endDate: isoDate(sprint.endDate),
    committedPoints: sprint.committedPoints, completedPoints: calculatedCompletedPoints, remainingPoints, velocity: sprint.velocity,
    createdAt: sprint.createdAt, updatedAt: sprint.updatedAt,
    totalTasks, completedTasks, progress: sprint.committedPoints ? Number(((calculatedCompletedPoints / sprint.committedPoints) * 100).toFixed(1)) : 0,
    tasksByStatus, calculatedCommittedPoints, calculatedCompletedPoints,
    currentVelocity: sprint.status === 'COMPLETED' && sprint.velocity != null ? sprint.velocity : calculatedCompletedPoints,
    daysRemaining,
  }
}
