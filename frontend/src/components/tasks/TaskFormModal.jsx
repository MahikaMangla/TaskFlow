import { useEffect, useState } from 'react'
import { TASK_PRIORITIES, TASK_STATUSES } from '../../constants/tasks'
import { useProjects } from '../../context/ProjectsContext'
import { useTasks } from '../../context/TasksContext'
import { useAuth } from '../../hooks/useAuth'
import { apiRequest } from '../../lib/api'
import Button from '../ui/Button'
import Input, { Textarea } from '../ui/Input'
import Modal, { ModalFooter } from '../ui/Modal'
import Select from '../ui/Select'

const statusOptions = Object.entries(TASK_STATUSES).map(([value, { label }]) => ({
  value,
  label,
}))

const priorityOptions = Object.entries(TASK_PRIORITIES).map(([value, { label }]) => ({
  value,
  label,
}))

const storyPointOptions = [
  { value: '', label: 'Unestimated' },
  ...[1, 2, 3, 5, 8, 13, 21].map((value) => ({ value: String(value), label: `${value} points` })),
]

const emptyForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  storyPoints: '3',
  projectId: '',
  sprintId: '',
  assigneeId: '',
  dueDate: '',
  labels: '',
}

function taskToForm(task) {
  if (!task) return emptyForm
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    storyPoints: task.storyPoints == null ? '' : String(task.storyPoints),
    projectId: task.projectId,
    sprintId: task.sprintId ?? '',
    assigneeId: task.assigneeId ?? '',
    dueDate: task.dueDate ?? '',
    labels: task.labels.join(', '),
  }
}

function validateForm(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Title is required'
  if (!form.projectId) errors.projectId = 'Project is required'
  return errors
}

export default function TaskFormModal({ open, onClose, task = null }) {
  const isEdit = Boolean(task)
  const { projects } = useProjects()
  const { accessToken } = useAuth()
  const { createTask, labels, updateTask } = useTasks()
  const [sprints, setSprints] = useState([])
  const [members, setMembers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    Promise.all([
      apiRequest('/sprints', { token: accessToken }),
    ])
      .then(([sprintsResponse]) => {
        if (cancelled) return
        setSprints(sprintsResponse.sprints ?? [])
      })
      .catch((requestError) => {
        if (!cancelled) setErrors((previous) => ({ ...previous, form: requestError.message }))
      })
    return () => { cancelled = true }
  }, [open, accessToken])

  useEffect(() => {
    if (!open || !form.projectId) {
      setMembers([])
      return undefined
    }
    let cancelled = false
    apiRequest(`/projects/${form.projectId}`, { token: accessToken })
      .then((response) => {
        if (!cancelled) {
          const projectMembers = response.project?.members ?? []
          setMembers(projectMembers)
          setForm((current) => projectMembers.some((member) => member.id === current.assigneeId)
            ? current
            : { ...current, assigneeId: '' })
        }
          })
      .catch((requestError) => {
        if (!cancelled) setErrors((previous) => ({ ...previous, form: requestError.message }))
      })
    return () => { cancelled = true }
  }, [open, form.projectId, accessToken])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      setForm(taskToForm(task))
      setErrors({})
    }, 0)
    return () => clearTimeout(timer)
  }, [open, task])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    setForm(emptyForm)
    setErrors({})
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      storyPoints: form.storyPoints ? Number(form.storyPoints) : null,
      projectId: form.projectId,
      sprintId: form.sprintId || null,
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate || null,
      labels: form.labels
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
    }

    try {
      if (isEdit) {
        await updateTask(task.id, payload)
      } else {
        await createTask(payload)
      }
      handleClose()
    } catch (requestError) {
      setErrors((previous) => ({ ...previous, form: requestError.message }))
    } finally {
      setSubmitting(false)
    }
  }

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }))
  const sprintOptions = [
    { value: '', label: 'No sprint' },
    ...sprints.map((s) => ({ value: s.id, label: s.name })),
  ]
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((member) => ({ value: member.id, label: member.name })),
  ]

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit task' : 'Create task'}
      description={isEdit ? 'Update task details.' : 'Add a new task to your workspace.'}
      size="lg"
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <p role="alert" className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">
            {errors.form}
          </p>
        )}
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g. Implement user authentication"
          error={errors.title}
          required
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe the task..."
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Status"
            options={statusOptions}
            value={form.status}
            onChange={(val) => updateField('status', val)}
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={form.priority}
            onChange={(val) => updateField('priority', val)}
          />
          <Select label="Story points" options={storyPointOptions} value={form.storyPoints} onChange={(val) => updateField('storyPoints', val)} />
        </div>

        <Select
          label="Project"
          options={[{ value: '', label: 'Select project' }, ...projectOptions]}
          value={form.projectId}
          onChange={(val) => updateField('projectId', val)}
        />
        {errors.projectId && (
          <p className="-mt-2 text-xs text-danger">{errors.projectId}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Sprint"
            options={sprintOptions}
            value={form.sprintId}
            onChange={(val) => updateField('sprintId', val)}
          />
          <Select
            label="Assignee"
            options={assigneeOptions}
            value={form.assigneeId}
            onChange={(val) => updateField('assigneeId', val)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
          />
          <Input
            label="Labels"
            value={form.labels}
            onChange={(e) => updateField('labels', e.target.value)}
            placeholder="frontend, bug, urgent"
            hint={labels.length ? `Separate with commas · Existing: ${labels.map((label) => label.name).slice(0, 4).join(', ')}` : 'Separate with commas'}
          />
        </div>
      </form>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          form="task-form"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create task'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
