import { KANBAN_COLUMNS } from '../../constants/tasks'
import KanbanCard from './KanbanCard'
import cn from '../../utils/cn'

export default function KanbanColumn({
  column,
  tasks,
  draggingTaskId,
  dropTargetStatus,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  const isDropTarget = dropTargetStatus === column.status

  return (
    <div
      className="flex w-[280px] shrink-0 flex-col sm:w-[300px]"
      onDragOver={(e) => onDragOver(e, column.status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, column.status)}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {column.title}
          </h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-border-subtle px-1.5 text-[11px] font-medium tabular-nums text-text-tertiary">
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        className={cn(
          'flex min-h-[200px] flex-1 flex-col gap-2 rounded-xl border p-2 transition-colors duration-200',
          isDropTarget
            ? 'border-accent/40 bg-accent-muted/30'
            : 'border-border bg-border-subtle/30',
        )}
      >
        {tasks.length === 0 && !isDropTarget && (
          <div className="flex flex-1 items-center justify-center py-8">
            <p className="text-xs text-text-tertiary">Drop tasks here</p>
          </div>
        )}

        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            isDragging={draggingTaskId === task.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {isDropTarget && tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-accent/30 py-8">
            <p className="text-xs font-medium text-accent">Release to drop</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => (
        <div key={col.id} className="w-[280px] shrink-0 sm:w-[300px]">
          <div className="mb-3 h-4 w-24 rounded bg-border-subtle animate-shimmer bg-linear-to-r from-border-subtle via-border to-border-subtle bg-size-[200%_100%]" />
          <div className="space-y-2 rounded-xl border border-border bg-border-subtle/30 p-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-surface animate-shimmer bg-linear-to-r from-border-subtle via-border to-border-subtle bg-size-[200%_100%]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
