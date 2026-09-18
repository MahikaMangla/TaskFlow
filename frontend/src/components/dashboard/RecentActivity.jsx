import {
  CheckCircle2,
  GitPullRequest,
  MessageSquare,
  PlusCircle,
  RefreshCw,
} from 'lucide-react'
import { formatRelativeTime } from '../../utils/format'
import Avatar from '../ui/Avatar'
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

export default function RecentActivity({ activities }) {
  return (
    <Card hover>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <span className="text-xs text-text-tertiary">Last 48 hours</span>
      </CardHeader>

      <ul className="relative space-y-0">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />

        {activities.map((activity) => {
          const config = activityConfig[activity.type.replaceAll('-', '_')] ?? activityConfig.sprint_update
          const Icon = config.icon
          const actor = activity.user ?? { name: 'Workspace member', initials: 'WM' }
          const relatedName = activity.project ?? activity.sprint?.name ?? activity.task?.title ?? 'Workspace'

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
                <p className="text-sm leading-snug text-text-primary">
                  <span className="font-medium">{actor.name}</span>{' '}
                  <span className="text-text-secondary">{activity.description}</span>
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-text-tertiary">
                  <span>{relatedName}</span>
                  <span>·</span>
                  <time dateTime={activity.timestamp}>
                    {formatRelativeTime(activity.timestamp)}
                  </time>
                </div>
              </div>
              <Avatar
                name={actor.name}
                initials={actor.initials}
                color={actor.color}
                size="sm"
                className="hidden sm:flex"
              />
            </li>
          )
        })}
      </ul>
      {activities.length === 0 && <p className="py-5 text-center text-sm text-text-secondary">No recent activity yet.</p>}
    </Card>
  )
}
