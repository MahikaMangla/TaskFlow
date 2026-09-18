import { TASK_PRIORITIES, TASK_STATUSES } from '../../constants/tasks'
import Badge from '../ui/Badge'

export function TaskStatusBadge({ status, size = 'md' }) {
  const config = TASK_STATUSES[status]
  if (!config) return null

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}

export function TaskPriorityBadge({ priority, size = 'md' }) {
  const config = TASK_PRIORITIES[priority]
  if (!config) return null

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}
