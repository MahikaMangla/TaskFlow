import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProjectPriorityBadge, ProjectStatusBadge } from '../components/projects/ProjectBadges'
import CreateProjectModal from '../components/projects/CreateProjectModal'
import ProjectMembersModal from '../components/projects/ProjectMembersModal'
import { ProjectDetailSkeleton } from '../components/projects/ProjectsSkeleton'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import EmptyState, { ErrorState } from '../components/ui/EmptyState'
import ProgressBar from '../components/ui/ProgressBar'
import { toProject } from '../context/ProjectsContext'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../lib/api'
import { formatDate, formatFullDate, formatRelativeTime } from '../utils/format'
import { PROJECT_ROLES } from '../constants/team'
import { useProjects } from '../context/ProjectsContext'
import { useTeam } from '../context/TeamContext'
import Modal, { ModalFooter } from '../components/ui/Modal'

function DetailStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-2 text-text-tertiary">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1.5 text-lg font-semibold tabular-nums text-text-primary">
        {value}
      </p>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const { deleteProject } = useProjects()
  const { isAdmin } = useTeam()
  const [project, setProject] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [reload, setReload] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let cancelled = false
    apiRequest(`/projects/${id}`, { token: accessToken })
      .then((response) => {
        if (!cancelled) {
          setProject(toProject(response.project))
          setError(null)
          setStatus('success')
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError)
          setStatus('error')
        }
      })
    return () => { cancelled = true }
  }, [id, accessToken, reload])

  if (status === 'loading') {
    return <ProjectDetailSkeleton />
  }

  if (status === 'error' && error?.status === 404) {
    return (
      <div className="mx-auto max-w-lg">
        <EmptyState
          icon={ListTodo}
          title="Project not found"
          description="This project may have been removed or the link is incorrect."
          actionLabel="Back to projects"
          onAction={() => navigate('/projects')}
        />
      </div>
    )
  }

  if (status === 'error') return <ErrorState title="Unable to load project" description={error?.message ?? 'Please check your connection and try again.'} onRetry={() => { setStatus('loading'); setReload((value) => value + 1) }} />

  const remainingTasks = project.tasksTotal - project.tasksCompleted
  const daysTotal = project.startDate && project.endDate ? Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / 86400000) : 0

  const confirmDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteProject(project.id)
      navigate('/projects', { replace: true })
    } catch (requestError) {
      setDeleteError(requestError.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 animate-fade-in">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to projects
      </Link>

      <div className="rounded-xl border border-border bg-surface-raised p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${project.color}20` }}
            >
              <span
                className="h-4 w-4 rounded-md"
                style={{ backgroundColor: project.color }}
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                {project.name}
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-text-secondary">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ProjectStatusBadge status={project.status} />
                <ProjectPriorityBadge priority={project.priority} />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2 self-start"><Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>Edit project</Button>{isAdmin && <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>Delete project</Button>}</div>
        </div>

        <div className="mt-6">
          <ProgressBar value={project.progress} color={project.color} showLabel size="md" />
          <div className="mt-2 flex items-center justify-between text-xs text-text-tertiary">
            <span>
              {project.tasksCompleted} of {project.tasksTotal} tasks completed
            </span>
            <span>Updated {formatRelativeTime(project.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailStat
          icon={CheckCircle2}
          label="Completed"
          value={project.tasksCompleted}
        />
        <DetailStat
          icon={Circle}
          label="Remaining"
          value={remainingTasks}
        />
        <DetailStat
          icon={Clock}
          label="Duration"
          value={`${daysTotal}d`}
        />
        <DetailStat
          icon={ListTodo}
          label="Progress"
          value={`${project.progress}%`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-text-tertiary">Start date</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm text-text-primary">
                  <Calendar className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} />
                  {formatFullDate(project.startDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-tertiary">End date</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm text-text-primary">
                  <Calendar className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} />
                  {formatFullDate(project.endDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-tertiary">Created</dt>
                <dd className="mt-1 text-sm text-text-primary">
                  {formatDate(project.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-tertiary">Last updated</dt>
                <dd className="mt-1 text-sm text-text-primary">
                  {formatRelativeTime(project.updatedAt)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task breakdown</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {[
                { label: 'Completed', count: project.tasksCompleted, color: 'var(--color-success)' },
                { label: 'Remaining', count: remainingTasks, color: 'var(--color-accent)' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-text-secondary">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-text-primary">
                    {item.count}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex h-3 overflow-hidden rounded-full">
                <div
                  className="h-full bg-success transition-all"
                  style={{
                    width: `${project.tasksTotal ? (project.tasksCompleted / project.tasksTotal) * 100 : 0}%`,
                  }}
                />
                <div className="h-full flex-1 bg-border-subtle" />
              </div>
            </div>
            <p className="mt-4 text-xs text-text-tertiary">
              Task progress is calculated from this project’s workspace tasks.
            </p>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team members</CardTitle>
            <div className="flex items-center gap-3"><span className="text-xs text-text-tertiary">{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span><Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setMembersOpen(true)}>Manage members</Button></div>
          </CardHeader>
          {project.members.length === 0 ? (
            <p className="text-sm text-text-secondary">No team members assigned yet.</p>
          ) : (
            <ul className="space-y-3">
              {project.members.map((member) => (
                <li key={member.id} className="flex items-center gap-3">
                  <Avatar
                    name={member.name}
                    initials={member.initials}
                    color={member.color}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-text-tertiary">{PROJECT_ROLES[member.projectRole]?.label ?? member.projectRole ?? 'Developer'}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <CreateProjectModal open={editOpen} onClose={() => setEditOpen(false)} project={project} onSaved={setProject} />
      {membersOpen && <ProjectMembersModal open={membersOpen} onClose={() => setMembersOpen(false)} project={project} onSaved={(savedProject) => setProject(toProject(savedProject))} />}
      <Modal open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} title="Delete project" description="This action cannot be undone." size="sm">
        <p className="text-sm leading-6 text-text-secondary">Delete <span className="font-medium text-text-primary">{project.name}</span> and its project memberships, tasks, and task relationships? Workspace members and their accounts will not be deleted.</p>
        {deleteError && <p role="alert" className="mt-4 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">{deleteError}</p>}
        <ModalFooter><Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button><Button variant="danger" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete project'}</Button></ModalFooter>
      </Modal>
    </div>
  )
}
