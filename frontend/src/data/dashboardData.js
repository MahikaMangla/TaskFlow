export const currentUser = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@taskflow.io',
  role: 'Product Lead',
  avatar: null,
  initials: 'AM',
}

export const kpiStats = [
  {
    id: 'active-projects',
    label: 'Active Projects',
    value: 12,
    change: 8,
    trend: 'up',
    icon: 'folder',
  },
  {
    id: 'total-tasks',
    label: 'Total Tasks',
    value: 248,
    change: 14,
    trend: 'up',
    icon: 'list',
  },
  {
    id: 'completed-tasks',
    label: 'Completed Tasks',
    value: 186,
    change: 22,
    trend: 'up',
    icon: 'check',
  },
  {
    id: 'overdue-tasks',
    label: 'Overdue Tasks',
    value: 7,
    change: -3,
    trend: 'down',
    icon: 'alert',
  },
]

export const projects = [
  {
    id: 'proj-1',
    name: 'Platform Redesign',
    color: '#6366f1',
    progress: 72,
    tasksCompleted: 34,
    tasksTotal: 47,
    dueDate: '2026-09-15',
    status: 'on-track',
  },
  {
    id: 'proj-2',
    name: 'Mobile App v2',
    color: '#8b5cf6',
    progress: 45,
    tasksCompleted: 18,
    tasksTotal: 40,
    dueDate: '2026-10-01',
    status: 'at-risk',
  },
  {
    id: 'proj-3',
    name: 'API Integration',
    color: '#06b6d4',
    progress: 91,
    tasksCompleted: 41,
    tasksTotal: 45,
    dueDate: '2026-08-30',
    status: 'on-track',
  },
  {
    id: 'proj-4',
    name: 'Customer Portal',
    color: '#10b981',
    progress: 28,
    tasksCompleted: 7,
    tasksTotal: 25,
    dueDate: '2026-11-20',
    status: 'on-track',
  },
]

export const currentSprint = {
  id: 'sprint-14',
  name: 'Sprint 14',
  goal: 'Complete checkout flow and launch beta onboarding',
  startDate: '2026-08-18',
  endDate: '2026-09-01',
  daysRemaining: 7,
  velocity: 42,
  committedPoints: 55,
  completedPoints: 38,
  tasks: {
    todo: 12,
    inProgress: 8,
    inReview: 5,
    done: 24,
  },
}

export const upcomingDeadlines = [
  {
    id: 'deadline-1',
    title: 'Design system audit',
    project: 'Platform Redesign',
    projectColor: '#6366f1',
    dueDate: '2026-08-27',
    priority: 'high',
    assignee: { name: 'Sarah Chen', initials: 'SC' },
  },
  {
    id: 'deadline-2',
    title: 'Payment gateway integration',
    project: 'Mobile App v2',
    projectColor: '#8b5cf6',
    dueDate: '2026-08-29',
    priority: 'critical',
    assignee: { name: 'James Park', initials: 'JP' },
  },
  {
    id: 'deadline-3',
    title: 'API documentation update',
    project: 'API Integration',
    projectColor: '#06b6d4',
    dueDate: '2026-08-30',
    priority: 'medium',
    assignee: { name: 'Alex Morgan', initials: 'AM' },
  },
  {
    id: 'deadline-4',
    title: 'User testing session',
    project: 'Customer Portal',
    projectColor: '#10b981',
    dueDate: '2026-09-02',
    priority: 'medium',
    assignee: { name: 'Emily Davis', initials: 'ED' },
  },
  {
    id: 'deadline-5',
    title: 'Security review',
    project: 'Platform Redesign',
    projectColor: '#6366f1',
    dueDate: '2026-09-04',
    priority: 'high',
    assignee: { name: 'Michael Torres', initials: 'MT' },
  },
]

export const recentActivity = [
  {
    id: 'act-1',
    type: 'task_completed',
    user: { name: 'Sarah Chen', initials: 'SC' },
    description: 'completed "Navigation component refactor"',
    project: 'Platform Redesign',
    timestamp: '2026-08-25T09:42:00',
  },
  {
    id: 'act-2',
    type: 'comment',
    user: { name: 'James Park', initials: 'JP' },
    description: 'commented on "Stripe webhook handler"',
    project: 'Mobile App v2',
    timestamp: '2026-08-25T08:15:00',
  },
  {
    id: 'act-3',
    type: 'task_created',
    user: { name: 'Emily Davis', initials: 'ED' },
    description: 'created "Onboarding flow wireframes"',
    project: 'Customer Portal',
    timestamp: '2026-08-24T16:30:00',
  },
  {
    id: 'act-4',
    type: 'status_change',
    user: { name: 'Michael Torres', initials: 'MT' },
    description: 'moved "Rate limiting middleware" to In Review',
    project: 'API Integration',
    timestamp: '2026-08-24T14:22:00',
  },
  {
    id: 'act-5',
    type: 'sprint_update',
    user: { name: 'Alex Morgan', initials: 'AM' },
    description: 'updated Sprint 14 goal and scope',
    project: 'Platform Redesign',
    timestamp: '2026-08-24T11:00:00',
  },
  {
    id: 'act-6',
    type: 'task_completed',
    user: { name: 'Sarah Chen', initials: 'SC' },
    description: 'completed "Dark mode token mapping"',
    project: 'Platform Redesign',
    timestamp: '2026-08-23T17:45:00',
  },
]

export const teamWorkload = [
  {
    id: 'member-1',
    name: 'Sarah Chen',
    initials: 'SC',
    role: 'Design Lead',
    capacity: 100,
    assigned: 92,
    tasksActive: 8,
    color: '#6366f1',
  },
  {
    id: 'member-2',
    name: 'James Park',
    initials: 'JP',
    role: 'Senior Engineer',
    capacity: 100,
    assigned: 78,
    tasksActive: 6,
    color: '#8b5cf6',
  },
  {
    id: 'member-3',
    name: 'Emily Davis',
    initials: 'ED',
    role: 'Product Designer',
    capacity: 100,
    assigned: 65,
    tasksActive: 5,
    color: '#06b6d4',
  },
  {
    id: 'member-4',
    name: 'Michael Torres',
    initials: 'MT',
    role: 'Backend Engineer',
    capacity: 100,
    assigned: 110,
    tasksActive: 9,
    color: '#f59e0b',
  },
  {
    id: 'member-5',
    name: 'Alex Morgan',
    initials: 'AM',
    role: 'Product Lead',
    capacity: 100,
    assigned: 55,
    tasksActive: 4,
    color: '#10b981',
  },
]

export const taskStatusBreakdown = [
  { status: 'To Do', count: 48, color: '#a1a1aa' },
  { status: 'In Progress', count: 32, color: '#6366f1' },
  { status: 'In Review', count: 18, color: '#f59e0b' },
  { status: 'Done', count: 150, color: '#10b981' },
]

export const notifications = [
  {
    id: 'notif-1',
    title: 'Sprint review tomorrow',
    message: 'Sprint 14 review scheduled for 10:00 AM',
    time: '2h ago',
    read: false,
    type: 'reminder',
  },
  {
    id: 'notif-2',
    title: 'Task assigned to you',
    message: 'James assigned "API rate limit config" to you',
    time: '4h ago',
    read: false,
    type: 'assignment',
  },
  {
    id: 'notif-3',
    title: 'Comment on your task',
    message: 'Sarah replied on "Navigation component refactor"',
    time: 'Yesterday',
    read: true,
    type: 'comment',
  },
]

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'layout-dashboard' },
  { id: 'projects', label: 'Projects', path: '/projects', icon: 'folder-kanban' },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: 'check-square' },
  { id: 'sprints', label: 'Sprints', path: '/sprints', icon: 'timer' },
  { id: 'team', label: 'Team', path: '/team', icon: 'users' },
  { id: 'reports', label: 'Reports', path: '/reports', icon: 'bar-chart-3' },
]

export const secondaryNavItems = [
  { id: 'settings', label: 'Settings', path: '/settings', icon: 'settings' },
  { id: 'help', label: 'Help & Support', path: '/help', icon: 'help-circle' },
]
