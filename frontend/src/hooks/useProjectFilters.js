import { useMemo, useState } from 'react'
import { PROJECT_PRIORITIES } from '../constants/projects'

const defaultFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  sort: 'updated-desc',
}

export function useProjectFilters(projects) {
  const [filters, setFilters] = useState(defaultFilters)
  const [viewMode, setViewMode] = useState('grid')

  const filteredProjects = useMemo(() => {
    let result = [...projects]

    if (filters.search.trim()) {
      const query = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    if (filters.status !== 'all') {
      result = result.filter((p) => p.status === filters.status)
    }

    if (filters.priority !== 'all') {
      result = result.filter((p) => p.priority === filters.priority)
    }

    result.sort((a, b) => {
      switch (filters.sort) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'progress-desc':
          return b.progress - a.progress
        case 'progress-asc':
          return a.progress - b.progress
        case 'endDate-asc':
          return new Date(a.endDate) - new Date(b.endDate)
        case 'endDate-desc':
          return new Date(b.endDate) - new Date(a.endDate)
        case 'priority-desc':
          return PROJECT_PRIORITIES[b.priority].order - PROJECT_PRIORITIES[a.priority].order
        case 'updated-desc':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt)
      }
    })

    return result
  }, [projects, filters])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => setFilters(defaultFilters)

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all'

  return {
    filters,
    viewMode,
    filteredProjects,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    setViewMode,
  }
}

export function getProjectStats(projects) {
  return {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    planning: projects.filter((p) => p.status === 'planning').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  }
}
