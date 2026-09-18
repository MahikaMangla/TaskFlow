const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
const SESSION_STORAGE_KEY = 'taskflow.auth'
let refreshPromise = null

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function emitSessionEvent(name, detail) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(name, { detail }))
}

async function refreshStoredSession() {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    let saved
    try { saved = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY)) } catch { saved = null }
    if (!saved?.refreshToken) return null

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: saved.refreshToken }),
    })
    if (!response.ok) return null
    const result = await response.json().catch(() => null)
    if (!result?.tokens?.accessToken || !result?.tokens?.refreshToken || !result?.user) return null
    const session = { user: result.user, ...result.tokens }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    emitSessionEvent('taskflow:session-refreshed', session)
    return session.accessToken
  })().finally(() => { refreshPromise = null })
  return refreshPromise
}

async function request(path, token, headers, options) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
}

export async function apiRequest(path, { token, headers, ...options } = {}, retried = false) {
  const response = await request(path, token, headers, options)
  if (response.status === 401 && token && !retried && !path.startsWith('/auth/')) {
    const refreshedToken = await refreshStoredSession()
    if (refreshedToken) return apiRequest(path, { token: refreshedToken, headers, ...options }, true)
    emitSessionEvent('taskflow:session-expired')
  }
  const body = response.status === 204 ? null : await response.json().catch(() => null)
  const errorMessage = body?.error?.message
  if (!response.ok) throw new ApiError(typeof errorMessage === 'string' && errorMessage.trim() ? errorMessage : 'Something went wrong. Please try again.', response.status)
  return body
}
