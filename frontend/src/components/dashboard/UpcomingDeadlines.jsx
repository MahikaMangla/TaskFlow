import { Clock } from 'lucide-react'
import { formatDate, getDaysUntil } from '../../utils/format'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import cn from '../../utils/cn'

const priorityConfig = {
  critical: { label: 'Critical', variant: 'danger' },
  high: { label: 'High', variant: 'warning' },
  medium: { label: 'Medium', variant: 'outline' },
  low: { label: 'Low', variant: 'default' },
}

export default function UpcomingDeadlines({ deadlines }) {
  return (
    <Card hover>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <span className="text-xs text-text-tertiary">Next 10 days</span>
      </CardHeader>

      <ul className="space-y-1">
        {deadlines.map((deadline, index) => {
          const daysLabel = getDaysUntil(deadline.dueDate)
          const isUrgent =
            daysLabel === 'Today' ||
            daysLabel === 'Tomorrow' ||
            daysLabel.includes('overdue')
          const priority = priorityConfig[deadline.priority]

          return (
            <li key={deadline.id}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-border-subtle',
                  index !== deadlines.length - 1 && 'border-b border-border-subtle',
                )}
              >
                <div
                  className="flex h-9 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: deadline.projectColor }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {deadline.title}
                    </p>
                    <Badge variant={priority.variant} size="sm">
                      {priority.label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {deadline.project}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="hidden text-right sm:block">
                    <p
                      className={cn(
                        'text-xs font-medium',
                        isUrgent ? 'text-danger' : 'text-text-secondary',
                      )}
                    >
                      {daysLabel}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      {formatDate(deadline.dueDate)}
                    </p>
                  </div>
                  <Avatar
                    name={deadline.assignee?.name ?? 'Unassigned'}
                    initials={deadline.assignee?.initials ?? '—'}
                    size="sm"
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {deadlines.length === 0 && (
        <div className="flex flex-col items-center py-8 text-center">
          <Clock className="h-8 w-8 text-text-tertiary" strokeWidth={1.5} />
          <p className="mt-2 text-sm text-text-secondary">No upcoming deadlines</p>
        </div>
      )}
    </Card>
  )
}
