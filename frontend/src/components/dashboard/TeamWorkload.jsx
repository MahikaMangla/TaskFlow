import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'
import cn from '../../utils/cn'

function getLoadStatus(activeTasks, maxActiveTasks) {
  const ratio = maxActiveTasks ? activeTasks / maxActiveTasks : 0
  if (ratio >= 0.9 && activeTasks > 0) return { label: 'High', variant: 'warning' }
  if (ratio >= 0.6 && activeTasks > 0) return { label: 'Balanced', variant: 'accent' }
  return { label: 'Available', variant: 'success' }
}

export default function TeamWorkload({ members }) {
  const maxActiveTasks = Math.max(...members.map((member) => member.activeTasks), 0)
  return (
    <Card hover>
      <CardHeader>
        <CardTitle>Team Workload</CardTitle>
        <span className="text-xs text-text-tertiary">This sprint</span>
      </CardHeader>

      <ul className="space-y-4">
        {members.map((member) => {
          const loadStatus = getLoadStatus(member.activeTasks, maxActiveTasks)
          const loadPercentage = maxActiveTasks ? Math.round((member.activeTasks / maxActiveTasks) * 100) : 0

          return (
            <li key={member.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar
                    name={member.name}
                    initials={member.initials}
                    color={member.color}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {member.name}
                    </p>
                    <p className="text-xs text-text-tertiary">{member.assignedTasks} assigned</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={loadStatus.variant} size="sm">
                    {loadStatus.label}
                  </Badge>
                  <span className="text-xs tabular-nums text-text-secondary">
                    {member.activeTasks} active
                  </span>
                </div>
              </div>
              <ProgressBar
                value={loadPercentage}
                color={
                  loadPercentage >= 90 ? 'var(--color-warning)' : member.color
                }
                size="sm"
              />
              <p
                className={cn(
                  'mt-1 text-right text-[11px] tabular-nums',
                  'text-text-tertiary',
                )}
              >
                {loadPercentage}% relative workload
              </p>
            </li>
          )
        })}
      </ul>
      {members.length === 0 && <p className="py-5 text-center text-sm text-text-secondary">No team members yet.</p>}
    </Card>
  )
}
