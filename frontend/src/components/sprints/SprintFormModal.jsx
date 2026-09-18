import { useEffect, useState } from 'react'
import { SPRINT_STATUSES } from '../../constants/sprints'
import { useSprints } from '../../context/SprintsContext'
import Button from '../ui/Button'
import Input, { Textarea } from '../ui/Input'
import Modal, { ModalFooter } from '../ui/Modal'
import Select from '../ui/Select'

const statusOptions = Object.entries(SPRINT_STATUSES).map(([value, { label }]) => ({
  value,
  label,
}))

const emptyForm = {
  name: '',
  goal: '',
  description: '',
  status: 'planning',
  startDate: '',
  endDate: '',
  committedPoints: '',
}

function sprintToForm(sprint) {
  if (!sprint) return emptyForm
  return {
    name: sprint.name,
    goal: sprint.goal,
    description: sprint.description,
    status: sprint.status,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    committedPoints: String(sprint.committedPoints ?? ''),
  }
}

function validateForm(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Sprint name is required'
  if (!form.goal.trim()) errors.goal = 'Sprint goal is required'
  if (!form.startDate) errors.startDate = 'Start date is required'
  if (!form.endDate) errors.endDate = 'End date is required'
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = 'End date must be after start date'
  }
  return errors
}

export default function SprintFormModal({ open, onClose, sprint = null }) {
  const isEdit = Boolean(sprint)
  const { createSprint, updateSprint } = useSprints()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      setForm(sprintToForm(sprint))
      setErrors({})
    }, 0)
    return () => clearTimeout(timer)
  }, [open, sprint])

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
      name: form.name.trim(),
      goal: form.goal.trim(),
      description: form.description.trim(),
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      committedPoints: parseInt(form.committedPoints, 10) || 0,
    }

    try {
      if (isEdit) {
        await updateSprint(sprint.id, payload)
      } else {
        await createSprint(payload)
      }
      handleClose()
    } catch (requestError) {
      setErrors((previous) => ({ ...previous, form: requestError.message }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit sprint' : 'Create sprint'}
      description={
        isEdit ? 'Update sprint details and timeline.' : 'Plan a new sprint for your team.'
      }
      size="lg"
    >
      <form id="sprint-form" onSubmit={handleSubmit} className="space-y-4">
        {errors.form && <p role="alert" className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">{errors.form}</p>}
        <Input
          label="Sprint name"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="e.g. Sprint 15"
          error={errors.name}
          required
        />

        <Input
          label="Sprint goal"
          value={form.goal}
          onChange={(e) => updateField('goal', e.target.value)}
          placeholder="What should this sprint achieve?"
          error={errors.goal}
          required
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Additional context and scope..."
          rows={3}
        />

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

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Committed points"
            type="number"
            min="0"
            value={form.committedPoints}
            onChange={(e) => updateField('committedPoints', e.target.value)}
            placeholder="48"
            hint="Target story points for the sprint"
          />
          {isEdit && (
            <Select
              label="Status"
              options={statusOptions}
              value={form.status}
              onChange={(val) => updateField('status', val)}
            />
          )}
        </div>
      </form>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="sprint-form" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create sprint'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
