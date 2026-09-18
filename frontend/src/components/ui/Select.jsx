import { ChevronDown } from 'lucide-react'
import cn from '../../utils/cn'

export default function Select({
  label,
  options,
  value,
  onChange,
  id,
  className,
  wrapperClassName,
  disabled = false,
  ariaLabel,
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            'h-9 w-full appearance-none rounded-lg border border-border bg-surface',
            'px-3 pr-8 text-sm text-text-primary',
            'transition-colors duration-150',
            'focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20',
            className,
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
          strokeWidth={1.5}
        />
      </div>
    </div>
  )
}

export function FilterSelect({ options, value, onChange, className, ariaLabel }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={cn(
          'h-9 appearance-none rounded-lg border border-border bg-surface',
          'pl-3 pr-8 text-sm text-text-primary',
          'transition-colors duration-150',
          'focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20',
          className,
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
        strokeWidth={1.5}
      />
    </div>
  )
}
