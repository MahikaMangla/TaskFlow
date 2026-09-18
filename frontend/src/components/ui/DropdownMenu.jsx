import { useEffect, useRef } from 'react'
import cn from '../../utils/cn'

export default function DropdownMenu({
  open,
  onClose,
  trigger,
  children,
  align = 'end',
  className,
}) {
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  return (
    <div ref={menuRef} className="relative">
      {trigger}
      {open && (
        <div
          className={cn(
            'absolute top-full z-50 mt-2 min-w-[220px]',
            'rounded-xl border border-border bg-surface-overlay p-1.5 shadow-lg',
            'animate-fade-in',
            align === 'end' && 'right-0',
            align === 'start' && 'left-0',
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ children, icon: Icon, onClick, destructive }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm',
        'transition-colors duration-100',
        destructive
          ? 'text-danger hover:bg-danger-muted'
          : 'text-text-primary hover:bg-border-subtle',
      )}
    >
      {Icon && <Icon className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />}
      {children}
    </button>
  )
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" />
}

export function DropdownLabel({ children }) {
  return (
    <div className="px-3 py-2">
      <p className="text-xs font-medium text-text-tertiary">{children}</p>
    </div>
  )
}
