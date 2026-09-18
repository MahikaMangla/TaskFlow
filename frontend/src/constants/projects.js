export const PROJECT_STATUSES = {
  planning: { label: 'Planning', variant: 'outline' },
  active: { label: 'Active', variant: 'accent' },
  'on-hold': { label: 'On Hold', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  archived: { label: 'Archived', variant: 'default' },
}

export const PROJECT_PRIORITIES = {
  low: { label: 'Low', variant: 'default', order: 1 },
  medium: { label: 'Medium', variant: 'outline', order: 2 },
  high: { label: 'High', variant: 'warning', order: 3 },
  critical: { label: 'Critical', variant: 'danger', order: 4 },
}

export const PROJECT_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#64748b',
]

export const SORT_OPTIONS = [
  { value: 'updated-desc', label: 'Recently updated' },
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
  { value: 'progress-desc', label: 'Progress (high–low)' },
  { value: 'progress-asc', label: 'Progress (low–high)' },
  { value: 'endDate-asc', label: 'Due date (soonest)' },
  { value: 'endDate-desc', label: 'Due date (latest)' },
  { value: 'priority-desc', label: 'Priority (highest)' },
]

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(PROJECT_STATUSES).map(([value, { label }]) => ({
    value,
    label,
  })),
]

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  ...Object.entries(PROJECT_PRIORITIES).map(([value, { label }]) => ({
    value,
    label,
  })),
]
