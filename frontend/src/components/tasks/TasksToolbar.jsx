import { Kanban, LayoutList, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  PRIORITY_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  TASK_SORT_OPTIONS,
} from '../../constants/tasks'
import { useAuth } from '../../hooks/useAuth'
import { apiRequest } from '../../lib/api'
import Button from '../ui/Button'
import { FilterSelect } from '../ui/Select'
import cn from '../../utils/cn'

export default function TasksToolbar({
  filters,
  viewMode,
  resultCount,
  hasActiveFilters,
  projects,
  onFilterChange,
  onResetFilters,
  onViewModeChange,
}) {
  const { accessToken } = useAuth()
  const [sprints, setSprints] = useState([])
  const [members, setMembers] = useState([])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      apiRequest('/sprints', { token: accessToken }),
      apiRequest('/workspaces/members', { token: accessToken }),
    ])
      .then(([sprintsResponse, membersResponse]) => {
        if (cancelled) return
        setSprints(sprintsResponse.sprints ?? [])
        setMembers(membersResponse.members ?? [])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [accessToken])

  const assigneeOptions = [
    { value: 'all', label: 'All assignees' },
    { value: 'unassigned', label: 'Unassigned' },
    ...members.map((member) => ({ value: member.id, label: member.name })),
  ]

  const projectOptions = [
    { value: 'all', label: 'All projects' },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ]

  const sprintOptions = [
    { value: 'all', label: 'All sprints' },
    { value: 'none', label: 'No sprint' },
    ...sprints.map((s) => ({ value: s.id, label: s.name })),
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            strokeWidth={1.5}
          />
          <input
            type="search"
            placeholder="Search tasks..."
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
            options={STATUS_FILTER_OPTIONS}
            value={filters.status}
            onChange={(val) => onFilterChange('status', val)}
            ariaLabel="Filter by status"
            className="min-w-[120px]"
          />
          <FilterSelect
            options={PRIORITY_FILTER_OPTIONS}
            value={filters.priority}
            onChange={(val) => onFilterChange('priority', val)}
            ariaLabel="Filter by priority"
            className="min-w-[120px]"
          />
          <FilterSelect
            options={assigneeOptions}
            value={filters.assignee}
            onChange={(val) => onFilterChange('assignee', val)}
            ariaLabel="Filter by assignee"
            className="min-w-[130px]"
          />
          <FilterSelect
            options={projectOptions}
            value={filters.project}
            onChange={(val) => onFilterChange('project', val)}
            ariaLabel="Filter by project"
            className="min-w-[130px]"
          />
          <FilterSelect
            options={sprintOptions}
            value={filters.sprint}
            onChange={(val) => onFilterChange('sprint', val)}
            ariaLabel="Filter by sprint"
            className="min-w-[120px]"
          />
          <FilterSelect
            options={TASK_SORT_OPTIONS}
            value={filters.sort}
            onChange={(val) => onFilterChange('sort', val)}
            ariaLabel="Sort tasks"
            className="min-w-[150px]"
          />

          <div className="flex rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-accent-muted text-accent'
                  : 'text-text-tertiary hover:text-text-secondary',
              )}
              aria-label="List view"
            >
              <LayoutList className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('kanban')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                viewMode === 'kanban'
                  ? 'bg-accent-muted text-accent'
                  : 'text-text-tertiary hover:text-text-secondary',
              )}
              aria-label="Kanban view"
            >
              <Kanban className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span>
          {resultCount} task{resultCount !== 1 ? 's' : ''}
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
