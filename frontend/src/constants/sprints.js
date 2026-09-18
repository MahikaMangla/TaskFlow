export const SPRINT_STATUSES = {
  planning: { label: 'Planning', variant: 'outline', section: 'upcoming' },
  active: { label: 'Active', variant: 'accent', section: 'current' },
  paused: { label: 'Paused', variant: 'warning', section: 'current' },
  completed: { label: 'Completed', variant: 'success', section: 'completed' },
}

export const SPRINT_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(SPRINT_STATUSES).map(([value, { label }]) => ({
    value,
    label,
  })),
]

export const SPRINT_SECTIONS = [
  { id: 'current', title: 'Current Sprint', statuses: ['active', 'paused'] },
  { id: 'upcoming', title: 'Upcoming Sprints', statuses: ['planning'] },
  { id: 'completed', title: 'Completed Sprints', statuses: ['completed'] },
]

export const PRIORITY_STORY_POINTS = {
  low: 1,
  medium: 3,
  high: 5,
  critical: 8,
}
