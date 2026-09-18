import { useEffect, useState } from 'react'
import {
  PROJECT_COLORS,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
} from '../../constants/projects'
import { useProjects } from '../../context/ProjectsContext'
import Button from '../ui/Button'
import Input, { Textarea } from '../ui/Input'
import Modal, { ModalFooter } from '../ui/Modal'
import Select from '../ui/Select'
import cn from '../../utils/cn'

const statusOptions = Object.entries(PROJECT_STATUSES).map(([value, { label }]) => ({
  value,
  label,
}))

const priorityOptions = Object.entries(PROJECT_PRIORITIES).map(([value, { label }]) => ({
  value,
  label,
}))

const initialForm = {
  name: '',
  description: '',
  status: 'planning',
  priority: 'medium',
  startDate: '',
  endDate: '',
  color: PROJECT_COLORS[0],
  tags: '',
}

function validateForm(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Project name is required'
  if (!form.startDate) errors.startDate = 'Start date is required'
  if (!form.endDate) errors.endDate = 'End date is required'
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = 'End date must be after start date'
  }
  return errors
}

function projectToForm(project) {
  if (!project) return initialForm
  return {
    name: project.name ?? '', description: project.description ?? '', status: project.status ?? 'planning',
    priority: project.priority ?? 'medium', startDate: project.startDate ?? '', endDate: project.endDate ?? '',
    color: project.color ?? PROJECT_COLORS[0], tags: (project.tags ?? []).join(', '),
  }
}

export default function CreateProjectModal({ open, onClose, project = null, onSaved }) {
  const isEdit = Boolean(project)
  const { createProject, updateProject } = useProjects()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      setForm(projectToForm(project))
      setErrors({})
      setSubmitError('')
    }, 0)
    return () => clearTimeout(timer)
  }, [open, project])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    setForm(initialForm)
    setErrors({})
    setSubmitError('')
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
    try {
      const payload = {
        name: form.name.trim(), description: form.description.trim(), status: form.status,
        priority: form.priority, startDate: form.startDate, endDate: form.endDate, color: form.color,
      }
      const savedProject = isEdit ? await updateProject(project.id, payload) : await createProject(payload)
      onSaved?.(savedProject)
      handleClose()
    } catch (requestError) {
      setSubmitError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit project' : 'Create project'}
      description={isEdit ? 'Update project details and timeline.' : 'Set up a new project for your team.'}
      size="lg"
    >
      <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project name"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="e.g. Platform Redesign"
          error={errors.name}
          required
        />

        {submitError && <p role="alert" className="text-sm text-danger">{submitError}</p>}

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Brief description of the project goals..."
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            error={errors.startDate}
            required
          />
          <Input
            label="End date"
            type="date"
            value={form.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
            error={errors.endDate}
            required
          />
        </div>

        <Input
          label="Tags"
          value={form.tags}
          placeholder="design, frontend, ux"
          hint="Tags are not supported by the current backend."
          disabled
        />

        <div className="space-y-2">
          <span className="block text-sm font-medium text-text-primary">Color</span>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateField('color', color)}
                className={cn(
                  'h-8 w-8 rounded-lg transition-transform hover:scale-110',
                  form.color === color && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      </form>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          form="create-project-form"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create project'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
