import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'
import { TaskPriorityBadge, TaskStatusBadge } from '../tasks/TaskBadges'
import { WorkloadBadge } from './TeamBadges'
import { formatDate } from '../../utils/format'
import cn from '../../utils/cn'

export default function MemberWorkload({ member, workload, projects = [] }) {
  const barColor =
    workload.assignedPercent > 100
      ? 'var(--color-danger)'
      : workload.assignedPercent >= 85
        ? 'var(--color-warning)'
        : member.color

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Capacity & workload</CardTitle>
          <WorkloadBadge assignedPercent={workload.assignedPercent} size="sm" />
        </CardHeader>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-end justify-between">
              <span className="text-2xl font-semibold tabular-nums text-text-primary">
                {workload.assignedPercent}%
              </span>
              <span className="text-xs text-text-tertiary">
                of {member.capacity}% capacity
              </span>
            </div>
            <ProgressBar value={workload.assignedPercent} color={barColor} size="md" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Active', value: workload.tasksActive, color: 'var(--color-accent)' },
              { label: 'Completed', value: workload.tasksCompleted, color: 'var(--color-success)' },
              { label: 'Total', value: workload.tasksTotal, color: 'var(--color-text-tertiary)' },
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
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned tasks</CardTitle>
          <span className="text-xs text-text-tertiary">
            {workload.activeTasks.length} active
          </span>
        </CardHeader>

        {workload.activeTasks.length === 0 ? (
          <p className="text-sm text-text-secondary">No active tasks assigned.</p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {workload.activeTasks.map((task) => {
              const project = projectMap[task.projectId]

              return (
                <li key={task.id}>
                  <Link
                    to={`/tasks/${task.id}`}
                    className={cn(
                      'flex items-center justify-between gap-3 py-3 transition-colors',
                      'hover:bg-border-subtle/50 -mx-4 px-4 rounded-lg',
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {project && (
                          <span className="flex items-center gap-1 text-xs text-text-tertiary">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-text-tertiary">
                            Due {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <TaskStatusBadge status={task.status} size="sm" />
                      <TaskPriorityBadge priority={task.priority} size="sm" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
