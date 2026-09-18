import { Plus, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTasks } from '../../context/TasksContext'
import { useSprints } from '../../context/SprintsContext'
import { TaskPriorityBadge, TaskStatusBadge } from '../tasks/TaskBadges'
import Button from '../ui/Button'
import Modal, { ModalFooter } from '../ui/Modal'
import cn from '../../utils/cn'

export default function AddTasksModal({ open, onClose, sprintId, existingTaskIds = [], onAssigned }) {
  const { tasks, fetchTasks } = useTasks()
  const { assignTasksToSprint } = useSprints()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    fetchTasks({}, { silent: true }).catch((requestError) => setError(requestError.message))
  }, [open, fetchTasks])

  const availableTasks = useMemo(() => {
    return tasks.filter((t) => !existingTaskIds.includes(t.id) && t.sprintId !== sprintId)
  }, [tasks, existingTaskIds, sprintId])

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return availableTasks
    const query = search.toLowerCase()
    return availableTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query),
    )
  }, [availableTasks, search])

  const toggleTask = (taskId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const handleClose = () => {
    setSearch('')
    setSelected(new Set())
    setError('')
    onClose()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await assignTasksToSprint(sprintId, [...selected])
      await onAssigned?.()
      handleClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add tasks to sprint"
      description="Select tasks to include in this sprint."
      size="lg"
    >
      {error && <p role="alert" className="mb-4 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
          strokeWidth={1.5}
        />
        <input
          type="search"
          placeholder="Search available tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-9 text-sm',
            'focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20',
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
        {filteredTasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-tertiary">
            No available tasks to add
          </p>
        ) : (
          filteredTasks.map((task) => {
            const isSelected = selected.has(task.id)
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleTask(task.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                  isSelected ? 'bg-accent-muted' : 'hover:bg-border-subtle',
                )}
              >
                <div
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                    isSelected ? 'border-accent bg-accent' : 'border-border',
                  )}
                >
                  {isSelected && (
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {task.title}
                  </p>
                  <div className="mt-1 flex gap-1.5">
                    <TaskStatusBadge status={task.status} size="sm" />
                    <TaskPriorityBadge priority={task.priority} size="sm" />
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitting || selected.size === 0}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add {selected.size > 0 ? `${selected.size} task${selected.size > 1 ? 's' : ''}` : 'tasks'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
