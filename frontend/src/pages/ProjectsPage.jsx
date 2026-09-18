import { FolderKanban, Plus } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import CreateProjectModal from '../components/projects/CreateProjectModal'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectTable from '../components/projects/ProjectTable'
import ProjectsToolbar from '../components/projects/ProjectsToolbar'
import { ProjectsPageSkeleton } from '../components/projects/ProjectsSkeleton'
import { ErrorState } from '../components/ui/EmptyState'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import { useProjects } from '../context/ProjectsContext'
import { getProjectStats, useProjectFilters } from '../hooks/useProjectFilters'
import cn from '../utils/cn'

function StatPill({ label, value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-4 py-3 text-left transition-all duration-150',
        active
          ? 'border-accent/30 bg-accent-muted'
          : 'border-border bg-surface-raised hover:border-border hover:bg-border-subtle/50',
      )}
    >
      <p className="text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-text-secondary">{label}</p>
    </button>
  )
}

export default function ProjectsPage() {
  const location = useLocation()
  const { projects, isLoading, error, fetchProjects } = useProjects()
  const {
    filters,
    viewMode,
    filteredProjects,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    setViewMode,
  } = useProjectFilters(projects)

  const [createOpen, setCreateOpen] = useState(Boolean(location.state?.openProjectForm))
  const stats = getProjectStats(projects)

  if (isLoading) {
    return <ProjectsPageSkeleton viewMode={viewMode} />
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load projects"
        description={error}
        onRetry={fetchProjects}
      />
    )
  }

  const isEmpty = projects.length === 0
  const isFilteredEmpty = !isEmpty && filteredProjects.length === 0

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Projects
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage and track all your team projects
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          New project
        </Button>
      </header>

      {!isEmpty && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-slide-up">
          <StatPill
            label="Total"
            value={stats.total}
            active={filters.status === 'all'}
            onClick={() => updateFilter('status', 'all')}
          />
          <StatPill
            label="Active"
            value={stats.active}
            active={filters.status === 'active'}
            onClick={() => updateFilter('status', 'active')}
          />
          <StatPill
            label="Planning"
            value={stats.planning}
            active={filters.status === 'planning'}
            onClick={() => updateFilter('status', 'planning')}
          />
          <StatPill
            label="Completed"
            value={stats.completed}
            active={filters.status === 'completed'}
            onClick={() => updateFilter('status', 'completed')}
          />
        </div>
      )}

      {!isEmpty && (
        <ProjectsToolbar
          filters={filters}
          viewMode={viewMode}
          resultCount={filteredProjects.length}
          hasActiveFilters={hasActiveFilters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onViewModeChange={setViewMode}
        />
      )}

      {isEmpty && (
        <div className="rounded-xl border border-border bg-surface-raised">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to start organizing tasks and tracking progress with your team."
            actionLabel="Create project"
            onAction={() => setCreateOpen(true)}
          />
        </div>
      )}

      {isFilteredEmpty && (
        <div className="rounded-xl border border-border bg-surface-raised">
          <EmptyState
            icon={FolderKanban}
            title="No matching projects"
            description="Try adjusting your search or filters to find what you're looking for."
            actionLabel="Clear filters"
            onAction={resetFilters}
          />
        </div>
      )}

      {!isEmpty && !isFilteredEmpty && viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}

      {!isEmpty && !isFilteredEmpty && viewMode === 'table' && (
        <ProjectTable projects={filteredProjects} />
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
