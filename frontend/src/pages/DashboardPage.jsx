import { useEffect, useState } from 'react'
import KpiCards from '../components/dashboard/KpiCards'
import ProjectProgress from '../components/dashboard/ProjectProgress'
import QuickActions from '../components/dashboard/QuickActions'
import RecentActivity from '../components/dashboard/RecentActivity'
import SprintSummary from '../components/dashboard/SprintSummary'
import TaskStatusChart from '../components/dashboard/TaskStatusChart'
import TeamWorkload from '../components/dashboard/TeamWorkload'
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines'
import WelcomeHeader from '../components/dashboard/WelcomeHeader'
import { ErrorState } from '../components/ui/EmptyState'
import { DashboardSkeleton } from '../components/ui/Skeleton'
import { apiRequest } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const [status, setStatus] = useState('loading')
  const [dashboard, setDashboard] = useState(null)
  const { accessToken, user } = useAuth()

  const loadDashboard = async () => {
    setStatus('loading')
    try {
      const response = await apiRequest('/dashboard', { token: accessToken })
      setDashboard(response.dashboard)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    let cancelled = false
    apiRequest('/dashboard', { token: accessToken })
      .then((response) => {
        if (!cancelled) {
          setDashboard(response.dashboard)
          setStatus('success')
        }
      })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [accessToken])

  if (status === 'loading') {
    return <DashboardSkeleton />
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Unable to load dashboard"
        description="We couldn't fetch your dashboard data. Please check your connection and try again."
        onRetry={loadDashboard}
      />
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <WelcomeHeader user={user} dashboard={dashboard} />
      <QuickActions />
      <KpiCards stats={dashboard.kpiStats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProjectProgress projects={dashboard.projects} />
          <RecentActivity activities={dashboard.recentActivity} />
        </div>

        <div className="space-y-6">
          <SprintSummary sprint={dashboard.currentSprint} />
          <UpcomingDeadlines deadlines={dashboard.upcomingDeadlines} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TeamWorkload members={dashboard.teamWorkload} />
        <TaskStatusChart breakdown={dashboard.taskStatusBreakdown} />
      </div>
    </div>
  )
}
