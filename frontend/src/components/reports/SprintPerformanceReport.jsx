import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SPRINT_STATUSES } from '../../constants/sprints'
import { formatDate } from '../../utils/format'
import Badge from '../ui/Badge'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'

export default function SprintPerformanceReport({ sprints }) {
  const activeSprint = sprints.find((s) => s.status === 'active')
  const avgVelocity =
    sprints.filter((s) => s.metrics.velocity > 0).length > 0
      ? Math.round(
          sprints.reduce((sum, s) => sum + (s.metrics.velocity || 0), 0) /
            sprints.filter((s) => s.metrics.velocity > 0).length,
        )
      : 0

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Sprint Performance</CardTitle>
          {avgVelocity > 0 && (
            <span className="text-xs text-text-tertiary">{avgVelocity} avg velocity</span>
          )}
        </div>
        <Link
          to="/sprints"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-text-tertiary transition-colors hover:bg-border-subtle hover:text-text-primary"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </CardHeader>

      {sprints.length === 0 ? (
        <p className="text-sm text-text-secondary">No sprints to display.</p>
      ) : (
        <div className="space-y-5">
          {sprints.map((sprint) => {
            const statusConfig = SPRINT_STATUSES[sprint.status]
            const { metrics } = sprint

            return (
              <div key={sprint.id} className="rounded-lg border border-border bg-surface px-4 py-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Link
                      to={`/sprints/${sprint.id}`}
                      className="truncate text-sm font-medium text-text-primary transition-colors hover:text-accent"
                    >
                      {sprint.name}
                    </Link>
                    {statusConfig && (
                      <Badge variant={statusConfig.variant} size="sm">
                        {statusConfig.label}
                      </Badge>
                    )}
                  </div>
                  {metrics.daysRemaining && (
                    <span className="shrink-0 text-xs text-text-tertiary">
                      {metrics.daysRemaining}
                    </span>
                  )}
                </div>

                <p className="mb-3 line-clamp-1 text-xs text-text-secondary">{sprint.goal}</p>

                <ProgressBar
                  value={sprint.progressPercent}
                  color={
                    sprint.status === 'completed'
                      ? 'var(--color-success)'
                      : 'var(--color-accent)'
                  }
                  size="sm"
                />

                <div className="mt-2 flex items-center justify-between text-xs text-text-tertiary">
                  <span>
                    {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
                  </span>
                  <span className="tabular-nums">
                    {metrics.completedPoints}/{metrics.committedPoints} pts ·{' '}
                    {metrics.completedTasks}/{metrics.totalTasks} tasks
                  </span>
                </div>

                {sprint.id === activeSprint?.id && (
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {Object.entries(metrics.tasksByStatus).map(([status, count]) => (
                      <div
                        key={status}
                        className="rounded-md bg-border-subtle px-1.5 py-1 text-center"
                      >
                        <p className="text-sm font-semibold tabular-nums text-text-primary">
                          {count}
                        </p>
                        <p className="text-[9px] font-medium uppercase tracking-wide text-text-tertiary">
                          {status === 'in_progress'
                            ? 'Active'
                            : status === 'in_review'
                              ? 'Review'
                              : status === 'todo'
                                ? 'To Do'
                                : 'Done'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
