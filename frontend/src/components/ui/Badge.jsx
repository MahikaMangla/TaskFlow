import cn from '../../utils/cn'

const variants = {
  default: 'bg-border-subtle text-text-secondary',
  accent: 'bg-accent-muted text-accent',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
  outline: 'border border-border text-text-secondary bg-transparent',
}

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
