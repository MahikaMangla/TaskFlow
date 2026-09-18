import DistributionChart from './DistributionChart'

export default function TasksByStatusChart({
  items,
  completionRate,
  inProgressCount,
  inReviewCount,
}) {
  return (
    <DistributionChart
      title="Tasks by Status"
      totalLabel="total"
      items={items}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Completion rate
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-text-primary">
              {completionRate}%
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              In pipeline
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-text-primary">
              {inProgressCount + inReviewCount}
            </p>
          </div>
        </div>
      }
    />
  )
}
