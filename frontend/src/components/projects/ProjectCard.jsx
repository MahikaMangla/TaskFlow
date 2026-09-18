import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/format'
import Avatar, { AvatarGroup } from '../ui/Avatar'
import ProgressBar from '../ui/ProgressBar'
import { ProjectPriorityBadge, ProjectStatusBadge } from './ProjectBadges'
import cn from '../../utils/cn'

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className={cn(
        'group flex flex-col rounded-xl border border-border bg-surface-raised p-5',
        'transition-all duration-200 hover:border-border hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="h-3 w-3 shrink-0 rounded-md"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="truncate text-sm font-semibold text-text-primary group-hover:text-accent">
            {project.name}
          </h3>
        </div>
        <ProjectPriorityBadge priority={project.priority} size="sm" />
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
        {project.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ProjectStatusBadge status={project.status} size="sm" />
        {project.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-border-subtle px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4">
        <ProgressBar value={project.progress} color={project.color} size="sm" />
        <div className="mt-1.5 flex items-center justify-between text-xs text-text-tertiary">
          <span>
            {project.tasksCompleted}/{project.tasksTotal} tasks
          </span>
          <span className="font-medium tabular-nums text-text-secondary">
            {project.progress}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
        <AvatarGroup>
          {project.members.slice(0, 4).map((member) => (
            <Avatar
              key={member.id}
              name={member.name}
              initials={member.initials}
              color={member.color}
              size="sm"
            />
          ))}
          {project.members.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-border-subtle text-[10px] font-medium text-text-secondary ring-2 ring-surface">
              +{project.members.length - 4}
            </div>
          )}
        </AvatarGroup>
        <div className="text-right text-xs text-text-tertiary">
          <p>{formatDate(project.startDate)} – {formatDate(project.endDate)}</p>
        </div>
      </div>
    </Link>
  )
}
