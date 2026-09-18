import { ArrowUpRight, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/format'
import { getBackendSprintMetrics } from '../../utils/sprintMetrics'
import ProgressBar from '../ui/ProgressBar'
import SprintStatusBadge from './SprintBadges'
import cn from '../../utils/cn'

export default function SprintCard({ sprint }) {
  const metrics = getBackendSprintMetrics(sprint)

  return (
    <Link
      to={`/sprints/${sprint.id}`}
      className={cn(
        'group flex flex-col rounded-xl border border-border bg-surface-raised p-5',
        'transition-all duration-200 hover:border-accent/20 hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-text-primary group-hover:text-accent">
            {sprint.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
            {sprint.goal}
          </p>
        </div>
        <SprintStatusBadge status={sprint.status} size="sm" />
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary">
        <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        <span>
          {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
        </span>
        {metrics.daysRemaining && (
          <>
            <span>·</span>
            <span className="font-medium text-text-secondary">{metrics.daysRemaining}</span>
          </>
        )}
      </div>

      <div className="mt-4">
        <ProgressBar value={metrics.progress} size="sm" />
        <div className="mt-1.5 flex items-center justify-between text-xs text-text-tertiary">
          <span>
            {metrics.completedTasks}/{metrics.totalTasks} tasks
          </span>
          <span className="font-medium tabular-nums text-text-secondary">
            {metrics.progress}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
        <div className="flex gap-4 text-xs">
          <div>
            <p className="text-text-tertiary">Points</p>
            <p className="mt-0.5 font-semibold tabular-nums text-text-primary">
              {metrics.completedPoints}/{metrics.committedPoints}
            </p>
          </div>
          {(sprint.status === 'completed' || sprint.status === 'active') && (
            <div>
              <p className="text-text-tertiary">Velocity</p>
              <p className="mt-0.5 font-semibold tabular-nums text-text-primary">
                {metrics.velocity} pts
              </p>
            </div>
          )}
        </div>
        <ArrowUpRight
          className="h-4 w-4 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
          strokeWidth={1.5}
        />
      </div>
    </Link>
  )
}

export function SprintCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5">
      <div className="flex justify-between">
        <div className="h-4 w-28 rounded bg-border-subtle animate-shimmer bg-linear-to-r from-border-subtle via-border to-border-subtle bg-size-[200%_100%]" />
        <div className="h-5 w-14 rounded-md bg-border-subtle animate-shimmer bg-linear-to-r from-border-subtle via-border to-border-subtle bg-size-[200%_100%]" />
      </div>
      <div className="mt-2 h-3 w-full rounded bg-border-subtle animate-shimmer bg-linear-to-r from-border-subtle via-border to-border-subtle bg-size-[200%_100%]" />
      <div className="mt-4 h-2 w-full rounded-full bg-border-subtle" />
    </div>
  )
}
