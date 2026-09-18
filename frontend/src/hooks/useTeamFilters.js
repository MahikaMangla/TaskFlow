import { useMemo, useState } from 'react'
import { computeMemberWorkload } from '../utils/teamMetrics'

const defaultFilters = {
  search: '',
  role: 'all',
  department: 'all',
  availability: 'all',
  sort: 'name-asc',
}

export function useTeamFilters(members, tasks = []) {
  const [filters, setFilters] = useState(defaultFilters)
  const [viewMode, setViewMode] = useState('grid')

  const membersWithWorkload = useMemo(
    () =>
      members.map((member) => ({
        ...member,
        workload: computeMemberWorkload(member.id, tasks),
      })),
    [members, tasks],
  )

  const filteredMembers = useMemo(() => {
    let result = [...membersWithWorkload]

    if (filters.search.trim()) {
      const query = filters.search.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.title.toLowerCase().includes(query) ||
          m.department.toLowerCase().includes(query),
      )
    }

    if (filters.role !== 'all') {
      result = result.filter((m) => m.roleKey === filters.role)
    }

    if (filters.department !== 'all') {
      result = result.filter((m) => m.department === filters.department)
    }

    if (filters.availability !== 'all') {
      result = result.filter((m) => m.availability === filters.availability)
    }

    result.sort((a, b) => {
      switch (filters.sort) {
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'workload-desc':
          return b.workload.assignedPercent - a.workload.assignedPercent
        case 'workload-asc':
          return a.workload.assignedPercent - b.workload.assignedPercent
        case 'joined-desc':
          return new Date(b.joinedAt) - new Date(a.joinedAt)
        case 'joined-asc':
          return new Date(a.joinedAt) - new Date(b.joinedAt)
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return result
  }, [membersWithWorkload, filters])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => setFilters(defaultFilters)

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.role !== 'all' ||
    filters.department !== 'all' ||
    filters.availability !== 'all'

  return {
    filters,
    viewMode,
    filteredMembers,
    membersWithWorkload,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    setViewMode,
  }
}

export function getTeamStats(members) {
  return {
    total: members.length,
    available: members.filter((m) => m.availability === 'available').length,
    busy: members.filter((m) => m.availability === 'busy').length,
    away: members.filter((m) => m.availability === 'away').length,
  }
}
