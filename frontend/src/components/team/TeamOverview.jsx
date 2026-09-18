import { DEPARTMENTS } from '../../constants/team'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'
import cn from '../../utils/cn'

export default function TeamOverview({ stats }) {
  const departmentEntries = Object.entries(stats.departmentCounts).sort(
    ([, a], [, b]) => b - a,
  )

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Team capacity</CardTitle>
          <span className="text-xs text-text-tertiary">Average utilization</span>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-end justify-between">
              <span className="text-3xl font-semibold tabular-nums text-text-primary">
                {stats.avgUtilization}%
              </span>
              <span className="text-xs text-text-tertiary">
                across {stats.total} member{stats.total !== 1 ? 's' : ''}
              </span>
            </div>
            <ProgressBar
              value={stats.avgUtilization}
              color={
                stats.avgUtilization > 100
                  ? 'var(--color-danger)'
                  : stats.avgUtilization >= 85
                    ? 'var(--color-warning)'
                    : 'var(--color-accent)'
              }
              size="md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.workloads.slice(0, 4).map((member) => (
              <div
                key={member.id}
                className="rounded-lg border border-border bg-surface px-3 py-2.5"
              >
                <p className="truncate text-xs font-medium text-text-primary">
                  {member.name.split(' ')[0]}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-text-primary">
                  {member.workload.assignedPercent}%
                </p>
                <ProgressBar
                  value={member.workload.assignedPercent}
                  color={member.color}
                  size="sm"
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <ul className="space-y-3">
          {departmentEntries.map(([dept, count]) => {
            const config = DEPARTMENTS[dept]
            const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0

            return (
              <li key={dept}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{config?.label ?? dept}</span>
                  <span className="font-medium tabular-nums text-text-primary">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border-subtle">
                  <div
                    className={cn('h-full rounded-full transition-all')}
                    style={{
                      width: `${percent}%`,
                      backgroundColor: config?.color ?? 'var(--color-accent)',
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
