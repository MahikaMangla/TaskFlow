import { LABEL_COLORS } from '../../constants/tasks'
import cn from '../../utils/cn'

function getLabelColor(label) {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash)
  }
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length]
}

export default function TaskLabels({ labels, max = 3, size = 'sm' }) {
  if (!labels?.length) return null

  const visible = labels.slice(0, max)
  const remaining = labels.length - max

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((label) => (
        <span
          key={label}
          className={cn(
            'rounded-md font-medium',
            getLabelColor(label),
            size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
          )}
        >
          {label}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-[10px] font-medium text-text-tertiary">
          +{remaining}
        </span>
      )}
    </div>
  )
}
