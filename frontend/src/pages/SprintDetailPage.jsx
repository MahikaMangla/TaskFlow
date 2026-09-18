import { ArrowLeft, Calendar, CheckCircle2, Pause, Pencil, Play, Plus, Target, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AddTasksModal from '../components/sprints/AddTasksModal'
import SprintFormModal from '../components/sprints/SprintFormModal'
import SprintStatusBadge from '../components/sprints/SprintBadges'
import SprintTaskBreakdown from '../components/sprints/SprintTaskBreakdown'
import SprintTaskList from '../components/sprints/SprintTaskList'
import { SprintDetailSkeleton } from '../components/sprints/SprintsSkeleton'
import Button from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import EmptyState, { ErrorState } from '../components/ui/EmptyState'
import ProgressBar from '../components/ui/ProgressBar'
import { useSprints } from '../context/SprintsContext'
import { useTasks } from '../context/TasksContext'
import { formatFullDate } from '../utils/format'
import { getBackendSprintMetrics } from '../utils/sprintMetrics'

function MetricTile({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-2 text-text-tertiary"><Icon className="h-3.5 w-3.5" strokeWidth={1.5} /><span className="text-xs font-medium">{label}</span></div>
      <p className="mt-1.5 text-lg font-semibold tabular-nums text-text-primary">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-text-tertiary">{sub}</p>}
    </div>
  )
}

export default function SprintDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSprintById, fetchSprintById, fetchSprintTasks, startSprint, pauseSprint, completeSprint, removeTaskFromSprint } = useSprints()
  const { fetchTasks } = useTasks()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [sprintTasks, setSprintTasks] = useState([])
  const [editOpen, setEditOpen] = useState(false)
  const [addTasksOpen, setAddTasksOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const sprint = getSprintById(id)

  const refreshSprintTasks = async () => {
    const nextTasks = await fetchSprintTasks(id)
    setSprintTasks(nextTasks)
    return nextTasks
  }

  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(async () => {
      if (cancelled) return
      setLoading(true)
      setLoadError(null)
      try {
        const [, nextTasks] = await Promise.all([fetchSprintById(id), fetchSprintTasks(id)])
        if (!cancelled) setSprintTasks(nextTasks)
      } catch (requestError) {
        if (!cancelled) setLoadError(requestError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id, fetchSprintById, fetchSprintTasks])

  if (loading) return <SprintDetailSkeleton />

  if (loadError && loadError.status !== 404) {
    return <ErrorState title="Unable to load sprint" description={loadError.message} onRetry={() => navigate(0)} />
  }

  if (!sprint || loadError?.status === 404) {
    return <div className="mx-auto max-w-lg"><EmptyState title="Sprint not found" description="This sprint may have been removed or the link is incorrect." actionLabel="Back to sprints" onAction={() => navigate('/sprints')} /></div>
  }

  const metrics = getBackendSprintMetrics(sprint)
  const isEditable = sprint.status !== 'completed'
  const existingTaskIds = sprintTasks.map((task) => task.id)

  const handleStatusChange = async (action) => {
    setUpdatingStatus(true)
    setActionError('')
    try {
      await action(sprint.id)
      await refreshSprintTasks()
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleTasksChanged = async () => {
    setActionError('')
    try {
      await Promise.all([refreshSprintTasks(), fetchSprintById(id), fetchTasks({}, { silent: true })])
    } catch (requestError) {
      setActionError(requestError.message)
      throw requestError
    }
  }

  const handleRemoveTask = async (taskId) => {
    setActionError('')
    try {
      await removeTaskFromSprint(id, taskId)
      await handleTasksChanged()
    } catch (requestError) {
      setActionError(requestError.message)
      throw requestError
    }
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 animate-fade-in">
      <Link to="/sprints" className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"><ArrowLeft className="h-4 w-4" strokeWidth={1.5} />Back to sprints</Link>

      <div className="rounded-xl border border-border bg-surface-raised p-6">
        {actionError && <p role="alert" className="mb-4 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">{actionError}</p>}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">{sprint.name}</h1><SprintStatusBadge status={sprint.status} /></div>
            <p className="mt-2 flex items-start gap-2 text-sm font-medium text-text-primary"><Target className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />{sprint.goal}</p>
            {sprint.description && <p className="mt-2 text-sm leading-relaxed text-text-secondary">{sprint.description}</p>}
            <div className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary"><Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />{formatFullDate(sprint.startDate)} – {formatFullDate(sprint.endDate)}{metrics.daysRemaining !== null && <><span>·</span><span className="font-medium text-text-secondary">{metrics.daysRemaining}</span></>}</div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {sprint.status === 'planning' && <Button variant="primary" size="sm" disabled={updatingStatus} onClick={() => handleStatusChange(startSprint)}><Play className="h-3.5 w-3.5" strokeWidth={2} />Start sprint</Button>}
            {sprint.status === 'active' && <><Button variant="secondary" size="sm" disabled={updatingStatus} onClick={() => handleStatusChange(pauseSprint)}><Pause className="h-3.5 w-3.5" strokeWidth={1.5} />Pause</Button><Button variant="primary" size="sm" disabled={updatingStatus} onClick={() => handleStatusChange(completeSprint)}><CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />Complete</Button></>}
            {sprint.status === 'paused' && <><Button variant="primary" size="sm" disabled={updatingStatus} onClick={() => handleStatusChange(startSprint)}><Play className="h-3.5 w-3.5" strokeWidth={2} />Resume</Button><Button variant="secondary" size="sm" disabled={updatingStatus} onClick={() => handleStatusChange(completeSprint)}><CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />Complete</Button></>}
            {isEditable && <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />Edit</Button>}
          </div>
        </div>

        <div className="mt-6"><ProgressBar value={metrics.progress} showLabel size="md" /><p className="mt-2 text-xs text-text-tertiary">{metrics.completedTasks} of {metrics.totalTasks} tasks completed</p></div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricTile icon={Target} label="Committed" value={`${metrics.committedPoints} pts`} />
        <MetricTile icon={CheckCircle2} label="Completed" value={`${metrics.completedPoints} pts`} sub={metrics.committedPoints > 0 ? `${Math.round((metrics.completedPoints / metrics.committedPoints) * 100)}% of target` : undefined} />
        <MetricTile icon={TrendingUp} label="Velocity" value={`${metrics.velocity} pts`} sub={sprint.status === 'completed' ? 'Final velocity' : 'Current pace'} />
        <MetricTile icon={Calendar} label="Tasks" value={metrics.totalTasks} sub={`${metrics.completedTasks} done`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SprintTaskBreakdown tasksByStatus={metrics.tasksByStatus} totalTasks={metrics.totalTasks} />
        <Card><CardHeader><CardTitle>Points progress</CardTitle></CardHeader><div className="space-y-4"><div><div className="mb-1.5 flex justify-between text-xs"><span className="text-text-secondary">Story points</span><span className="font-medium tabular-nums text-text-primary">{metrics.completedPoints}/{metrics.committedPoints}</span></div><ProgressBar value={metrics.committedPoints ? Math.round((metrics.completedPoints / metrics.committedPoints) * 100) : 0} size="md" /></div>{sprint.status === 'completed' && <div className="rounded-lg bg-success-muted px-3 py-2.5"><p className="text-xs font-medium text-success">Sprint completed with {metrics.velocity} point velocity</p></div>}</div></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Sprint tasks</CardTitle>{isEditable && <Button variant="secondary" size="sm" onClick={() => setAddTasksOpen(true)}><Plus className="h-3.5 w-3.5" strokeWidth={1.5} />Add tasks</Button>}</CardHeader>
        <SprintTaskList tasks={sprintTasks} onRemove={handleRemoveTask} readonly={!isEditable} />
      </Card>

      <SprintFormModal open={editOpen} onClose={() => setEditOpen(false)} sprint={sprint} />
      <AddTasksModal open={addTasksOpen} onClose={() => setAddTasksOpen(false)} sprintId={sprint.id} existingTaskIds={existingTaskIds} onAssigned={handleTasksChanged} />
    </div>
  )
}
