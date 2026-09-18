import { CalendarDays } from 'lucide-react'
import { formatFullDate, getGreeting } from '../../utils/format'

export default function WelcomeHeader({ user, dashboard }) {
  const greeting = getGreeting()
  const firstName = user.name.split(' ')[0]
  const today = formatFullDate(new Date().toISOString())
  const overdue = dashboard.kpiStats.find((stat) => stat.id === 'overdue-tasks')?.value ?? 0
  const deadlines = dashboard.upcomingDeadlines.length
  const sprint = dashboard.currentSprint

  return (
    <header className="animate-slide-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{today}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary sm:text-[28px]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            You have{' '}
            <span className="font-medium text-text-primary">{overdue} overdue tasks</span>{' '}
            and{' '}
            <span className="font-medium text-text-primary">{deadlines} deadlines</span>{' '}
            this week.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-secondary">
          <CalendarDays className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
          <span>{sprint ? `${sprint.name} · ${Math.max(0, sprint.daysRemaining ?? 0)} days left` : 'No active sprint'}</span>
        </div>
      </div>
    </header>
  )
}
