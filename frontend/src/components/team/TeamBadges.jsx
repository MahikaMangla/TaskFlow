import { MEMBER_ROLES, DEPARTMENTS, AVAILABILITY } from '../../constants/team'
import Badge from '../ui/Badge'

export function MemberRoleBadge({ roleKey, size = 'md' }) {
  const config = MEMBER_ROLES[roleKey]
  if (!config) return null

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}

export function DepartmentBadge({ department, size = 'md' }) {
  const config = DEPARTMENTS[department]
  if (!config) return null

  return (
    <Badge variant="outline" size={size}>
      {config.label}
    </Badge>
  )
}

export function AvailabilityBadge({ availability, size = 'md' }) {
  const config = AVAILABILITY[availability]
  if (!config) return null

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}

export function WorkloadBadge({ assignedPercent, size = 'sm' }) {
  if (assignedPercent > 100) {
    return (
      <Badge variant="danger" size={size}>
        Overloaded
      </Badge>
    )
  }
  if (assignedPercent >= 85) {
    return (
      <Badge variant="warning" size={size}>
        High load
      </Badge>
    )
  }
  if (assignedPercent >= 60) {
    return (
      <Badge variant="accent" size={size}>
        Balanced
      </Badge>
    )
  }
  return (
    <Badge variant="success" size={size}>
      Light load
    </Badge>
  )
}
