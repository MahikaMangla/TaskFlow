import { useState } from 'react'
import {
  AVAILABILITY,
  DEPARTMENTS,
  MEMBER_COLORS,
  MEMBER_ROLES,
  WORKSPACE_ROLE_OPTIONS,
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

const initialForm = {
  name: '',
  email: '',
  title: '',
  workspaceRole: 'member',
  roleKey: 'engineer',
  department: 'engineering',
  availability: 'available',
  location: '',
  bio: '',
  color: MEMBER_COLORS[0],
}

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

export default function InviteMemberModal({ open, onClose, onInvited }) {
  const { createInvitation } = useTeam()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    setForm(initialForm)
    setErrors({})
    setResult(null)
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
    setErrors({})
    try {
      const response = await createInvitation({
        email: form.email.trim().toLowerCase(),
        role: form.workspaceRole,
        name: form.name.trim(),
        title: form.title.trim(),
        roleKey: form.roleKey,
        department: form.department,
        availability: form.availability,
        location: form.location.trim(),
        bio: form.bio.trim(),
        color: form.color,
      })
      setResult(response)
      onInvited?.(response)
    } catch (requestError) {
      setErrors({ form: requestError.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyLink = async () => {
    if (!result?.acceptUrl) return
    await navigator.clipboard.writeText(result.acceptUrl)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Invite team member"
      description="Create a secure invitation link for development. Email delivery is not configured."
      size="lg"
    >
      {result ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-success/20 bg-success-muted px-4 py-3">
            <p className="text-sm font-medium text-text-primary">Invitation created</p>
            <p className="mt-1 text-sm text-text-secondary">
              Share this development link with {result.invitation.email}. It expires on{' '}
              {new Date(result.invitation.expiresAt).toLocaleString()}.
            </p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-text-secondary">Development invitation link</span>
            <div className="flex gap-2">
              <input
                readOnly
                value={result.acceptUrl}
                className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-border-subtle px-3 text-sm text-text-primary"
              />
              <Button variant="secondary" type="button" onClick={handleCopyLink}>
                Copy
              </Button>
            </div>
          </label>
          <p className="text-xs text-text-tertiary">
            No email was sent. The invitee can open this link to create an account or sign in and join your workspace.
          </p>
        </div>
      ) : (
        <form id="invite-member-form" onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <p role="alert" className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">
              {errors.form}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g. Jordan Lee"
              error={errors.name}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="jordan.lee@taskflow.io"
              error={errors.email}
              required
            />
          </div>

          <Input
            label="Job title"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Frontend Engineer"
            error={errors.title}
            required
          />

          <Select
            label="Workspace permission"
            options={WORKSPACE_ROLE_OPTIONS}
            value={form.workspaceRole}
            onChange={(val) => updateField('workspaceRole', val)}
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
            placeholder="City, State"
          />

          <Textarea
            label="Bio"
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Brief description of role and focus areas..."
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
      )}

      <ModalFooter>
        {result ? (
          <Button variant="primary" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="invite-member-form"
              disabled={submitting}
            >
              {submitting ? 'Creating invite...' : 'Create invitation link'}
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  )
}
