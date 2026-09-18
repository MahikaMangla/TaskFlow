import { Search, X } from 'lucide-react'
import { SPRINT_STATUS_FILTER_OPTIONS } from '../../constants/sprints'
import Button from '../ui/Button'
import { FilterSelect } from '../ui/Select'
import cn from '../../utils/cn'

export default function SprintsToolbar({
  filters,
  resultCount,
  hasActiveFilters,
  onFilterChange,
  onResetFilters,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            strokeWidth={1.5}
          />
          <input
            type="search"
            placeholder="Search sprints..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className={cn(
              'h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-9',
              'text-sm text-text-primary placeholder:text-text-tertiary',
              'focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20',
            )}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-tertiary hover:text-text-primary"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
        <FilterSelect
          options={SPRINT_STATUS_FILTER_OPTIONS}
          value={filters.status}
          onChange={(val) => onFilterChange('status', val)}
          ariaLabel="Filter by status"
          className="min-w-[140px]"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span>
          {resultCount} sprint{resultCount !== 1 ? 's' : ''}
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onResetFilters}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
