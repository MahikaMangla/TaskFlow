import { SPRINT_STATUSES } from '../../constants/sprints'
import Badge from '../ui/Badge'

export default function SprintStatusBadge({ status, size = 'md' }) {
  const config = SPRINT_STATUSES[status]
  if (!config) return null

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}
