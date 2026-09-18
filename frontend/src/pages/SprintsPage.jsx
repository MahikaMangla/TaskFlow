import { Timer } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import SprintCard from '../components/sprints/SprintCard'
import SprintFormModal from '../components/sprints/SprintFormModal'
import SprintsToolbar from '../components/sprints/SprintsToolbar'
import { SprintsPageSkeleton } from '../components/sprints/SprintsSkeleton'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/EmptyState'
import { SPRINT_SECTIONS } from '../constants/sprints'
import { useSprints } from '../context/SprintsContext'
import {
  getSprintOverviewStats,
  useSprintFilters,
} from '../hooks/useSprintFilters'
import cn from '../utils/cn'

function SprintSection({ title, sprints, emptyMessage }) {
  if (sprints.length === 0) {
    return (
      <section>
        <h2 className="mb-4 text-sm font-semibold text-text-primary">{title}</h2>
        <div className="rounded-xl border border-dashed border-border bg-surface-raised/50 px-4 py-8 text-center">
          <p className="text-sm text-text-tertiary">{emptyMessage}</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <span className="rounded-md bg-border-subtle px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-text-tertiary">
          {sprints.length}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sprints.map((sprint, index) => (
          <div
            key={sprint.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <SprintCard sprint={sprint} />
          </div>
        ))}
      </div>
    </section>
  )
}

function StatPill({ label, value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-4 py-3 text-left transition-all duration-150',
        active
          ? 'border-accent/30 bg-accent-muted'
          : 'border-border bg-surface-raised hover:bg-border-subtle/50',
      )}
    >
      <p className="text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-text-secondary">{label}</p>
    </button>
  )
}

export default function SprintsPage() {
  const location = useLocation()
  const { sprints, isLoading, error, fetchSprints } = useSprints()
  const {
    filters,
    filteredSprints,
    hasActiveFilters,
    updateFilter,
    resetFilters,
  } = useSprintFilters(sprints)

  const [formOpen, setFormOpen] = useState(Boolean(location.state?.openSprintForm))
  const stats = getSprintOverviewStats(sprints)

  if (isLoading) {
    return <SprintsPageSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load sprints"
        description={error}
        onRetry={fetchSprints}
      />
    )
  }

  const isEmpty = sprints.length === 0
  const isFilteredEmpty = !isEmpty && filteredSprints.length === 0

  const statusFilterMap = {
    Total: 'all',
    Active: 'active',
    Planning: 'planning',
    Completed: 'completed',
  }

  const grouped = SPRINT_SECTIONS.map((section) => ({
    ...section,
    sprints: filteredSprints.filter((s) => section.statuses.includes(s.status)),
  }))

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Sprints
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Plan, track and review your team sprints
          </p>
        </div>
        <Button variant="primary" onClick={() => setFormOpen(true)}>
          <Timer className="h-4 w-4" strokeWidth={2} />
          New sprint
        </Button>
      </header>

      {!isEmpty && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-slide-up">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'Planning', value: stats.planning },
            { label: 'Completed', value: stats.completed },
          ].map(({ label, value }) => {
            const statusKey = statusFilterMap[label]
            const isActive =
              label === 'Total'
                ? filters.status === 'all'
                : filters.status === statusKey
            return (
              <StatPill
                key={label}
                label={label}
                value={value}
                active={isActive}
                onClick={() =>
                  updateFilter('status', statusKey === 'all' ? 'all' : statusKey)
                }
              />
            )
          })}
        </div>
      )}

      {!isEmpty && (
        <SprintsToolbar
          filters={filters}
          resultCount={filteredSprints.length}
          hasActiveFilters={hasActiveFilters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
        />
      )}

      {isEmpty && (
        <div className="rounded-xl border border-border bg-surface-raised">
          <EmptyState
            icon={Timer}
            title="No sprints yet"
            description="Create your first sprint to start planning and tracking iterative work."
            actionLabel="Create sprint"
            onAction={() => setFormOpen(true)}
          />
        </div>
      )}

      {isFilteredEmpty && (
        <div className="rounded-xl border border-border bg-surface-raised">
          <EmptyState
            icon={Timer}
            title="No matching sprints"
            description="Try adjusting your search or filters."
            actionLabel="Clear filters"
            onAction={resetFilters}
          />
        </div>
      )}

      {!isEmpty && !isFilteredEmpty && (
        <div className="space-y-10">
          {grouped.map((section) => (
            <SprintSection
              key={section.id}
              title={section.title}
              sprints={section.sprints}
              emptyMessage={
                section.id === 'current'
                  ? 'No active sprint. Start a planned sprint to begin.'
                  : section.id === 'upcoming'
                    ? 'No upcoming sprints scheduled.'
                    : 'No completed sprints yet.'
              }
            />
          ))}
        </div>
      )}

      <SprintFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
