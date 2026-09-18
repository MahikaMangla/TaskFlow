import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import ProgressBar from '../ui/ProgressBar'
import {
  AvailabilityBadge,
  DepartmentBadge,
  MemberRoleBadge,
  WorkloadBadge,
} from './TeamBadges'

export default function TeamTable({ members }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-raised">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-border-subtle/50">
              <th className="px-4 py-3 font-medium text-text-secondary">Member</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Role</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Department</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Availability</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Workload</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Tasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {members.map((member) => {
              const { workload } = member
              const barColor =
                workload.assignedPercent > 100
                  ? 'var(--color-danger)'
                  : workload.assignedPercent >= 85
                    ? 'var(--color-warning)'
                    : member.color

              return (
                <tr
                  key={member.id}
                  className="group transition-colors hover:bg-border-subtle/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/team/${member.id}`}
                      className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      <Avatar
                        name={member.name}
                        initials={member.initials}
                        color={member.color}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text-primary group-hover:text-accent">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-text-tertiary">
                          {member.email}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <MemberRoleBadge roleKey={member.roleKey} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <DepartmentBadge department={member.department} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <AvailabilityBadge availability={member.availability} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-36">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <WorkloadBadge assignedPercent={workload.assignedPercent} size="sm" />
                        <span className="text-xs tabular-nums text-text-tertiary">
                          {workload.assignedPercent}%
                        </span>
                      </div>
                      <ProgressBar
                        value={workload.assignedPercent}
                        color={barColor}
                        size="sm"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-text-secondary">
                      <span className="font-medium tabular-nums text-text-primary">
                        {workload.tasksActive}
                      </span>{' '}
                      active
                      <span className="mx-1 text-text-tertiary">·</span>
                      <span className="tabular-nums">{workload.tasksTotal} total</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
