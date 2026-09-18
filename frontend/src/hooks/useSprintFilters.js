import { useMemo, useState } from 'react'

const defaultFilters = {
  search: '',
  status: 'all',
}

export function useSprintFilters(sprints) {
  const [filters, setFilters] = useState(defaultFilters)

  const filteredSprints = useMemo(() => {
    let result = [...sprints]

    if (filters.search.trim()) {
      const query = filters.search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.goal.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query),
      )
    }

    if (filters.status !== 'all') {
      result = result.filter((s) => s.status === filters.status)
    }

    result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

    return result
  }, [sprints, filters])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => setFilters(defaultFilters)

  const hasActiveFilters =
    filters.search.trim() !== '' || filters.status !== 'all'

  return {
    filters,
    filteredSprints,
    hasActiveFilters,
    updateFilter,
    resetFilters,
  }
}

export function getSprintOverviewStats(sprints) {
  return {
    total: sprints.length,
    active: sprints.filter((s) => s.status === 'active').length,
    planning: sprints.filter((s) => s.status === 'planning').length,
    completed: sprints.filter((s) => s.status === 'completed').length,
  }
}
