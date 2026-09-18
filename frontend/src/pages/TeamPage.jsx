import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import TeamOverview from '../components/team/TeamOverview'
import TeamToolbar from '../components/team/TeamToolbar'
import TeamTable from '../components/team/TeamTable'
import TeamCard from '../components/team/TeamCard'
import { TeamPageSkeleton as TeamSkeleton } from '../components/team/TeamSkeleton'
import InviteMemberModal from '../components/team/InviteMemberModal'
import EmptyState, { ErrorState } from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

import { useTeam } from '../context/TeamContext'
import { useTasks } from '../context/TasksContext'
import { useTeamFilters } from '../hooks/useTeamFilters'

export default function TeamPage() {
  const location = useLocation()
  const [inviteOpen, setInviteOpen] = useState(Boolean(location.state?.openInviteForm))
  const { members, invitations, isAdmin, isLoading, error, fetchMembers, fetchInvitations, revokeInvitation } = useTeam()
  const { tasks } = useTasks()

  useEffect(() => {
    if (!isAdmin) return undefined
    const refreshTeam = () => {
      fetchMembers({ silent: true }).catch(() => {})
      fetchInvitations().catch(() => {})
    }
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshTeam()
    }
    refreshTeam()
    window.addEventListener('focus', refreshTeam)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.removeEventListener('focus', refreshTeam)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [isAdmin, fetchInvitations, fetchMembers])

  const {
    filters,
    filteredMembers,
    hasActiveFilters,
    updateFilter,
    resetFilters,
    viewMode,
    setViewMode,
  } = useTeamFilters(members, tasks)

  const stats = useMemo(() => {
    const total = members.length

    const departmentCounts = members.reduce((acc, member) => {
      acc[member.department] = (acc[member.department] || 0) + 1
      return acc
    }, {})

    const workloads = filteredMembers.map((member) => ({
      id: member.id,
      name: member.name,
      color: member.color || 'var(--color-accent)',
      workload: {
        assignedPercent: member.workload?.assignedPercent ?? 0,
      },
    }))

    const avgUtilization =
      workloads.length > 0
        ? Math.round(
            workloads.reduce(
              (sum, member) => sum + member.workload.assignedPercent,
              0,
            ) / workloads.length,
          )
        : 0

    return {
      total,
      departmentCounts,
      workloads,
      avgUtilization,
    }
  }, [members, filteredMembers])

  const handleFilterChange = (key, value) => {
    updateFilter(key, value)
  }

  if (isLoading) {
    return <TeamSkeleton />
  }

  if (error) {
    return <ErrorState title="Unable to load team" description={error} onRetry={fetchMembers} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Team
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Manage your team, workload and availability.
        </p>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-raised"><EmptyState title="No team members found" description="Workspace members will appear here once they are available." /></div>
      ) : <>
      <TeamOverview stats={stats} />

      <TeamToolbar
        filters={filters}
        resultCount={filteredMembers.length}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'table' ? (
        <TeamTable members={filteredMembers} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      )}
      </>}
      {isAdmin && invitations.filter((invitation) => invitation.status === 'pending').length > 0 && (
        <section className="rounded-xl border border-border bg-surface-raised p-4">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-text-primary">Pending invitations</h2><p className="mt-1 text-xs text-text-secondary">Invitation links are active until they expire.</p></div><Button variant="secondary" size="sm" onClick={() => setInviteOpen(true)}>Invite member</Button></div>
          <ul className="mt-3 divide-y divide-border">
            {invitations.filter((invitation) => invitation.status === 'pending').map((invitation) => <li key={invitation.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-text-primary">{invitation.email}</p><p className="text-xs text-text-tertiary">{invitation.role} · Expires {new Date(invitation.expiresAt).toLocaleDateString()}</p></div><Button variant="ghost" size="sm" className="text-danger" onClick={() => revokeInvitation(invitation.id).catch(() => {})}>Revoke</Button></li>)}
          </ul>
        </section>
      )}
      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  )
}
