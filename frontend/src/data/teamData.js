/**
 * Supabase-ready team member schema.
 * Table: team_members
 * FK: workspace_id (future)
 */
export const initialTeamMembers = [
  {
    id: 'member-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@taskflow.io',
    initials: 'SC',
    title: 'Design Lead',
    roleKey: 'design_lead',
    department: 'design',
    color: '#6366f1',
    avatar: null,
    availability: 'available',
    capacity: 100,
    bio: 'Leading design systems and visual language across product surfaces.',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    joinedAt: '2025-03-15T00:00:00Z',
    createdAt: '2025-03-15T00:00:00Z',
    updatedAt: '2026-08-25T09:42:00Z',
  },
  {
    id: 'member-2',
    name: 'James Park',
    email: 'james.park@taskflow.io',
    initials: 'JP',
    title: 'Senior Engineer',
    roleKey: 'senior_engineer',
    department: 'engineering',
    color: '#8b5cf6',
    avatar: null,
    availability: 'busy',
    capacity: 100,
    bio: 'Full-stack engineer focused on payments, APIs, and platform reliability.',
    location: 'Seattle, WA',
    timezone: 'America/Los_Angeles',
    joinedAt: '2024-11-01T00:00:00Z',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2026-08-25T08:15:00Z',
  },
  {
    id: 'member-3',
    name: 'Emily Davis',
    email: 'emily.davis@taskflow.io',
    initials: 'ED',
    title: 'Product Designer',
    roleKey: 'product_designer',
    department: 'design',
    color: '#06b6d4',
    avatar: null,
    availability: 'available',
    capacity: 100,
    bio: 'Crafting intuitive user experiences for onboarding and customer workflows.',
    location: 'Austin, TX',
    timezone: 'America/Chicago',
    joinedAt: '2025-01-20T00:00:00Z',
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2026-08-24T16:30:00Z',
  },
  {
    id: 'member-4',
    name: 'Michael Torres',
    email: 'michael.torres@taskflow.io',
    initials: 'MT',
    title: 'Backend Engineer',
    roleKey: 'engineer',
    department: 'engineering',
    color: '#f59e0b',
    avatar: null,
    availability: 'busy',
    capacity: 100,
    bio: 'Building scalable backend services, security infrastructure, and data pipelines.',
    location: 'Denver, CO',
    timezone: 'America/Denver',
    joinedAt: '2024-08-10T00:00:00Z',
    createdAt: '2024-08-10T00:00:00Z',
    updatedAt: '2026-08-24T14:22:00Z',
  },
  {
    id: 'member-5',
    name: 'Alex Morgan',
    email: 'alex.morgan@taskflow.io',
    initials: 'AM',
    title: 'Product Lead',
    roleKey: 'product_lead',
    department: 'product',
    color: '#10b981',
    avatar: null,
    availability: 'available',
    capacity: 100,
    bio: 'Driving product strategy, sprint planning, and cross-functional alignment.',
    location: 'New York, NY',
    timezone: 'America/New_York',
    joinedAt: '2024-06-01T00:00:00Z',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2026-08-24T11:00:00Z',
  },
]

export const memberActivity = [
  {
    id: 'act-1',
    memberId: 'member-1',
    type: 'task_completed',
    description: 'completed "Navigation component refactor"',
    project: 'Platform Redesign',
    timestamp: '2026-08-25T09:42:00',
  },
  {
    id: 'act-2',
    memberId: 'member-2',
    type: 'comment',
    description: 'commented on "Stripe webhook handler"',
    project: 'Mobile App v2',
    timestamp: '2026-08-25T08:15:00',
  },
  {
    id: 'act-3',
    memberId: 'member-3',
    type: 'task_created',
    description: 'created "Onboarding flow wireframes"',
    project: 'Customer Portal',
    timestamp: '2026-08-24T16:30:00',
  },
  {
    id: 'act-4',
    memberId: 'member-4',
    type: 'status_change',
    description: 'moved "Rate limiting middleware" to In Review',
    project: 'API Integration',
    timestamp: '2026-08-24T14:22:00',
  },
  {
    id: 'act-5',
    memberId: 'member-5',
    type: 'sprint_update',
    description: 'updated Sprint 14 goal and scope',
    project: 'Platform Redesign',
    timestamp: '2026-08-24T11:00:00',
  },
  {
    id: 'act-6',
    memberId: 'member-1',
    type: 'task_completed',
    description: 'completed "Dark mode token mapping"',
    project: 'Platform Redesign',
    timestamp: '2026-08-23T17:45:00',
  },
  {
    id: 'act-7',
    memberId: 'member-2',
    type: 'task_completed',
    description: 'completed "Checkout API endpoints"',
    project: 'Mobile App v2',
    timestamp: '2026-08-23T15:30:00',
  },
  {
    id: 'act-8',
    memberId: 'member-3',
    type: 'status_change',
    description: 'moved "Design system audit" to In Progress',
    project: 'Platform Redesign',
    timestamp: '2026-08-22T10:00:00',
  },
]

let membersState = [...initialTeamMembers]

export function getMembersState() {
  return membersState
}

export function setMembersState(members) {
  membersState = members
}

/** Legacy shape used by tasks and project embeds */
export function toLegacyMember(member) {
  if (!member) return null
  return {
    id: member.id,
    name: member.name,
    initials: member.initials,
    role: member.title,
    color: member.color,
  }
}

export function getTeamMemberById(id) {
  const member = membersState.find((m) => m.id === id) ?? null
  return toLegacyMember(member)
}

export function getMemberActivity(memberId, limit = 5) {
  return memberActivity
    .filter((a) => a.memberId === memberId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit)
}

export function generateInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
