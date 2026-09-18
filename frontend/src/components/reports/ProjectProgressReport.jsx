import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PROJECT_STATUSES } from '../../constants/projects'
import { formatDate } from '../../utils/format'
import Badge from '../ui/Badge'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'

export default function ProjectProgressReport({ projects }) {
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.computedProgress, 0) / projects.length)
      : 0

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Project Progress</CardTitle>
          <span className="rounded-md bg-border-subtle px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-text-tertiary">
            {avgProgress}% avg
          </span>
        </div>
        <Link
          to="/projects"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-text-tertiary transition-colors hover:bg-border-subtle hover:text-text-primary"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </CardHeader>

      {projects.length === 0 ? (
        <p className="text-sm text-text-secondary">No projects to display.</p>
      ) : (
        <div className="space-y-5">
          {projects.map((project) => {
            const statusConfig = PROJECT_STATUSES[project.status]

            return (
              <div key={project.id} className="group">
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <Link
                      to={`/projects/${project.id}`}
                      className="truncate text-sm font-medium text-text-primary transition-colors hover:text-accent"
                    >
                      {project.name}
                    </Link>
                    {statusConfig && (
                      <Badge variant={statusConfig.variant} size="sm">
                        {statusConfig.label}
                      </Badge>
                    )}
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-text-tertiary">
                    {project.endDate ? `Due ${formatDate(project.endDate)}` : 'No due date'}
                  </span>
                </div>
                <ProgressBar
                  value={project.computedProgress}
                  color={project.color}
                  size="sm"
                />
                <div className="mt-1.5 flex items-center justify-between text-xs text-text-tertiary">
                  <span>
                    {project.tasksDone} of {project.tasksCount} tasks completed
                  </span>
                  <span className="font-medium tabular-nums text-text-secondary">
                    {project.computedProgress}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
