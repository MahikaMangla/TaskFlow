/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../lib/api'

const TasksContext = createContext(null)

function buildQuery(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') params.set(key, value)
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function TasksProvider({ children }) {
  const { accessToken } = useAuth()
  const [tasks, setTasks] = useState([])
  const [labels, setLabels] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const lastFiltersRef = useRef({})

  const fetchTasks = useCallback(async (filters = {}, { silent = false } = {}) => {
    lastFiltersRef.current = filters
    if (!silent) {
      setStatus('loading')
      setError(null)
    }
    try {
      const response = await apiRequest(`/tasks${buildQuery(filters)}`, { token: accessToken })
      setTasks(response.tasks ?? [])
      setStatus('success')
      return response.tasks ?? []
    } catch (requestError) {
      if (!silent) {
        setError(requestError.message)
        setStatus('error')
      }
      throw requestError
    }
  }, [accessToken])

  const fetchLabels = useCallback(async () => {
    try {
      const response = await apiRequest('/tasks/labels', { token: accessToken })
      setLabels(response.labels ?? [])
      return response.labels ?? []
    } catch {
      return []
    }
  }, [accessToken])

  useEffect(() => {
    let cancelled = false
    apiRequest('/tasks', { token: accessToken })
      .then((response) => {
        if (!cancelled) {
          setTasks(response.tasks ?? [])
          setStatus('success')
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message)
          setStatus('error')
        }
      })
    apiRequest('/tasks/labels', { token: accessToken })
      .then((response) => {
        if (!cancelled) setLabels(response.labels ?? [])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [accessToken])

  const getTaskById = useCallback((id) => tasks.find((task) => task.id === id) ?? null, [tasks])

  const fetchTaskById = useCallback(async (taskId) => {
    const response = await apiRequest(`/tasks/${taskId}`, { token: accessToken })
    const task = response.task
    setTasks((previous) => {
      const exists = previous.some((item) => item.id === task.id)
      return exists ? previous.map((item) => (item.id === task.id ? task : item)) : [...previous, task]
    })
    return task
  }, [accessToken])

  const createTask = useCallback(async (input) => {
    const response = await apiRequest('/tasks', {
      token: accessToken,
      method: 'POST',
      body: JSON.stringify(input),
    })
    setTasks((previous) => [response.task, ...previous])
    await fetchLabels()
    await fetchTasks(lastFiltersRef.current, { silent: true }).catch(() => {})
    return response.task
  }, [accessToken, fetchLabels, fetchTasks])

  const updateTask = useCallback(async (taskId, input) => {
    const response = await apiRequest(`/tasks/${taskId}`, {
      token: accessToken,
      method: 'PATCH',
      body: JSON.stringify(input),
    })
    setTasks((previous) => previous.map((item) => (item.id === taskId ? response.task : item)))
    await fetchLabels()
    await fetchTasks(lastFiltersRef.current, { silent: true }).catch(() => {})
    return response.task
  }, [accessToken, fetchLabels, fetchTasks])

  const updateTaskStatus = useCallback(async (taskId, newStatus, order) => {
    const response = await apiRequest(`/tasks/${taskId}/status`, {
      token: accessToken,
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, ...(order !== undefined ? { order } : {}) }),
    })
    setTasks((previous) => previous.map((item) => (item.id === taskId ? response.task : item)))
    await fetchTasks(lastFiltersRef.current, { silent: true }).catch(() => {})
    return response.task
  }, [accessToken, fetchTasks])

  const deleteTask = useCallback(async (taskId) => {
    await apiRequest(`/tasks/${taskId}`, { token: accessToken, method: 'DELETE' })
    setTasks((previous) => previous.filter((task) => task.id !== taskId))
  }, [accessToken])

  const value = useMemo(() => ({
    tasks, labels, status, error, fetchTasks, fetchLabels, getTaskById, fetchTaskById,
    createTask, updateTask, updateTaskStatus, deleteTask, isLoading: status === 'loading',
  }), [tasks, labels, status, error, fetchTasks, fetchLabels, getTaskById, fetchTaskById, createTask, updateTask, updateTaskStatus, deleteTask])

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) throw new Error('useTasks must be used within TasksProvider')
  return context
}
