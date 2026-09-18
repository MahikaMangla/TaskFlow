export const TASK_STATUSES = {
  todo: { label: 'To Do', variant: 'default', column: 'TODO' },
  in_progress: { label: 'In Progress', variant: 'accent', column: 'IN PROGRESS' },
  in_review: { label: 'In Review', variant: 'warning', column: 'IN REVIEW' },
  done: { label: 'Done', variant: 'success', column: 'DONE' },
}

export const TASK_PRIORITIES = {
  low: { label: 'Low', variant: 'default', order: 1 },
  medium: { label: 'Medium', variant: 'outline', order: 2 },
  high: { label: 'High', variant: 'warning', order: 3 },
  critical: { label: 'Critical', variant: 'danger', order: 4 },
}

export const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To Do', status: 'todo' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
  { id: 'in_review', title: 'In Review', status: 'in_review' },
  { id: 'done', title: 'Done', status: 'done' },
]

export const TASK_SORT_OPTIONS = [
  { value: 'updated-desc', label: 'Recently updated' },
  { value: 'dueDate-asc', label: 'Due date (soonest)' },
  { value: 'dueDate-desc', label: 'Due date (latest)' },
  { value: 'priority-desc', label: 'Priority (highest)' },
  { value: 'priority-asc', label: 'Priority (lowest)' },
]

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(TASK_STATUSES).map(([value, { label }]) => ({ value, label })),
]

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  ...Object.entries(TASK_PRIORITIES).map(([value, { label }]) => ({ value, label })),
]

export const ASSIGNEE_FILTER_OPTIONS = [
  { value: 'all', label: 'All assignees' },
  { value: 'unassigned', label: 'Unassigned' },
]

export const SPRINT_FILTER_OPTIONS = [
  { value: 'all', label: 'All sprints' },
  { value: 'none', label: 'No sprint' },
]

export const LABEL_COLORS = [
  'bg-accent-muted text-accent',
  'bg-success-muted text-success',
  'bg-warning-muted text-warning',
  'bg-danger-muted text-danger',
  'bg-border-subtle text-text-secondary',
]
