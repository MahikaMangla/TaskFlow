import { PROJECT_PRIORITIES, PROJECT_STATUSES } from '../../constants/projects'
import Badge from '../ui/Badge'

export function ProjectStatusBadge({ status, size = 'md' }) {
  const config = PROJECT_STATUSES[status]
  if (!config) return null

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}

export function ProjectPriorityBadge({ priority, size = 'md' }) {
  const config = PROJECT_PRIORITIES[priority]
  if (!config) return null

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}
