import { formatDate } from '../../utils/format'
import Badge from '../ui/Badge'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'

export default function SprintSummary({ sprint }) {
  if (!sprint) return <Card hover><CardHeader><CardTitle>Current Sprint</CardTitle></CardHeader><p className="py-5 text-center text-sm text-text-secondary">No active sprint right now.</p></Card>
  const sprintProgress = sprint.committedPoints ? Math.round((sprint.completedPoints / sprint.committedPoints) * 100) : sprint.progress
  const taskEntries = Object.entries(sprint.tasksByStatus ?? {})

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{sprint.name}</CardTitle>
          <Badge variant="accent">{Math.max(0, sprint.daysRemaining ?? 0)}d left</Badge>
        </div>
      </CardHeader>

      <p className="mb-4 text-sm leading-relaxed text-text-secondary">
        {sprint.goal}
      </p>

      <div className="mb-4 flex items-center justify-between text-xs text-text-tertiary">
        <span>
          {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
        </span>
        <span>
          {sprint.completedPoints}/{sprint.committedPoints} pts
        </span>
      </div>

      <ProgressBar
        value={sprintProgress}
        showLabel
        size="md"
      />

      <div className="mt-5 grid grid-cols-4 gap-2">
        {taskEntries.map(([status, count]) => (
          <div
            key={status}
            className="rounded-lg border border-border bg-surface px-2 py-2.5 text-center"
          >
            <p className="text-lg font-semibold tabular-nums text-text-primary">
              {count}
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
              {status === 'inProgress'
                ? 'Active'
                : status === 'inReview'
                  ? 'Review'
                  : status === 'todo'
                    ? 'To Do'
                    : 'Done'}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-border-subtle px-3 py-2.5">
        <span className="text-xs text-text-secondary">Team velocity</span>
        <span className="text-sm font-semibold tabular-nums text-text-primary">
          {sprint.currentVelocity ?? sprint.velocity ?? 0} pts/sprint
        </span>
      </div>
    </Card>
  )
}
