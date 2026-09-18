import { useMemo, useState } from 'react'
import { TASK_PRIORITIES } from '../constants/tasks'

const defaultFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  assignee: 'all',
  project: 'all',
  sprint: 'all',
  sort: 'updated-desc',
}

export function useTaskFilters(tasks) {
  const [filters, setFilters] = useState(defaultFilters)
  const [viewMode, setViewMode] = useState('list')

  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    if (filters.search.trim()) {
      const query = filters.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.labels.some((l) => l.toLowerCase().includes(query)),
      )
    }

    if (filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status)
    }

    if (filters.priority !== 'all') {
      result = result.filter((t) => t.priority === filters.priority)
    }

    if (filters.assignee === 'unassigned') {
      result = result.filter((t) => !t.assigneeId)
    } else if (filters.assignee !== 'all') {
      result = result.filter((t) => t.assigneeId === filters.assignee)
    }

    if (filters.project !== 'all') {
      result = result.filter((t) => t.projectId === filters.project)
    }

    if (filters.sprint === 'none') {
      result = result.filter((t) => !t.sprintId)
    } else if (filters.sprint !== 'all') {
      result = result.filter((t) => t.sprintId === filters.sprint)
    }

    result.sort((a, b) => {
      switch (filters.sort) {
        case 'dueDate-asc': {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        }
        case 'dueDate-desc': {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(b.dueDate) - new Date(a.dueDate)
        }
        case 'priority-desc':
          return TASK_PRIORITIES[b.priority].order - TASK_PRIORITIES[a.priority].order
        case 'priority-asc':
          return TASK_PRIORITIES[a.priority].order - TASK_PRIORITIES[b.priority].order
        case 'updated-desc':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt)
      }
    })

    return result
  }, [tasks, filters])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => setFilters(defaultFilters)

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.assignee !== 'all' ||
    filters.project !== 'all' ||
    filters.sprint !== 'all'

  return {
    filters,
    viewMode,
    filteredTasks,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    setViewMode,
  }
}

export function getTaskStats(tasks) {
  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    inReview: tasks.filter((t) => t.status === 'in_review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }
}

export function groupTasksByStatus(tasks) {
  const groups = {
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  }
  tasks.forEach((task) => {
    if (groups[task.status]) {
      groups[task.status].push(task)
    }
  })
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  })
  return groups
}
