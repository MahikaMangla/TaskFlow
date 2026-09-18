import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { ProjectsProvider } from './context/ProjectsContext'
import { SprintsProvider } from './context/SprintsContext'
import { TasksProvider } from './context/TasksContext'
import DashboardPage from './pages/DashboardPage'
import ReportsPage from './pages/ReportsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectsPage from './pages/ProjectsPage'
import SprintDetailPage from './pages/SprintDetailPage'
import SprintsPage from './pages/SprintsPage'
import TaskDetailPage from './pages/TaskDetailPage'
import TasksPage from './pages/TasksPage'
import { TeamProvider } from './context/TeamContext'
import TeamPage from './pages/TeamPage'
import TeamMemberDetailPage from './pages/TeamMemberDetailPage'
import HelpPage from './pages/HelpPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'
import InvitationAcceptPage from './pages/InvitationAcceptPage'
import { ProtectedRoute, PublicRoute } from './components/auth/RouteGuards'

function WorkspaceProviders() {
  return <ProjectsProvider><TasksProvider><SprintsProvider><TeamProvider><Outlet /></TeamProvider></SprintsProvider></TasksProvider></ProjectsProvider>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="accept-invitation" element={<InvitationAcceptPage />} />
        <Route element={<PublicRoute />}>
          <Route path="login" element={<AuthPage key="login" mode="login" />} />
          <Route path="signup" element={<AuthPage key="signup" mode="signup" />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<WorkspaceProviders />}>
                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="projects/:id" element={<ProjectDetailPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="tasks/:id" element={<TaskDetailPage />} />
                  <Route path="sprints" element={<SprintsPage />} />
                  <Route path="sprints/:id" element={<SprintDetailPage />} />
                  <Route path="team" element={<TeamPage />} />
                  <Route path="team/:id" element={<TeamMemberDetailPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="help" element={<HelpPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
