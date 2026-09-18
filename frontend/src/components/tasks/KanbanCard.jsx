import { Link } from 'react-router-dom'
import { useProjects } from '../../context/ProjectsContext'
import Avatar from '../ui/Avatar'
import { TaskPriorityBadge } from './TaskBadges'
import TaskDueDate from './TaskDueDate'
import TaskLabels from './TaskLabels'
import cn from '../../utils/cn'

export default function KanbanCard({ task, isDragging, onDragStart, onDragEnd }) {
  const { getProjectById } = useProjects()
  const project = getProjectById(task.projectId)

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={cn(
        'cursor-grab rounded-lg border border-border bg-surface p-3',
        'transition-all duration-200 active:cursor-grabbing',
        'hover:border-accent/30 hover:shadow-sm',
        isDragging && 'opacity-50 ring-2 ring-accent/40',
      )}
    >
      <Link
        to={`/tasks/${task.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-md"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug text-text-primary">
            {task.title}
          </p>
          <TaskPriorityBadge priority={task.priority} size="sm" />
        </div>

        {project && (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <span className="truncate text-[11px] text-text-tertiary">
              {project.name}
            </span>
          </div>
        )}

        <div className="mt-2">
          <TaskLabels labels={task.labels} max={2} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <TaskDueDate dueDate={task.dueDate} showIcon={false} />
          {task.assignee ? (
            <Avatar
              name={task.assignee.name}
              initials={task.assignee.initials}
              color={task.assignee.color}
              size="sm"
            />
          ) : (
            <span className="text-[10px] text-text-tertiary">Unassigned</span>
          )}
        </div>
      </Link>
    </div>
  )
}
