import { CheckSquare, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import KanbanBoard from '../components/tasks/KanbanBoard'
import TaskFormModal from '../components/tasks/TaskFormModal'
import TaskTable from '../components/tasks/TaskTable'
import TasksToolbar from '../components/tasks/TasksToolbar'
import { TasksPageSkeleton } from '../components/tasks/TasksSkeleton'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/EmptyState'
import { useProjects } from '../context/ProjectsContext'
import { useTasks } from '../context/TasksContext'
import { getTaskStats, useTaskFilters } from '../hooks/useTaskFilters'
import cn from '../utils/cn'

function StatPill({ label, value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-3 py-2.5 text-left transition-all duration-150 sm:px-4 sm:py-3',
        active
          ? 'border-accent/30 bg-accent-muted'
          : 'border-border bg-surface-raised hover:bg-border-subtle/50',
      )}
    >
      <p className="text-xl font-semibold tabular-nums text-text-primary sm:text-2xl">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-text-secondary sm:text-xs">
        {label}
      </p>
    </button>
  )
}

export default function TasksPage() {
  const location = useLocation()
  const { projects } = useProjects()
  const { tasks, isLoading, error, fetchTasks, deleteTask } = useTasks()
  const {
    filters,
    viewMode,
    filteredTasks,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    setViewMode,
  } = useTaskFilters(tasks)

  const [formOpen, setFormOpen] = useState(Boolean(location.state?.openTaskForm))
  const [editingTask, setEditingTask] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const requestFilters = {
      search: filters.search.trim() || undefined,
      status: filters.status,
      priority: filters.priority,
      assigneeId: filters.assignee === 'all' ? undefined : filters.assignee,
      projectId: filters.project === 'all' ? undefined : filters.project,
      sprintId: filters.sprint === 'all' ? undefined : filters.sprint,
      sort: filters.sort,
    }
    const timer = setTimeout(() => {
      fetchTasks(requestFilters).catch(() => {})
    }, filters.search ? 250 : 0)
    return () => clearTimeout(timer)
  }, [filters, fetchTasks])

  const stats = getTaskStats(tasks)

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleDelete = (task) => setDeleteTarget(task)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setActionError('')
    try {
      await deleteTask(deleteTarget.id)
      setDeleteTarget(null)
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingTask(null)
  }

  if (isLoading) {
    return <TasksPageSkeleton viewMode={viewMode} />
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load tasks"
        description={error}
        onRetry={fetchTasks}
      />
    )
  }

  const isEmpty = tasks.length === 0
  const isFilteredEmpty = !isEmpty && filteredTasks.length === 0

  const statusFilterMap = {
    Total: 'all',
    'To Do': 'todo',
    Active: 'in_progress',
    Review: 'in_review',
    Done: 'done',
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage tasks across projects and sprints
          </p>
        </div>
        <Button variant="primary" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          New task
        </Button>
      </header>

      {actionError && (
        <p role="alert" className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">
          {actionError}
        </p>
      )}

      {!isEmpty && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3 animate-slide-up">
          {[
            { label: 'Total', value: stats.total },
            { label: 'To Do', value: stats.todo },
            { label: 'Active', value: stats.inProgress },
            { label: 'Review', value: stats.inReview },
            { label: 'Done', value: stats.done },
          ].map(({ label, value }) => {
            const statusKey = statusFilterMap[label]
            const isActive =
              label === 'Total'
                ? filters.status === 'all'
                : filters.status === statusKey
            return (
              <StatPill
                key={label}
                label={label}
                value={value}
                active={isActive}
                onClick={() =>
                  updateFilter('status', statusKey === 'all' ? 'all' : statusKey)
                }
              />
            )
          })}
        </div>
      )}

      {!isEmpty && (
        <TasksToolbar
          filters={filters}
          viewMode={viewMode}
          resultCount={filteredTasks.length}
          hasActiveFilters={hasActiveFilters}
          projects={projects}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onViewModeChange={setViewMode}
        />
      )}

      {isEmpty && (
        <div className="rounded-xl border border-border bg-surface-raised">
          <EmptyState
            icon={CheckSquare}
            title="No tasks yet"
            description="Create your first task to start tracking work across your projects."
            actionLabel="Create task"
            onAction={() => setFormOpen(true)}
          />
        </div>
      )}

      {isFilteredEmpty && (
        <div className="rounded-xl border border-border bg-surface-raised">
          <EmptyState
            icon={CheckSquare}
            title="No matching tasks"
            description="Try adjusting your search or filters."
            actionLabel="Clear filters"
            onAction={resetFilters}
          />
        </div>
      )}

      {!isEmpty && !isFilteredEmpty && viewMode === 'list' && (
        <TaskTable
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {!isEmpty && !isFilteredEmpty && viewMode === 'kanban' && (
        <KanbanBoard tasks={filteredTasks} />
      )}

      <TaskFormModal
        open={formOpen}
        onClose={handleFormClose}
        task={editingTask}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete task"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete task"
        loading={deleting}
      />
    </div>
  )
}
