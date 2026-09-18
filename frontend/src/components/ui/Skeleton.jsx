import cn from '../../utils/cn'

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'rounded-md bg-linear-to-r from-border-subtle via-border to-border-subtle bg-size-[200%_100%] animate-shimmer',
        className,
      )}
    />
  )
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="mt-4 h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  )
}

export function CardSkeleton({ rows = 3 }) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5">
      <Skeleton className="h-4 w-32" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={3} />
        </div>
        <div className="space-y-6">
          <CardSkeleton rows={5} />
          <CardSkeleton rows={4} />
        </div>
      </div>
    </div>
  )
}
