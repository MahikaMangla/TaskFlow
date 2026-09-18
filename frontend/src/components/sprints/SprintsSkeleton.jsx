import { SprintCardSkeleton } from './SprintCard'
import { Skeleton } from '../ui/Skeleton'

export function SprintsPageSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-9 w-full max-w-md rounded-lg" />
      {['Current', 'Upcoming', 'Completed'].map((section) => (
        <div key={section}>
          <Skeleton className="mb-4 h-5 w-36" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <SprintCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SprintDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-6 animate-fade-in">
      <Skeleton className="h-4 w-28" />
      <div className="rounded-xl border border-border bg-surface-raised p-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-3 h-4 w-full max-w-lg" />
        <Skeleton className="mt-6 h-2.5 w-full rounded-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  )
}
