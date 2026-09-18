const ACTIVE_STATUSES = ['todo', 'in_progress', 'in_review']

export function computeMemberWorkload(memberId, tasks) {
  const assigned = tasks.filter((t) => t.assigneeId === memberId)
  const active = assigned.filter((t) => ACTIVE_STATUSES.includes(t.status))
  const completed = assigned.filter((t) => t.status === 'done')

  const assignedPercent = Math.min(150, active.length * 12)

  return {
    tasksTotal: assigned.length,
    tasksActive: active.length,
    tasksCompleted: completed.length,
    assignedPercent,
    activeTasks: active,
  }
}

export function computeTeamStats(members, tasks) {
  const workloads = members.map((m) => ({
    ...m,
    workload: computeMemberWorkload(m.id, tasks),
  }))

  const avgUtilization =
    workloads.length > 0
      ? Math.round(
          workloads.reduce((sum, m) => sum + m.workload.assignedPercent, 0) /
            workloads.length,
        )
      : 0

  const departmentCounts = members.reduce((acc, m) => {
    acc[m.department] = (acc[m.department] ?? 0) + 1
    return acc
  }, {})

  return {
    total: members.length,
    available: members.filter((m) => m.availability === 'available').length,
    busy: members.filter((m) => m.availability === 'busy').length,
    away: members.filter((m) => m.availability === 'away').length,
    offline: members.filter((m) => m.availability === 'offline').length,
    avgUtilization,
    departmentCounts,
    workloads,
  }
}
