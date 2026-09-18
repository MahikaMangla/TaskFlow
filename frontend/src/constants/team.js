export const WORKSPACE_ROLES = {
  member: { label: 'Member', variant: 'outline' },
  manager: { label: 'Manager', variant: 'warning' },
  admin: { label: 'Admin', variant: 'danger' },
}

export const WORKSPACE_ROLE_OPTIONS = Object.entries(WORKSPACE_ROLES).map(([value, { label }]) => ({
  value,
  label,
}))

export const PROJECT_ROLES = {
  'project-manager': { label: 'Project Manager' },
  'frontend-developer': { label: 'Frontend Developer' },
  'backend-developer': { label: 'Backend Developer' },
  developer: { label: 'Developer' },
  'ui-ux-designer': { label: 'UI/UX Designer' },
  'qa-engineer': { label: 'QA Engineer' },
  'product-manager': { label: 'Product Manager' },
}

export const PROJECT_ROLE_OPTIONS = Object.entries(PROJECT_ROLES).map(([value, { label }]) => ({ value, label }))

export const MEMBER_ROLES = {
  admin: { label: 'Admin', variant: 'danger' },
  manager: { label: 'Manager', variant: 'warning' },
  product_lead: { label: 'Product Lead', variant: 'accent' },
  design_lead: { label: 'Design Lead', variant: 'accent' },
  senior_engineer: { label: 'Senior Engineer', variant: 'outline' },
  engineer: { label: 'Engineer', variant: 'outline' },
  product_designer: { label: 'Product Designer', variant: 'outline' },
}

export const DEPARTMENTS = {
  engineering: { label: 'Engineering', color: '#8b5cf6' },
  design: { label: 'Design', color: '#6366f1' },
  product: { label: 'Product', color: '#10b981' },
  operations: { label: 'Operations', color: '#f59e0b' },
}

export const AVAILABILITY = {
  available: { label: 'Available', variant: 'success' },
  busy: { label: 'Busy', variant: 'warning' },
  away: { label: 'Away', variant: 'outline' },
  offline: { label: 'Offline', variant: 'default' },
}

export const MEMBER_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#64748b',
]

export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
  { value: 'workload-desc', label: 'Workload (high–low)' },
  { value: 'workload-asc', label: 'Workload (low–high)' },
  { value: 'joined-desc', label: 'Recently joined' },
  { value: 'joined-asc', label: 'Oldest members' },
]

export const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All roles' },
  ...Object.entries(MEMBER_ROLES).map(([value, { label }]) => ({
    value,
    label,
  })),
]

export const DEPARTMENT_FILTER_OPTIONS = [
  { value: 'all', label: 'All departments' },
  ...Object.entries(DEPARTMENTS).map(([value, { label }]) => ({
    value,
    label,
  })),
]

export const AVAILABILITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All availability' },
  ...Object.entries(AVAILABILITY).map(([value, { label }]) => ({
    value,
    label,
  })),
]

export function getLoadStatus(assignedPercent) {
  if (assignedPercent > 100) return { label: 'Overloaded', variant: 'danger' }
  if (assignedPercent >= 85) return { label: 'High', variant: 'warning' }
  if (assignedPercent >= 60) return { label: 'Balanced', variant: 'accent' }
  return { label: 'Available', variant: 'success' }
}
