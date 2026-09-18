import { Link } from 'react-router-dom'
import { useState } from 'react'
import { TaskPriorityBadge, TaskStatusBadge } from '../tasks/TaskBadges'
import TaskDueDate from '../tasks/TaskDueDate'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { getTaskStoryPoints } from '../../utils/sprintMetrics'

export default function SprintTaskList({ tasks, onRemove, readonly = false }) {
  const [removingTaskId, setRemovingTaskId] = useState(null)

  const handleRemove = async (taskId) => {
    setRemovingTaskId(taskId)
    try {
      await onRemove?.(taskId)
    } finally {
      setRemovingTaskId(null)
    }
  }

  if (tasks.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-tertiary">
        No tasks in this sprint yet.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border-subtle">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            <Link
              to={`/tasks/${task.id}`}
              className="truncate text-sm font-medium text-text-primary hover:text-accent"
            >
              {task.title}
            </Link>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} size="sm" />
              <TaskPriorityBadge priority={task.priority} size="sm" />
              <span className="text-[10px] font-medium tabular-nums text-text-tertiary">
                {getTaskStoryPoints(task)} pts
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <TaskDueDate dueDate={task.dueDate} />
            {task.assignee && (
              <Avatar
                name={task.assignee.name}
                initials={task.assignee.initials}
                color={task.assignee.color}
                size="sm"
              />
            )}
          </div>
          {!readonly && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-xs text-text-tertiary hover:text-danger"
              onClick={() => handleRemove(task.id)}
              disabled={removingTaskId === task.id}
            >
              {removingTaskId === task.id ? 'Removing…' : 'Remove'}
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
