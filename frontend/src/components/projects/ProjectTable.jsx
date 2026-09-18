import { ArrowUpDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/format'
import Avatar, { AvatarGroup } from '../ui/Avatar'
import ProgressBar from '../ui/ProgressBar'
import { ProjectPriorityBadge, ProjectStatusBadge } from './ProjectBadges'

export default function ProjectTable({ projects }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-raised">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-border-subtle/50">
              <th className="px-4 py-3 font-medium text-text-secondary">Project</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Priority</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Progress</th>
              <th className="hidden px-4 py-3 font-medium text-text-secondary md:table-cell">
                Team
              </th>
              <th className="px-4 py-3 font-medium text-text-secondary">Timeline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="group transition-colors hover:bg-border-subtle/50"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-md"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary group-hover:text-accent">
                        {project.name}
                      </p>
                      <p className="truncate text-xs text-text-tertiary">
                        {project.tasksCompleted}/{project.tasksTotal} tasks
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <ProjectStatusBadge status={project.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <ProjectPriorityBadge priority={project.priority} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="w-32">
                    <ProgressBar
                      value={project.progress}
                      color={project.color}
                      size="sm"
                    />
                    <p className="mt-1 text-xs tabular-nums text-text-tertiary">
                      {project.progress}%
                    </p>
                  </div>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <AvatarGroup>
                    {project.members.slice(0, 3).map((member) => (
                      <Avatar
                        key={member.id}
                        name={member.name}
                        initials={member.initials}
                        color={member.color}
                        size="sm"
                      />
                    ))}
                    {project.members.length > 3 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-border-subtle text-[10px] font-medium text-text-secondary ring-2 ring-surface">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </AvatarGroup>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <ArrowUpDown className="h-3 w-3 text-text-tertiary" strokeWidth={1.5} />
                    <span>
                      {formatDate(project.startDate)} – {formatDate(project.endDate)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ProjectTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-raised">
      <div className="space-y-0 divide-y divide-border-subtle">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="h-2.5 w-2.5 rounded-full bg-border-subtle animate-shimmer bg-linear-to-r from-border-subtle via-border to-border-subtle bg-size-[200%_100%]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-border-subtle animate-shimmer bg-linear-to-r from-border-subtle via-border to-border-subtle bg-size-[200%_100%]" />
              <div className="h-3 w-24 rounded bg-border-subtle animate-shimmer bg-linear-to-r from-border-subtle via-border to-border-subtle bg-size-[200%_100%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
