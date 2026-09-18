import {
  CheckCircle2,
  GitPullRequest,
  MessageSquare,
  PlusCircle,
  RefreshCw,
} from 'lucide-react'
import { formatRelativeTime } from '../../utils/format'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import cn from '../../utils/cn'

const activityConfig = {
  task_completed: {
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success-muted',
  },
  comment: {
    icon: MessageSquare,
    color: 'text-accent',
    bg: 'bg-accent-muted',
  },
  task_created: {
    icon: PlusCircle,
    color: 'text-accent',
    bg: 'bg-accent-muted',
  },
  status_change: {
    icon: GitPullRequest,
    color: 'text-warning',
    bg: 'bg-warning-muted',
  },
  sprint_update: {
    icon: RefreshCw,
    color: 'text-text-secondary',
    bg: 'bg-border-subtle',
  },
}

export default function MemberActivity({ activities, memberName }) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <p className="text-sm text-text-secondary">
          No recent activity for {memberName}.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <span className="text-xs text-text-tertiary">Last 7 days</span>
      </CardHeader>

      <ul className="relative space-y-0">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />

        {activities.map((activity) => {
          const config = activityConfig[activity.type]
          const Icon = config.icon

          return (
            <li key={activity.id} className="relative flex gap-3 py-2.5">
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  config.bg,
                )}
              >
                <Icon className={cn('h-4 w-4', config.color)} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm leading-snug text-text-secondary">
                  {activity.description}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-text-tertiary">
                  <span>{activity.project}</span>
                  <span>·</span>
                  <time dateTime={activity.timestamp}>
                    {formatRelativeTime(activity.timestamp)}
                  </time>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
