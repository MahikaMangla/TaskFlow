import { BarChart3 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ProjectProgressReport from '../components/reports/ProjectProgressReport'
import ReportsKpiCards from '../components/reports/ReportsKpiCards'
import { ReportsPageSkeleton } from '../components/reports/ReportsSkeleton'
import SprintPerformanceReport from '../components/reports/SprintPerformanceReport'
import TaskCompletionOverview from '../components/reports/TaskCompletionOverview'
import TasksByPriorityChart from '../components/reports/TasksByPriorityChart'
import TasksByStatusChart from '../components/reports/TasksByStatusChart'
import TeamWorkloadReport from '../components/reports/TeamWorkloadReport'
import EmptyState, { ErrorState } from '../components/ui/EmptyState'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../lib/api'
import { PRIORITY_CHART_COLORS, STATUS_CHART_COLORS } from '../utils/reportMetrics'

const statusLabels = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }
const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }

function chartItems(counts, labels, colors) {
  return Object.keys(labels).map((key) => ({ key, label: labels[key], count: counts?.[key] ?? 0, color: colors[key] }))
}

function toReportView(report) {
  const { summary, taskBreakdown } = report
  const tasksByStatus = chartItems(taskBreakdown?.byStatus, statusLabels, STATUS_CHART_COLORS)
  const tasksByPriority = chartItems(taskBreakdown?.byPriority, priorityLabels, PRIORITY_CHART_COLORS)
  const completedPoints = (sprint) => sprint.calculatedCompletedPoints ?? sprint.completedPoints ?? 0

  return {
    isEmpty: summary.totalProjects === 0 && summary.totalTasks === 0 && summary.totalSprints === 0,
    kpiStats: [
      { id: 'active-projects', label: 'Active Projects', value: summary.activeProjects, trend: 'neutral', icon: 'folder', suffix: `of ${summary.totalProjects} total` },
      { id: 'total-tasks', label: 'Total Tasks', value: summary.totalTasks, trend: 'neutral', icon: 'list', suffix: `${summary.activeTasks} active` },
      { id: 'completed-tasks', label: 'Completed Tasks', value: summary.completedTasks, trend: 'neutral', icon: 'check', suffix: `${summary.completionRate}% completion rate` },
      { id: 'overdue-tasks', label: 'Overdue Tasks', value: summary.overdueTasks, trend: 'neutral', icon: 'alert', suffix: summary.overdueTasks ? 'Needs attention' : 'All on schedule' },
    ],
    completionRate: summary.completionRate,
    completedTasks: summary.completedTasks,
    activeTasks: summary.activeTasks,
    totalTasks: summary.totalTasks,
    overdueTasks: summary.overdueTasks,
    tasksByStatus,
    tasksByPriority,
    inProgressCount: taskBreakdown?.byStatus?.in_progress ?? 0,
    inReviewCount: taskBreakdown?.byStatus?.in_review ?? 0,
    projectProgress: (report.projects ?? []).map((project) => ({
      ...project,
      computedProgress: project.progress,
      tasksDone: project.completedTasks,
      tasksCount: project.totalTasks,
    })),
    sprintPerformance: (report.sprints ?? []).map((sprint) => ({
      ...sprint,
      progressPercent: sprint.progress ?? 0,
      metrics: {
        totalTasks: sprint.totalTasks ?? 0,
        completedTasks: sprint.completedTasks ?? 0,
        committedPoints: sprint.committedPoints ?? 0,
        completedPoints: completedPoints(sprint),
        velocity: sprint.currentVelocity ?? sprint.velocity ?? completedPoints(sprint),
        daysRemaining: sprint.daysRemaining ?? null,
        tasksByStatus: sprint.tasksByStatus ?? { todo: 0, in_progress: 0, in_review: 0, done: 0 },
      },
    })),
    completionTrend: (report.completionTrend ?? []).map((week) => ({
      label: new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: week.completedTasks,
    })),
    teamWorkload: (report.teamWorkload ?? []).map((member) => ({ ...member, id: member.userId })),
  }
}

export default function ReportsPage() {
  const { accessToken } = useAuth()
  const [report, setReport] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const fetchReport = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const response = await apiRequest('/reports/overview', { token: accessToken })
      setReport(response.report)
      setStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }, [accessToken])

  useEffect(() => {
    let cancelled = false
    apiRequest('/reports/overview', { token: accessToken })
      .then((response) => {
        if (!cancelled) {
          setReport(response.report)
          setStatus('success')
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message)
          setStatus('error')
        }
      })
    return () => { cancelled = true }
  }, [accessToken])

  const metrics = useMemo(() => (report ? toReportView(report) : null), [report])

  if (status === 'loading') return <ReportsPageSkeleton />
  if (error) return <ErrorState title="Unable to load reports" description={error} onRetry={fetchReport} />

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header className="animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted"><BarChart3 className="h-5 w-5 text-accent" strokeWidth={1.5} /></div>
          <div><h1 className="text-2xl font-semibold tracking-tight text-text-primary">Reports</h1><p className="mt-0.5 text-sm text-text-secondary">Analytics and insights across projects, tasks, sprints and team workload</p></div>
        </div>
      </header>

      {metrics?.isEmpty ? (
        <div className="rounded-xl border border-border bg-surface-raised"><EmptyState icon={BarChart3} title="No report data yet" description="Create projects, tasks, or sprints to start seeing workspace insights." /></div>
      ) : (
        <>
          <ReportsKpiCards stats={metrics.kpiStats} />
          <TaskCompletionOverview completionRate={metrics.completionRate} completedTasks={metrics.completedTasks} activeTasks={metrics.activeTasks} totalTasks={metrics.totalTasks} overdueTasks={metrics.overdueTasks} completionTrend={metrics.completionTrend} maxTrendCount={Math.max(...metrics.completionTrend.map((week) => week.count), 1)} />
          <div className="grid gap-6 lg:grid-cols-2"><TasksByStatusChart items={metrics.tasksByStatus} completionRate={metrics.completionRate} inProgressCount={metrics.inProgressCount} inReviewCount={metrics.inReviewCount} /><TasksByPriorityChart items={metrics.tasksByPriority} /></div>
          <ProjectProgressReport projects={metrics.projectProgress} />
          <div className="grid gap-6 lg:grid-cols-2"><SprintPerformanceReport sprints={metrics.sprintPerformance} /><TeamWorkloadReport members={metrics.teamWorkload} /></div>
        </>
      )}
    </div>
  )
}
