import DistributionChart from './DistributionChart'

export default function TasksByPriorityChart({ items }) {
  const criticalCount = items.find((i) => i.key === 'critical')?.count ?? 0
  const highCount = items.find((i) => i.key === 'high')?.count ?? 0
  const urgentTotal = criticalCount + highCount

  return (
    <DistributionChart
      title="Tasks by Priority"
      totalLabel="total"
      items={items}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              High priority
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-text-primary">
              {highCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Critical + High
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-text-primary">
              {urgentTotal}
            </p>
          </div>
        </div>
      }
    />
  )
}
