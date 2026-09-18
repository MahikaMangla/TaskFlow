import { Calendar, Clock } from 'lucide-react'
import { formatDate, getDaysUntil } from '../../utils/format'
import cn from '../../utils/cn'

function getDueDateState(dueDate) {
  if (!dueDate) return 'none'
  const label = getDaysUntil(dueDate)
  if (label.includes('overdue')) return 'overdue'
  if (label === 'Today') return 'today'
  if (label === 'Tomorrow') return 'soon'
  const days = parseInt(label, 10)
  if (!Number.isNaN(days) && days <= 3) return 'soon'
  return 'normal'
}

const stateStyles = {
  none: 'text-text-tertiary',
  normal: 'text-text-secondary',
  soon: 'text-warning',
  today: 'text-warning font-medium',
  overdue: 'text-danger font-medium',
}

export default function TaskDueDate({ dueDate, showIcon = true, className }) {
  if (!dueDate) {
    return (
      <span className={cn('text-xs text-text-tertiary', className)}>
        No due date
      </span>
    )
  }

  const state = getDueDateState(dueDate)
  const label = getDaysUntil(dueDate)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs',
        stateStyles[state],
        className,
      )}
      title={formatDate(dueDate)}
    >
      {showIcon &&
        (state === 'overdue' ? (
          <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} />
        ) : (
          <Calendar className="h-3 w-3 shrink-0" strokeWidth={1.5} />
        ))}
      <span>{label}</span>
      <span className="hidden text-text-tertiary sm:inline">
        · {formatDate(dueDate)}
      </span>
    </span>
  )
}
