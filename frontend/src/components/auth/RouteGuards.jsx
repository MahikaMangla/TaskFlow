import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

function AuthLoading() {
  return <div className="flex min-h-dvh items-center justify-center bg-surface"><div className="flex items-center gap-2 text-sm font-medium text-text-secondary"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent"><Zap className="h-4 w-4 text-white" /></span>Loading TaskFlow…</div></div>
}

export function ProtectedRoute() {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <AuthLoading />
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}

export function PublicRoute() {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <AuthLoading />
  return user ? <Navigate to={location.state?.from ?? '/'} replace /> : <Outlet />
}
