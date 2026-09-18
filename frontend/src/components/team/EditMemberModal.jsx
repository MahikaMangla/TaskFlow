import { useEffect, useState } from 'react'
import {
  AVAILABILITY,
  DEPARTMENTS,
  MEMBER_COLORS,
  MEMBER_ROLES,
} from '../../constants/team'
import { useTeam } from '../../context/TeamContext'
import Button from '../ui/Button'
import Input, { Textarea } from '../ui/Input'
import Modal, { ModalFooter } from '../ui/Modal'
import Select from '../ui/Select'
import cn from '../../utils/cn'

const roleOptions = Object.entries(MEMBER_ROLES).map(([value, { label }]) => ({
  value,
  label,
}))

const departmentOptions = Object.entries(DEPARTMENTS).map(([value, { label }]) => ({
  value,
  label,
}))

const availabilityOptions = Object.entries(AVAILABILITY).map(([value, { label }]) => ({
  value,
  label,
}))

function validateForm(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!form.title.trim()) errors.title = 'Job title is required'
  return errors
}

export default function EditMemberModal({ open, onClose, member }) {
  const { updateMember } = useTeam()
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (member && open) {
      setForm({
        name: member.name,
        email: member.email,
        title: member.title,
        roleKey: member.roleKey,
        department: member.department,
        availability: member.availability,
        location: member.location ?? '',
        bio: member.bio ?? '',
        color: member.color,
      })
      setErrors({})
    }
  }, [member, open])

  if (!form) return null

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    setForm(null)
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
    try {
      await updateMember(member.id, {
        name: form.name.trim(),
        title: form.title.trim(),
        roleKey: form.roleKey,
        department: form.department,
        availability: form.availability,
        location: form.location.trim(),
        bio: form.bio.trim(),
        color: form.color,
      })
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
      title="Edit member"
      description={`Update profile and role for ${member.name}.`}
      size="lg"
    >
      <form id="edit-member-form" onSubmit={handleSubmit} className="space-y-4">
        {errors.form && <p role="alert" className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">{errors.form}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            disabled
            hint="Email is managed by the account and cannot be changed here."
          />
        </div>

        <Input
          label="Job title"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          error={errors.title}
          required
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Role"
            options={roleOptions}
            value={form.roleKey}
            onChange={(val) => updateField('roleKey', val)}
          />
          <Select
            label="Department"
            options={departmentOptions}
            value={form.department}
            onChange={(val) => updateField('department', val)}
          />
          <Select
            label="Availability"
            options={availabilityOptions}
            value={form.availability}
            onChange={(val) => updateField('availability', val)}
          />
        </div>

        <Input
          label="Location"
          value={form.location}
          onChange={(e) => updateField('location', e.target.value)}
        />

        <Textarea
          label="Bio"
          value={form.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          rows={2}
        />

        <div className="space-y-2">
          <span className="block text-sm font-medium text-text-primary">Avatar color</span>
          <div className="flex flex-wrap gap-2">
            {MEMBER_COLORS.map((color) => (
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
          form="edit-member-form"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save changes'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
