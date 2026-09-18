import { AlertCircle } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-border-subtle">
          <Icon className="h-5 w-5 text-text-tertiary" strokeWidth={1.5} />
        </div>
      )}
      <h4 className="text-sm font-medium text-text-primary">{title}</h4>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-text-secondary">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-muted">
        <AlertCircle className="h-5 w-5 text-danger" strokeWidth={1.5} />
      </div>
      <h4 className="text-sm font-medium text-text-primary">{title}</h4>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-text-secondary">
          {description}
        </p>
      )}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
