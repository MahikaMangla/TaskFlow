import { Card, CardHeader, CardTitle } from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'
import cn from '../../utils/cn'

export default function TaskCompletionOverview({
  completionRate,
  completedTasks,
  activeTasks,
  totalTasks,
  overdueTasks,
  completionTrend,
  maxTrendCount,
}) {
  const remaining = totalTasks - completedTasks

  return (
    <Card hover>
      <CardHeader>
        <CardTitle>Task Completion Overview</CardTitle>
        <span className="text-xs text-text-tertiary">{totalTasks} total tasks</span>
      </CardHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-4xl font-semibold tabular-nums text-text-primary">
                {completionRate}%
              </p>
              <p className="mt-1 text-sm text-text-secondary">Overall completion rate</p>
            </div>
            {overdueTasks > 0 && (
              <span className="rounded-lg bg-danger-muted px-2.5 py-1 text-xs font-medium text-danger">
                {overdueTasks} overdue
              </span>
            )}
          </div>

          <ProgressBar value={completionRate} color="var(--color-success)" size="md" />

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Completed', value: completedTasks, color: 'var(--color-success)' },
              { label: 'Active', value: activeTasks, color: 'var(--color-accent)' },
              { label: 'Remaining', value: remaining, color: 'var(--color-text-tertiary)' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-surface px-3 py-2.5 text-center"
              >
                <p className="text-lg font-semibold tabular-nums text-text-primary">
                  {item.value}
                </p>
                <p className="text-xs text-text-tertiary">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex h-4 overflow-hidden rounded-full">
            {totalTasks > 0 && completedTasks > 0 && (
              <div
                className="h-full bg-success"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              />
            )}
            {totalTasks > 0 && activeTasks > 0 && (
              <div
                className="h-full bg-accent"
                style={{ width: `${(activeTasks / totalTasks) * 100}%` }}
              />
            )}
            {totalTasks > 0 && remaining - activeTasks > 0 && (
              <div className="h-full flex-1 bg-border-subtle" />
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-tertiary">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              Completed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Active
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-border-subtle" />
              Other
            </span>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">Weekly completions</p>
            <span className="text-xs text-text-tertiary">Last 6 weeks</span>
          </div>

          <div className="flex h-40 items-end gap-2">
            {completionTrend.map((week) => {
              const height = maxTrendCount
                ? Math.max((week.count / maxTrendCount) * 100, week.count > 0 ? 8 : 0)
                : 0

              return (
                <div key={week.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium tabular-nums text-text-secondary">
                    {week.count}
                  </span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all duration-500',
                        week.count > 0 ? 'bg-accent' : 'bg-border-subtle',
                      )}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-tertiary">{week.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
