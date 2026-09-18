import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/format'
import Badge from '../ui/Badge'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'

const statusConfig = {
  'on-track': { label: 'On track', variant: 'success' },
  'at-risk': { label: 'At risk', variant: 'warning' },
  delayed: { label: 'Delayed', variant: 'danger' },
}

export default function ProjectProgress({ projects }) {
  return (
    <Card hover>
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
        <Link
          to="/projects"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-text-tertiary transition-colors hover:bg-border-subtle hover:text-text-primary"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </CardHeader>

      <div className="space-y-5">
        {projects.map((project) => {
          const status = statusConfig[project.status]
          return (
            <div key={project.id} className="group">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate text-sm font-medium text-text-primary">
                    {project.name}
                  </span>
                  <Badge variant={status.variant} size="sm">
                    {status.label}
                  </Badge>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-text-tertiary">
                  Due {formatDate(project.dueDate)}
                </span>
              </div>
              <ProgressBar value={project.progress} color={project.color} size="sm" />
              <div className="mt-1.5 flex items-center justify-between text-xs text-text-tertiary">
                <span>
                  {project.tasksCompleted ?? project.tasksComplete} of {project.tasksTotal} tasks
                </span>
                <span className="font-medium tabular-nums text-text-secondary">
                  {project.progress}%
                </span>
              </div>
            </div>
          )
        })}
        {projects.length === 0 && <p className="py-5 text-center text-sm text-text-secondary">No projects yet. Create a project to track its progress here.</p>}
      </div>
    </Card>
  )
}
