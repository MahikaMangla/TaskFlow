import cn from '../../utils/cn'

export default function ProgressBar({
  value,
  color = 'var(--color-accent)',
  size = 'md',
  showLabel = false,
  className,
}) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-text-secondary">Progress</span>
          <span className="font-medium tabular-nums text-text-primary">
            {clampedValue}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-border-subtle',
          size === 'sm' && 'h-1.5',
          size === 'md' && 'h-2',
          size === 'lg' && 'h-2.5',
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedValue}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}
