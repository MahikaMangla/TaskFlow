import { TASK_STATUSES } from '../../constants/tasks'
import { Card, CardHeader, CardTitle } from '../ui/Card'

export default function SprintTaskBreakdown({ tasksByStatus, totalTasks }) {
  const entries = Object.entries(TASK_STATUSES).map(([key, config]) => ({
    key,
    label: config.label,
    count: tasksByStatus[key] ?? 0,
    color:
      key === 'done'
        ? 'var(--color-success)'
        : key === 'in_review'
          ? 'var(--color-warning)'
          : key === 'in_progress'
            ? 'var(--color-accent)'
            : 'var(--color-text-tertiary)',
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task breakdown</CardTitle>
        <span className="text-xs text-text-tertiary">{totalTasks} total</span>
      </CardHeader>

      <div className="mb-4 flex h-2.5 w-full overflow-hidden rounded-full">
        {entries.map((entry) =>
          entry.count > 0 ? (
            <div
              key={entry.key}
              className="h-full transition-all duration-500"
              style={{
                width: `${(entry.count / totalTasks) * 100}%`,
                backgroundColor: entry.color,
              }}
              title={`${entry.label}: ${entry.count}`}
            />
          ) : null,
        )}
      </div>

      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-text-secondary">{entry.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tabular-nums text-text-primary">
                {entry.count}
              </span>
              {totalTasks > 0 && (
                <span className="w-10 text-right text-xs tabular-nums text-text-tertiary">
                  {Math.round((entry.count / totalTasks) * 100)}%
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
