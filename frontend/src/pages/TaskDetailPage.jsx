import {
  ArrowLeft,
  Calendar,
  Clock,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TaskFormModal from '../components/tasks/TaskFormModal'
import { TaskDetailSkeleton } from '../components/tasks/TasksSkeleton'
import { TaskPriorityBadge, TaskStatusBadge } from '../components/tasks/TaskBadges'
import TaskDueDate from '../components/tasks/TaskDueDate'
import TaskLabels from '../components/tasks/TaskLabels'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState, { ErrorState } from '../components/ui/EmptyState'
import { useProjects } from '../context/ProjectsContext'
import { useTasks } from '../context/TasksContext'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../lib/api'
import { formatFullDate, formatRelativeTime } from '../utils/format'

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProjectById } = useProjects()
  const { accessToken } = useAuth()
  const { getTaskById, fetchTaskById, deleteTask } = useTasks()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [sprint, setSprint] = useState(null)
  const task = getTaskById(id)

  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(async () => {
      if (cancelled) return
      setLoading(true)
      setLoadError(null)
      try {
        await fetchTaskById(id)
      } catch (requestError) {
        if (!cancelled) setLoadError(requestError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id, fetchTaskById])

  useEffect(() => {
    if (!task?.sprintId) {
      return undefined
    }
    let cancelled = false
    apiRequest(`/sprints/${task.sprintId}`, { token: accessToken })
      .then((response) => { if (!cancelled) setSprint(response.sprint ?? null) })
      .catch(() => { if (!cancelled) setSprint(null) })
    return () => { cancelled = true }
  }, [task?.sprintId, accessToken])

  if (loading) {
    return <TaskDetailSkeleton />
  }

  if (loadError && loadError.status !== 404) {
    return <ErrorState title="Unable to load task" description={loadError.message} onRetry={() => navigate(0)} />
  }

  if (!task || loadError?.status === 404) {
    return (
      <div className="mx-auto max-w-lg">
        <EmptyState
          title="Task not found"
          description="This task may have been deleted or the link is incorrect."
          actionLabel="Back to tasks"
          onAction={() => navigate('/tasks')}
        />
      </div>
    )
  }

  const project = getProjectById(task.projectId)
  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteTask(task.id)
      navigate('/tasks')
    } catch (requestError) {
      setDeleteError(requestError.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-[800px] space-y-6 animate-fade-in">
      <Link
        to="/tasks"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to tasks
      </Link>

      <div className="rounded-xl border border-border bg-surface-raised p-6">
        {deleteError && <p role="alert" className="mb-4 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">{deleteError}</p>}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
              {task.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger hover:bg-danger-muted hover:text-danger"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              Delete
            </Button>
          </div>
        </div>

        {task.description && (
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            {task.description}
          </p>
        )}

        <div className="mt-4">
          <TaskLabels labels={task.labels} max={10} size="md" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-text-tertiary">Project</dt>
              <dd className="mt-1">
                {project ? (
                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-text-primary hover:text-accent"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </Link>
                ) : (
                  <span className="text-sm text-text-secondary">—</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-tertiary">Sprint</dt>
              <dd className="mt-1 text-sm text-text-primary">
                {task.sprintId && sprint?.id === task.sprintId ? sprint.name : 'No sprint'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-tertiary">Story points</dt>
              <dd className="mt-1 text-sm text-text-primary">{task.storyPoints == null ? 'Unestimated' : `${task.storyPoints} pts`}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-tertiary">Assignee</dt>
              <dd className="mt-1">
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={task.assignee.name}
                      initials={task.assignee.initials}
                      color={task.assignee.color}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {task.assignee.name}
                      </p>
                      <p className="text-xs text-text-tertiary">{task.assignee.role}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-text-secondary">Unassigned</span>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-text-tertiary">Due date</dt>
              <dd className="mt-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} />
                {task.dueDate ? (
                  <div>
                    <p className="text-sm text-text-primary">
                      {formatFullDate(task.dueDate)}
                    </p>
                    <TaskDueDate dueDate={task.dueDate} className="mt-0.5" />
                  </div>
                ) : (
                  <span className="text-sm text-text-secondary">No due date</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-tertiary">Created</dt>
              <dd className="mt-1 text-sm text-text-primary">
                {formatFullDate(task.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-tertiary">Last updated</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm text-text-primary">
                <Clock className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} />
                {formatRelativeTime(task.updatedAt)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <TaskFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete task"
        loading={deleting}
      />
    </div>
  )
}
