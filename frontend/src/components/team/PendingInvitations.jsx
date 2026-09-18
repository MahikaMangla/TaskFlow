import { Mail, XCircle } from 'lucide-react'
import { useState } from 'react'
import { WORKSPACE_ROLES } from '../../constants/team'
import { useTeam } from '../../context/TeamContext'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { formatRelativeTime } from '../../utils/format'

export default function PendingInvitations({ invitations }) {
  const { revokeInvitation } = useTeam()
  const [revokingId, setRevokingId] = useState(null)
  const [error, setError] = useState('')

  const pending = invitations.filter((invitation) => invitation.status === 'pending')

  if (pending.length === 0) return null

  const handleRevoke = async (invitationId) => {
    setRevokingId(invitationId)
    setError('')
    try {
      await revokeInvitation(invitationId)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending invitations</CardTitle>
        <span className="text-xs text-text-tertiary">{pending.length} pending</span>
      </CardHeader>

      {error && (
        <p role="alert" className="mb-3 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <ul className="divide-y divide-border-subtle">
        {pending.map((invitation) => {
          const roleConfig = WORKSPACE_ROLES[invitation.role]

          return (
            <li key={invitation.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} />
                  <p className="truncate text-sm font-medium text-text-primary">{invitation.email}</p>
                  {roleConfig && (
                    <Badge variant={roleConfig.variant} size="sm">
                      {roleConfig.label}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-text-tertiary">
                  Expires {formatRelativeTime(invitation.expiresAt)}
                  {invitation.inviter?.name ? ` · Invited by ${invitation.inviter.name}` : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-danger hover:bg-danger-muted hover:text-danger"
                disabled={revokingId === invitation.id}
                onClick={() => handleRevoke(invitation.id)}
              >
                <XCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                {revokingId === invitation.id ? 'Revoking...' : 'Revoke'}
              </Button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
