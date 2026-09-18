import { LayoutGrid, List, Search, X } from 'lucide-react'
import {
  AVAILABILITY_FILTER_OPTIONS,
  DEPARTMENT_FILTER_OPTIONS,
  ROLE_FILTER_OPTIONS,
  SORT_OPTIONS,
} from '../../constants/team'
import Button from '../ui/Button'
import { FilterSelect } from '../ui/Select'
import cn from '../../utils/cn'

export default function TeamToolbar({
  filters,
  viewMode,
  resultCount,
  hasActiveFilters,
  onFilterChange,
  onResetFilters,
  onViewModeChange,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            strokeWidth={1.5}
          />
          <input
            type="search"
            placeholder="Search members..."
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

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            options={ROLE_FILTER_OPTIONS}
            value={filters.role}
            onChange={(val) => onFilterChange('role', val)}
            ariaLabel="Filter by role"
            className="min-w-[130px]"
          />
          <FilterSelect
            options={DEPARTMENT_FILTER_OPTIONS}
            value={filters.department}
            onChange={(val) => onFilterChange('department', val)}
            ariaLabel="Filter by department"
            className="min-w-[150px]"
          />
          <FilterSelect
            options={AVAILABILITY_FILTER_OPTIONS}
            value={filters.availability}
            onChange={(val) => onFilterChange('availability', val)}
            ariaLabel="Filter by availability"
            className="min-w-[150px]"
          />
          <FilterSelect
            options={SORT_OPTIONS}
            value={filters.sort}
            onChange={(val) => onFilterChange('sort', val)}
            ariaLabel="Sort members"
            className="min-w-[160px]"
          />

          <div className="flex rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-accent-muted text-accent'
                  : 'text-text-tertiary hover:text-text-secondary',
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                viewMode === 'table'
                  ? 'bg-accent-muted text-accent'
                  : 'text-text-tertiary hover:text-text-secondary',
              )}
              aria-label="Table view"
            >
              <List className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span>
          {resultCount} member{resultCount !== 1 ? 's' : ''}
        </span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onResetFilters}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
