import { Card, CardHeader, CardTitle } from '../ui/Card'

const statusLabels = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }
const statusColors = { todo: '#a1a1aa', in_progress: '#6366f1', in_review: '#f59e0b', done: '#10b981' }

export default function TaskStatusChart({ breakdown }) {
  const taskStatusBreakdown = Object.entries(breakdown).map(([status, count]) => ({ status: statusLabels[status] ?? status, count, color: statusColors[status] ?? '#a1a1aa' }))
  const totalTasks = taskStatusBreakdown.reduce((sum, item) => sum + item.count, 0)
  const done = taskStatusBreakdown.find((item) => item.status === 'Done')?.count ?? 0
  const inProgress = taskStatusBreakdown.find((item) => item.status === 'In Progress')?.count ?? 0
  const inReview = taskStatusBreakdown.find((item) => item.status === 'In Review')?.count ?? 0
  return (
    <Card hover>
      <CardHeader>
        <CardTitle>Task Status</CardTitle>
        <span className="text-xs text-text-tertiary">{totalTasks} total</span>
      </CardHeader>

      <div className="mb-5 flex h-3 w-full overflow-hidden rounded-full">
        {taskStatusBreakdown.map((item) => (
          <div
            key={item.status}
            className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${totalTasks ? (item.count / totalTasks) * 100 : 0}%`,
              backgroundColor: item.color,
            }}
            title={`${item.status}: ${item.count}`}
          />
        ))}
      </div>

      <ul className="space-y-3">
        {taskStatusBreakdown.map((item) => {
          const percentage = totalTasks ? Math.round((item.count / totalTasks) * 100) : 0
          return (
            <li key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-text-secondary">{item.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tabular-nums text-text-primary">
                  {item.count}
                </span>
                <span className="w-10 text-right text-xs tabular-nums text-text-tertiary">
                  {percentage}%
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
            Completion rate
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-text-primary">
            {totalTasks ? Math.round((done / totalTasks) * 100) : 0}
            %
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
            In progress
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-text-primary">
            {inProgress + inReview}
          </p>
        </div>
      </div>
    </Card>
  )
}
