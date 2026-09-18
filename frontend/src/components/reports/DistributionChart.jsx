import { Card, CardHeader, CardTitle } from '../ui/Card'

export default function DistributionChart({
  title,
  totalLabel,
  items,
  footer,
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card hover>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {totalLabel && (
          <span className="text-xs text-text-tertiary">{total} {totalLabel}</span>
        )}
      </CardHeader>

      {total > 0 ? (
        <>
          <div className="mb-5 flex h-3 w-full overflow-hidden rounded-full">
            {items.map((item) =>
              item.count > 0 ? (
                <div
                  key={item.key}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${(item.count / total) * 100}%`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.label}: ${item.count}`}
                />
              ) : null,
            )}
          </div>

          <ul className="space-y-3">
            {items.map((item) => {
              const percentage = total ? Math.round((item.count / total) * 100) : 0

              return (
                <li key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-text-secondary">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums text-text-primary">
                      {item.count}
                    </span>
                    <span className="w-10 text-right text-xs tabular-nums text-text-tertiary">
                      {percentage}%
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <p className="text-sm text-text-secondary">No data available.</p>
      )}

      {footer && total > 0 && <div className="mt-5">{footer}</div>}
    </Card>
  )
}
