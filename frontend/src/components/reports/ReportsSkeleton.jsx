import { CardSkeleton, KpiCardSkeleton, Skeleton } from '../ui/Skeleton'

export function ReportsPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-in">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <CardSkeleton rows={5} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton rows={5} />
        <CardSkeleton rows={5} />
      </div>

      <CardSkeleton rows={4} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={5} />
      </div>
    </div>
  )
}
