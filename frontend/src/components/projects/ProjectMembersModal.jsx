import { Check, LoaderCircle, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { apiRequest } from '../../lib/api'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import Modal, { ModalFooter } from '../ui/Modal'
import Select from '../ui/Select'
import { PROJECT_ROLE_OPTIONS } from '../../constants/team'

function toMember(member) {
  return { ...member, role: member.title ?? member.roleKey ?? member.workspaceRole ?? 'Member' }
}

export default function ProjectMembersModal({ open, onClose, project, onSaved }) {
  const { accessToken } = useAuth()
  const [members, setMembers] = useState([])
  const [selectedIds, setSelectedIds] = useState(() => project.members.map((member) => member.id))
  const [roles, setRoles] = useState(() => Object.fromEntries(project.members.map((member) => [
    member.id,
    member.projectRole ?? (member.id === project.ownerId ? 'project-manager' : 'developer'),
  ])))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    apiRequest('/workspaces/members', { token: accessToken })
      .then((response) => { if (!cancelled) setMembers(response.members.map(toMember)) })
      .catch((requestError) => { if (!cancelled) setError(requestError.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [open, accessToken])

  const toggleMember = (memberId) => {
    if (memberId === project.ownerId) return
    setSelectedIds((current) => current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId])
    setRoles((current) => ({ ...current, [memberId]: current[memberId] ?? 'developer' }))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const response = await apiRequest(`/projects/${project.id}/members`, {
        token: accessToken,
        method: 'PUT',
        body: JSON.stringify({ members: selectedIds.map((userId) => ({ userId, role: userId === project.ownerId ? 'project-manager' : (roles[userId] ?? 'developer') })) }),
      })
      onSaved(response.project)
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Manage members" description="Choose workspace members assigned to this project." size="lg">
      {error && <p role="alert" className="mb-4 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">{error}</p>}
      {loading ? <div className="flex items-center justify-center py-10 text-sm text-text-secondary"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Loading members…</div> : (
        <ul className="space-y-1">
          {members.map((member) => {
            const selected = selectedIds.includes(member.id)
            const isOwner = member.id === project.ownerId
            return <li key={member.id}>
              <div className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-border-subtle">
                <button type="button" onClick={() => toggleMember(member.id)} disabled={isOwner} className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? 'border-accent bg-accent text-white' : 'border-border bg-surface'}`}><Check className={`h-3.5 w-3.5 ${selected ? 'opacity-100' : 'opacity-0'}`} strokeWidth={2.5} /></span>
                <Avatar name={member.name} initials={member.initials} color={member.color} size="sm" />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-text-primary">{member.name}</span><span className="block truncate text-xs text-text-tertiary">{member.role}{isOwner ? ' · Project owner' : ''}</span></span>
                </button>
                {selected && <div className="w-44 shrink-0"><Select aria-label={`${member.name} project role`} options={PROJECT_ROLE_OPTIONS} value={isOwner ? 'project-manager' : (roles[member.id] ?? 'developer')} onChange={(value) => setRoles((current) => ({ ...current, [member.id]: value }))} disabled={isOwner} /></div>}
              </div>
            </li>
          })}
        </ul>
      )}
      {!loading && members.length === 0 && <div className="py-8 text-center text-sm text-text-secondary"><Users className="mx-auto mb-2 h-6 w-6 text-text-tertiary" />No workspace members available.</div>}
      <ModalFooter><Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button><Button variant="primary" onClick={save} disabled={loading || saving}>{saving ? 'Saving…' : 'Save members'}</Button></ModalFooter>
    </Modal>
  )
}
