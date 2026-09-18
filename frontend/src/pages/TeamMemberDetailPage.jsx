import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  ListTodo,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EditMemberModal from '../components/team/EditMemberModal'
import MemberActivity from '../components/team/MemberActivity'
import MemberWorkload from '../components/team/MemberWorkload'
import {
  AvailabilityBadge,
  DepartmentBadge,
  MemberRoleBadge,
} from '../components/team/TeamBadges'
import { TeamMemberDetailSkeleton } from '../components/team/TeamSkeleton'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState, { ErrorState } from '../components/ui/EmptyState'
import { DEPARTMENTS } from '../constants/team'
import { useProjects } from '../context/ProjectsContext'
import { useTasks } from '../context/TasksContext'
import { useTeam } from '../context/TeamContext'
import { formatFullDate, formatRelativeTime } from '../utils/format'
import { computeMemberWorkload } from '../utils/teamMetrics'

function DetailStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-2 text-text-tertiary">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1.5 text-lg font-semibold tabular-nums text-text-primary">
        {value}
      </p>
    </div>
  )
}

export default function TeamMemberDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getMemberById, fetchMemberById, removeMember } = useTeam()
  const { tasks } = useTasks()
  const { projects } = useProjects()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(async () => {
      if (cancelled) return
      setLoading(true)
      setLoadError(null)
      try {
        await fetchMemberById(id)
      } catch (requestError) {
        if (!cancelled) setLoadError(requestError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id, fetchMemberById])

  const member = getMemberById(id)

  const workload = useMemo(
    () => (member ? computeMemberWorkload(member.id, tasks) : null),
    [member, tasks],
  )

  if (loading) {
    return <TeamMemberDetailSkeleton />
  }

  if (loadError && loadError.status !== 404) {
    return <ErrorState title="Unable to load team member" description={loadError.message} onRetry={() => navigate(0)} />
  }

  if (!member || loadError?.status === 404 || !workload) {
    return (
      <div className="mx-auto max-w-lg">
        <EmptyState
          icon={Users}
          title="Member not found"
          description="This team member may have been removed or the link is incorrect."
          actionLabel="Back to team"
          onAction={() => navigate('/team')}
        />
      </div>
    )
  }

  const departmentConfig = DEPARTMENTS[member.department]

  const handleRemove = async () => {
    setRemoving(true)
    setRemoveError('')
    try {
      await removeMember(member.id)
      navigate('/team')
    } catch (requestError) {
      setRemoveError(requestError.message)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 animate-fade-in">
      <Link
        to="/team"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to team
      </Link>

      <div className="rounded-xl border border-border bg-surface-raised p-6">
        {removeError && <p role="alert" className="mb-4 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">{removeError}</p>}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <Avatar
              name={member.name}
              initials={member.initials}
              color={member.color}
              size="lg"
              className="h-16 w-16 text-base"
            />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                {member.name}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">{member.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <MemberRoleBadge roleKey={member.roleKey} />
                <DepartmentBadge department={member.department} />
                <AvailabilityBadge availability={member.availability} />
              </div>
              {member.bio && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
                  {member.bio}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-tertiary">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {member.email}
                </span>
                {member.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {member.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
              Edit member
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger hover:bg-danger-muted hover:text-danger"
              onClick={() => setRemoveOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailStat
          icon={ListTodo}
          label="Active tasks"
          value={workload.tasksActive}
        />
        <DetailStat
          icon={Clock}
          label="Completed"
          value={workload.tasksCompleted}
        />
        <DetailStat
          icon={Users}
          label="Total assigned"
          value={workload.tasksTotal}
        />
        <DetailStat
          icon={Globe}
          label="Capacity"
          value={`${workload.assignedPercent}%`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MemberWorkload
            member={member}
            workload={workload}
            projects={projects}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-text-tertiary">Role</dt>
                <dd className="mt-1">
                  <MemberRoleBadge roleKey={member.roleKey} size="sm" />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-tertiary">Department</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <DepartmentBadge department={member.department} size="sm" />
                  {departmentConfig && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: departmentConfig.color }}
                      aria-hidden="true"
                    />
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-tertiary">Availability</dt>
                <dd className="mt-1">
                  <AvailabilityBadge availability={member.availability} size="sm" />
                </dd>
              </div>
              {member.location && (
                <div>
                  <dt className="text-xs font-medium text-text-tertiary">Location</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-sm text-text-primary">
                    <MapPin className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} />
                    {member.location}
                  </dd>
                </div>
              )}
              {member.timezone && (
                <div>
                  <dt className="text-xs font-medium text-text-tertiary">Timezone</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-sm text-text-primary">
                    <Globe className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} />
                    {member.timezone.replace(/_/g, ' ')}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-text-tertiary">Joined</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm text-text-primary">
                  <Calendar className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} />
                  {formatFullDate(member.joinedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-tertiary">Last updated</dt>
                <dd className="mt-1 text-sm text-text-primary">
                  {formatRelativeTime(member.updatedAt)}
                </dd>
              </div>
            </dl>
          </Card>

          <MemberActivity activities={[]} memberName={member.name} />
        </div>
      </div>

      <EditMemberModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        member={member}
      />

      <ConfirmDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={handleRemove}
        title="Remove team member"
        description={`Are you sure you want to remove ${member.name} from the team? This action cannot be undone.`}
        confirmLabel="Remove member"
        loading={removing}
      />
    </div>
  )
}
