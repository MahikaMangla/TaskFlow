import { Link } from 'react-router-dom'
import { getLoadStatus } from '../../constants/team'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'
import cn from '../../utils/cn'

export default function TeamWorkloadReport({ members }) {
  const maxAssigned = Math.max(...members.map((member) => member.assignedTasks), 1)
  const averageAssigned = members.length
    ? Math.round(members.reduce((sum, member) => sum + member.assignedTasks, 0) / members.length)
    : 0

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Team Workload</CardTitle>
          <span className="text-xs text-text-tertiary">{averageAssigned} avg assigned</span>
        </div>
        <Link
          to="/team"
          className="text-xs font-medium text-text-tertiary transition-colors hover:text-text-primary"
        >
          View team
        </Link>
      </CardHeader>

      {members.length === 0 ? (
        <p className="text-sm text-text-secondary">No team members to display.</p>
      ) : (
        <ul className="space-y-4">
          {members.map((member) => {
            const relativeLoad = Math.round((member.assignedTasks / maxAssigned) * 100)
            const loadStatus = getLoadStatus(relativeLoad)
            const activeTasks = member.assignedTasks - member.completedTasks

            return (
              <li key={member.id}>
                <Link
                  to={`/team/${member.id}`}
                  className="mb-2 flex items-center justify-between gap-3 rounded-lg transition-colors hover:opacity-90"
                >
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
                      <p className="text-xs text-text-tertiary">{member.completedTasks} completed</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={loadStatus.variant} size="sm">
                      {loadStatus.label}
                    </Badge>
                    <span className="text-xs tabular-nums text-text-secondary">
                      {activeTasks} tasks
                    </span>
                  </div>
                </Link>
                <ProgressBar
                  value={relativeLoad}
                  color={
                    relativeLoad > 100
                      ? 'var(--color-danger)'
                      : relativeLoad >= 85
                        ? 'var(--color-warning)'
                        : 'var(--color-accent)'
                  }
                  size="sm"
                />
                <p
                  className={cn(
                    'mt-1 text-right text-[11px] tabular-nums',
                    relativeLoad > 100 ? 'text-danger' : 'text-text-tertiary',
                  )}
                >
                  {member.assignedTasks} assigned · {member.completedTasks} completed
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
