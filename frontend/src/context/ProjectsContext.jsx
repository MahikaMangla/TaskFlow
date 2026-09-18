/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const ProjectsContext = createContext(null)

export function toProject(project) {
  return {
    ...project,
    description: project.description ?? '',
    tags: project.tags ?? [],
    tasksCompleted: project.tasksCompleted ?? 0,
    tasksTotal: project.tasksTotal ?? 0,
    members: (project.members ?? []).map((member) => ({
      ...member,
      role: member.role ?? member.title ?? member.roleKey ?? 'Member',
      projectRole: member.projectRole ?? 'developer',
    })),
  }
}

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const { accessToken } = useAuth()

  const fetchProjects = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const response = await apiRequest('/projects', { token: accessToken })
      setProjects(response.projects.map(toProject))
      setStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }, [accessToken])

  useEffect(() => {
    let cancelled = false
    apiRequest('/projects', { token: accessToken })
      .then((response) => {
        if (!cancelled) {
          setProjects(response.projects.map(toProject))
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

  const getProjectById = useCallback(
    (id) => projects.find((p) => p.id === id) ?? null,
    [projects],
  )

  const createProject = useCallback(async (input) => {
    const response = await apiRequest('/projects', { token: accessToken, method: 'POST', body: JSON.stringify(input) })
    const project = toProject(response.project)
    setProjects((previous) => [project, ...previous])
    return project
  }, [accessToken])

  const updateProject = useCallback(async (projectId, input) => {
    const response = await apiRequest(`/projects/${projectId}`, { token: accessToken, method: 'PATCH', body: JSON.stringify(input) })
    const project = toProject(response.project)
    setProjects((previous) => previous.map((item) => item.id === projectId ? project : item))
    return project
  }, [accessToken])

  const deleteProject = useCallback(async (projectId) => {
    await apiRequest(`/projects/${projectId}`, { token: accessToken, method: 'DELETE' })
    setProjects((previous) => previous.filter((project) => project.id !== projectId))
  }, [accessToken])

  const value = useMemo(
    () => ({
      projects,
      status,
      error,
      fetchProjects,
      getProjectById,
      createProject,
      updateProject,
      deleteProject,
      isLoading: status === 'loading',
    }),
    [projects, status, error, fetchProjects, getProjectById, createProject, updateProject, deleteProject],
  )

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjects must be used within ProjectsProvider')
  }
  return context
}
