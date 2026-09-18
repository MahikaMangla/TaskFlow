import cn from '../../utils/cn'

const sizes = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
}

export default function Avatar({
  name,
  initials,
  color,
  size = 'md',
  className,
}) {
  const displayInitials =
    initials ||
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  return (
    <div
      title={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        'ring-2 ring-surface',
        sizes[size],
        className,
      )}
      style={{
        backgroundColor: color ? `${color}20` : 'var(--color-accent-muted)',
        color: color || 'var(--color-accent)',
      }}
    >
      {displayInitials}
    </div>
  )
}

export function AvatarGroup({ children, className }) {
  return (
    <div className={cn('flex -space-x-2', className)}>
      {children}
    </div>
  )
}
