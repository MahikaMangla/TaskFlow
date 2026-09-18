import { useCallback, useState } from 'react'
import { KANBAN_COLUMNS } from '../../constants/tasks'
import { useTasks } from '../../context/TasksContext'
import { groupTasksByStatus } from '../../hooks/useTaskFilters'
import KanbanColumn from './KanbanColumn'

export default function KanbanBoard({ tasks }) {
  const { updateTaskStatus } = useTasks()
  const [draggingTaskId, setDraggingTaskId] = useState(null)
  const [dropTargetStatus, setDropTargetStatus] = useState(null)
  const [moveError, setMoveError] = useState('')

  const grouped = groupTasksByStatus(tasks)

  const handleDragStart = useCallback((e, taskId) => {
    e.dataTransfer.setData('text/task-id', taskId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingTaskId(taskId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingTaskId(null)
    setDropTargetStatus(null)
  }, [])

  const handleDragOver = useCallback((e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTargetStatus(status)
  }, [])

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTargetStatus(null)
    }
  }, [])

  const handleDrop = useCallback(
    async (e, status) => {
      e.preventDefault()
      const taskId = e.dataTransfer.getData('text/task-id')
      if (taskId) {
        const task = tasks.find((item) => item.id === taskId)
        const destinationTasks = grouped[status] ?? []
        const order = task?.status === status
          ? Math.max(destinationTasks.length - 1, 0)
          : destinationTasks.length
        setMoveError('')
        try {
          await updateTaskStatus(taskId, status, order)
        } catch (requestError) {
          setMoveError(requestError.message)
        }
      }
      setDraggingTaskId(null)
      setDropTargetStatus(null)
    },
    [grouped, tasks, updateTaskStatus],
  )

  return (
    <div>
      {moveError && <p role="alert" className="mb-3 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">{moveError}</p>}
      <div className="overflow-x-auto pb-4 -mx-1 px-1">
        <div className="flex gap-4 min-w-min">
          {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={grouped[column.status] ?? []}
            draggingTaskId={draggingTaskId}
            dropTargetStatus={dropTargetStatus}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
          ))}
        </div>
      </div>
    </div>
  )
}
