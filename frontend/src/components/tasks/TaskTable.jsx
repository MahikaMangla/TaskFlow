import { MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProjects } from '../../context/ProjectsContext'
import { useSprints } from '../../context/SprintsContext'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { TaskPriorityBadge, TaskStatusBadge } from './TaskBadges'
import TaskDueDate from './TaskDueDate'
import TaskLabels from './TaskLabels'

export default function TaskTable({ tasks, onEdit, onDelete }) {
  const { getProjectById } = useProjects()
  const { getSprintById } = useSprints()

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-raised">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-border-subtle/50">
              <th className="px-4 py-3 font-medium text-text-secondary">Task</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Priority</th>
              <th className="hidden px-4 py-3 font-medium text-text-secondary md:table-cell">
                Project
              </th>
              <th className="hidden px-4 py-3 font-medium text-text-secondary lg:table-cell">
                Assignee
              </th>
              <th className="px-4 py-3 font-medium text-text-secondary">Due</th>
              <th className="px-4 py-3 font-medium text-text-secondary">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {tasks.map((task) => {
              const project = getProjectById(task.projectId)
              const sprint = task.sprintId ? getSprintById(task.sprintId) : null

              return (
                <tr
                  key={task.id}
                  className="group transition-colors hover:bg-border-subtle/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="block min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-md"
                    >
                      <p className="truncate font-medium text-text-primary group-hover:text-accent">
                        {task.title}
                      </p>
                      <div className="mt-1">
                        <TaskLabels labels={task.labels} max={2} />
                      </div>
                      {sprint && (
                        <p className="mt-1 text-[11px] text-text-tertiary">{sprint.name}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <TaskStatusBadge status={task.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <TaskPriorityBadge priority={task.priority} size="sm" />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {project && (
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="truncate text-xs text-text-secondary">
                          {project.name}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={task.assignee.name}
                          initials={task.assignee.initials}
                          color={task.assignee.color}
                          size="sm"
                        />
                        <span className="truncate text-xs text-text-secondary">
                          {task.assignee.name.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-tertiary">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TaskDueDate dueDate={task.dueDate} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit?.(task)}
                        aria-label="Edit task"
                      >
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-danger hover:bg-danger-muted hover:text-danger"
                        onClick={() => onDelete?.(task)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
