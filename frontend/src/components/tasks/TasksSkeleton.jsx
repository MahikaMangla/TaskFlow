import { Skeleton } from '../ui/Skeleton'

export function TasksPageSkeleton({ viewMode = 'list' }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-9 w-full rounded-lg" />

      {viewMode === 'list' ? (
        <div className="rounded-xl border border-border bg-surface-raised">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border-subtle px-4 py-4 last:border-0">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-[280px] shrink-0 rounded-xl" />
          ))}
        </div>
      )}
    </div>
  )
}

export function TaskDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[800px] space-y-6 animate-fade-in">
      <Skeleton className="h-4 w-24" />
      <div className="rounded-xl border border-border bg-surface-raised p-6">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}
