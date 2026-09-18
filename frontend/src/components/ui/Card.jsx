import cn from '../../utils/cn'

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface-raised p-5',
        'transition-shadow duration-200',
        hover && 'hover:shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3
      className={cn(
        'text-sm font-semibold tracking-tight text-text-primary',
        className,
      )}
    >
      {children}
    </h3>
  )
}
