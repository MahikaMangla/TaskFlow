import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '../lib/api'
import { AuthContext } from './auth-context'

const storageKey = 'taskflow.auth'

function readSession() {
  try { return JSON.parse(localStorage.getItem(storageKey)) }
  catch { return null }
}

function persist(session) {
  if (session) localStorage.setItem(storageKey, JSON.stringify(session))
  else localStorage.removeItem(storageKey)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())
  const [ready, setReady] = useState(() => !readSession()?.refreshToken)
  const started = useRef(false)

  const applySession = (result) => {
    const next = { user: result.user, ...result.tokens }
    persist(next)
    setSession(next)
    return next
  }

  const clearSession = () => {
    persist(null)
    setSession(null)
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    const saved = readSession()
    if (!saved?.refreshToken) return
    apiRequest('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: saved.refreshToken }) })
      .then(applySession)
      .catch(clearSession)
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    const handleRefresh = (event) => setSession(event.detail)
    const handleExpired = () => clearSession()
    window.addEventListener('taskflow:session-refreshed', handleRefresh)
    window.addEventListener('taskflow:session-expired', handleExpired)
    return () => {
      window.removeEventListener('taskflow:session-refreshed', handleRefresh)
      window.removeEventListener('taskflow:session-expired', handleExpired)
    }
  }, [])

  const authenticate = async (path, payload) => applySession(await apiRequest(path, { method: 'POST', body: JSON.stringify(payload) }))
  const login = (payload) => authenticate('/auth/login', payload)
  const signup = (payload) => authenticate('/auth/register', payload)
  const acceptInvitation = async (payload) => applySession(await apiRequest('/invitations/accept', {
    method: 'POST',
    token: session?.accessToken,
    body: JSON.stringify(payload),
  }))
  const logout = async () => {
    const refreshToken = session?.refreshToken
    clearSession()
    if (refreshToken) await apiRequest('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }).catch(() => {})
  }

  const refreshUser = async () => {
    if (!session?.accessToken) return null
    const response = await apiRequest('/auth/me', { token: session.accessToken })
    const next = { ...session, user: response.user }
    persist(next)
    setSession(next)
    return response.user
  }

  return <AuthContext.Provider value={{ user: session?.user ?? null, accessToken: session?.accessToken ?? null, ready, login, signup, acceptInvitation, logout, refreshUser, establishSession: applySession }}>{children}</AuthContext.Provider>
}
