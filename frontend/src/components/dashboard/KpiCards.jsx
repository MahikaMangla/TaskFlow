import {
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import cn from '../../utils/cn'

const iconMap = {
  folder: FolderKanban,
  list: ListTodo,
  check: CheckCircle2,
  alert: AlertTriangle,
}

const metricIcons = {
  'active-projects': FolderKanban,
  'tasks-completed': CheckCircle2,
  'overdue-tasks': AlertTriangle,
  'team-members': Users,
}

function KpiCard({ stat, index }) {
  const Icon = iconMap[stat.icon] ?? metricIcons[stat.id] ?? ListTodo
  const isPositiveTrend =
    stat.id === 'overdue-tasks' ? stat.trend === 'down' : stat.trend === 'up'

  return (
    <article
      className="group rounded-xl border border-border bg-surface-raised p-5 transition-all duration-200 hover:border-border hover:shadow-sm animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
            stat.id === 'overdue-tasks'
              ? 'bg-danger-muted text-danger'
              : 'bg-accent-muted text-accent',
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
        {stat.value.toLocaleString()}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        {typeof stat.change !== 'number' ? <span className="text-xs text-text-tertiary">Current workspace</span> : <>
        {isPositiveTrend ? (
          <TrendingUp className="h-3.5 w-3.5 text-success" strokeWidth={2} />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-danger" strokeWidth={2} />
        )}
        <span
          className={cn(
            'text-xs font-medium',
            isPositiveTrend ? 'text-success' : 'text-danger',
          )}
        >
          {stat.change > 0 ? '+' : ''}
          {stat.change}%
        </span>
        <span className="text-xs text-text-tertiary">vs last month</span></>}
      </div>
    </article>
  )
}

export default function KpiCards({ stats }) {
  return (
    <section aria-label="Key metrics">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <KpiCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>
    </section>
  )
}
