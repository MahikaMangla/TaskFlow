/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../lib/api'

const SprintsContext = createContext(null)

export function toSprint(sprint) {
  return {
    ...sprint,
    goal: sprint.goal ?? '',
    description: sprint.description ?? '',
    totalTasks: sprint.totalTasks ?? 0,
    completedTasks: sprint.completedTasks ?? 0,
    progress: sprint.progress ?? 0,
    tasksByStatus: sprint.tasksByStatus ?? { todo: 0, in_progress: 0, in_review: 0, done: 0 },
    committedPoints: sprint.committedPoints ?? 0,
    completedPoints: sprint.calculatedCompletedPoints ?? sprint.completedPoints ?? 0,
    velocity: sprint.currentVelocity ?? sprint.velocity ?? sprint.calculatedCompletedPoints ?? 0,
    daysRemaining: sprint.daysRemaining ?? null,
  }
}

export function SprintsProvider({ children }) {
  const { accessToken } = useAuth()
  const [sprints, setSprints] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const fetchSprints = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setStatus('loading')
      setError(null)
    }
    try {
      const response = await apiRequest('/sprints', { token: accessToken })
      const nextSprints = (response.sprints ?? []).map(toSprint)
      setSprints(nextSprints)
      setStatus('success')
      return nextSprints
    } catch (requestError) {
      if (!silent) {
        setError(requestError.message)
        setStatus('error')
      }
      throw requestError
    }
  }, [accessToken])

  useEffect(() => {
    let cancelled = false
    apiRequest('/sprints', { token: accessToken })
      .then((response) => {
        if (!cancelled) {
          setSprints((response.sprints ?? []).map(toSprint))
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

  const getSprintById = useCallback((id) => sprints.find((sprint) => sprint.id === id) ?? null, [sprints])

  const fetchSprintById = useCallback(async (sprintId) => {
    const response = await apiRequest(`/sprints/${sprintId}`, { token: accessToken })
    const sprint = toSprint(response.sprint)
    setSprints((previous) => {
      const exists = previous.some((item) => item.id === sprint.id)
      return exists ? previous.map((item) => (item.id === sprint.id ? sprint : item)) : [...previous, sprint]
    })
    return sprint
  }, [accessToken])

  const createSprint = useCallback(async (input) => {
    const response = await apiRequest('/sprints', {
      token: accessToken,
      method: 'POST',
      body: JSON.stringify(input),
    })
    const sprint = toSprint(response.sprint)
    setSprints((previous) => [sprint, ...previous])
    return sprint
  }, [accessToken])

  const updateSprint = useCallback(async (sprintId, input) => {
    const response = await apiRequest(`/sprints/${sprintId}`, {
      token: accessToken,
      method: 'PATCH',
      body: JSON.stringify(input),
    })
    const sprint = toSprint(response.sprint)
    setSprints((previous) => previous.map((item) => (item.id === sprintId ? sprint : item)))
    await fetchSprints({ silent: true }).catch(() => {})
    return sprint
  }, [accessToken, fetchSprints])

  const deleteSprint = useCallback(async (sprintId) => {
    await apiRequest(`/sprints/${sprintId}`, { token: accessToken, method: 'DELETE' })
    setSprints((previous) => previous.filter((sprint) => sprint.id !== sprintId))
  }, [accessToken])

  const fetchSprintTasks = useCallback(async (sprintId) => {
    const response = await apiRequest(`/sprints/${sprintId}/tasks`, { token: accessToken })
    return response.tasks ?? []
  }, [accessToken])

  const assignTasksToSprint = useCallback(async (sprintId, taskIds) => {
    const response = await apiRequest(`/sprints/${sprintId}/tasks`, {
      token: accessToken,
      method: 'POST',
      body: JSON.stringify({ taskIds }),
    })
    const sprint = toSprint(response.sprint)
    setSprints((previous) => previous.map((item) => (item.id === sprintId ? sprint : item)))
    return sprint
  }, [accessToken])

  const removeTaskFromSprint = useCallback(async (sprintId, taskId) => {
    const response = await apiRequest(`/sprints/${sprintId}/tasks/${taskId}`, {
      token: accessToken,
      method: 'DELETE',
    })
    return response.task
  }, [accessToken])

  const startSprint = useCallback((sprintId) => updateSprint(sprintId, { status: 'active' }), [updateSprint])
  const pauseSprint = useCallback((sprintId) => updateSprint(sprintId, { status: 'paused' }), [updateSprint])
  const completeSprint = useCallback((sprintId) => updateSprint(sprintId, { status: 'completed' }), [updateSprint])

  const value = useMemo(() => ({
    sprints, status, error, fetchSprints, getSprintById, fetchSprintById, createSprint,
    updateSprint, deleteSprint, fetchSprintTasks, assignTasksToSprint, removeTaskFromSprint,
    startSprint, pauseSprint, completeSprint, isLoading: status === 'loading',
  }), [sprints, status, error, fetchSprints, getSprintById, fetchSprintById, createSprint, updateSprint, deleteSprint, fetchSprintTasks, assignTasksToSprint, removeTaskFromSprint, startSprint, pauseSprint, completeSprint])

  return <SprintsContext.Provider value={value}>{children}</SprintsContext.Provider>
}

export function useSprints() {
  const context = useContext(SprintsContext)
  if (!context) throw new Error('useSprints must be used within SprintsProvider')
  return context
}
