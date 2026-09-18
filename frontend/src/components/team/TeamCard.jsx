import { Link } from 'react-router-dom'
import { Mail, MapPin } from 'lucide-react'
import Avatar from '../ui/Avatar'
import ProgressBar from '../ui/ProgressBar'
import {
  AvailabilityBadge,
  DepartmentBadge,
  MemberRoleBadge,
  WorkloadBadge,
} from './TeamBadges'
import cn from '../../utils/cn'

export default function TeamCard({ member }) {
  const { workload } = member
  const barColor =
    workload.assignedPercent > 100
      ? 'var(--color-danger)'
      : workload.assignedPercent >= 85
        ? 'var(--color-warning)'
        : member.color

  return (
    <Link
      to={`/team/${member.id}`}
      className={cn(
        'group flex flex-col rounded-xl border border-border bg-surface-raised p-5',
        'transition-all duration-200 hover:border-border hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar
          name={member.name}
          initials={member.initials}
          color={member.color}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-text-primary group-hover:text-accent">
            {member.name}
          </h3>
          <p className="truncate text-xs text-text-tertiary">{member.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <AvailabilityBadge availability={member.availability} size="sm" />
            <DepartmentBadge department={member.department} size="sm" />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <Mail className="h-3 w-3 shrink-0" strokeWidth={1.5} />
          <span className="truncate">{member.email}</span>
        </div>
        {member.location && (
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{member.location}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <MemberRoleBadge roleKey={member.roleKey} size="sm" />
          <WorkloadBadge assignedPercent={workload.assignedPercent} size="sm" />
        </div>
        <ProgressBar value={workload.assignedPercent} color={barColor} size="sm" />
        <div className="mt-1.5 flex items-center justify-between text-xs text-text-tertiary">
          <span>{workload.tasksActive} active tasks</span>
          <span className="tabular-nums">{workload.assignedPercent}% capacity</span>
        </div>
      </div>
    </Link>
  )
}
