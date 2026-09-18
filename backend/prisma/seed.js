import { prisma } from '../src/lib/prisma.js'

const workspaceId = 'workspace-taskflow'
const date = (value) => new Date(`${value}T00:00:00.000Z`)

const status = {
  todo: 'TODO',
  in_progress: 'IN_PROGRESS',
  in_review: 'IN_REVIEW',
  done: 'DONE',
}

const priority = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  critical: 'CRITICAL',
}

const users = [
  ['member-1', 'Sarah Chen', 'sarah.chen@taskflow.io', 'SC', 'Design Lead', 'design_lead', 'design', '#6366f1', 'AVAILABLE'],
  ['member-2', 'James Park', 'james.park@taskflow.io', 'JP', 'Senior Engineer', 'senior_engineer', 'engineering', '#8b5cf6', 'BUSY'],
  ['member-3', 'Emily Davis', 'emily.davis@taskflow.io', 'ED', 'Product Designer', 'product_designer', 'design', '#06b6d4', 'AVAILABLE'],
  ['member-4', 'Michael Torres', 'michael.torres@taskflow.io', 'MT', 'Backend Engineer', 'engineer', 'engineering', '#f59e0b', 'BUSY'],
  ['member-5', 'Alex Morgan', 'alex.morgan@taskflow.io', 'AM', 'Product Lead', 'product_lead', 'product', '#10b981', 'AVAILABLE'],
]

const projects = [
  ['proj-1', 'Platform Redesign', 'Complete overhaul of the core platform UI with a new design system, improved navigation, and accessibility compliance.', '#6366f1', 'ACTIVE', 'HIGH', '2026-06-01', '2026-09-15', 'member-5', ['member-1', 'member-5', 'member-3']],
  ['proj-2', 'Mobile App v2', 'Next-generation mobile experience with offline support, push notifications, and redesigned checkout flow.', '#8b5cf6', 'ACTIVE', 'CRITICAL', '2026-07-01', '2026-10-01', 'member-2', ['member-2', 'member-3']],
  ['proj-3', 'API Integration', 'Unified REST and GraphQL API layer with rate limiting, versioning, and developer documentation.', '#06b6d4', 'ACTIVE', 'HIGH', '2026-05-15', '2026-08-30', 'member-4', ['member-4', 'member-2']],
  ['proj-4', 'Customer Portal', 'Self-service portal for customers to manage subscriptions, billing, and support tickets.', '#10b981', 'PLANNING', 'MEDIUM', '2026-08-01', '2026-11-20', 'member-5', ['member-3', 'member-5']],
  ['proj-5', 'Analytics Dashboard', 'Real-time analytics and reporting dashboard with custom widgets and export capabilities.', '#f59e0b', 'ACTIVE', 'MEDIUM', '2026-06-15', '2026-09-30', 'member-2', ['member-2', 'member-4', 'member-1']],
  ['proj-6', 'Security Audit', 'Comprehensive security review including penetration testing, dependency audits, and compliance documentation.', '#ef4444', 'ON_HOLD', 'CRITICAL', '2026-07-01', '2026-09-01', 'member-4', ['member-4']],
  ['proj-7', 'Onboarding Flow', 'Streamlined user onboarding with interactive tutorials, progress tracking, and personalization.', '#ec4899', 'COMPLETED', 'HIGH', '2026-04-01', '2026-07-15', 'member-3', ['member-3', 'member-1']],
  ['proj-8', 'Legacy Migration', 'Migration of legacy monolith services to microservices architecture with zero-downtime deployment.', '#64748b', 'ARCHIVED', 'LOW', '2025-10-01', '2026-03-31', 'member-4', ['member-4', 'member-2']],
]

const sprints = [
  ['sprint-14', 'Sprint 14', 'Complete checkout flow and launch beta onboarding', 'Focus on payment integration, onboarding polish, and beta launch readiness.', 'ACTIVE', '2026-08-18', '2026-09-01', 55, 38, null],
  ['sprint-15', 'Sprint 15', 'Ship customer portal MVP and analytics widgets', 'Deliver core customer portal features and analytics dashboard widgets.', 'PLANNING', '2026-09-02', '2026-09-15', 48, 0, null],
  ['sprint-16', 'Sprint 16', 'Mobile offline sync and push notifications', 'Complete offline sync mechanism and configure push notifications.', 'PLANNING', '2026-09-16', '2026-09-29', 42, 0, null],
  ['sprint-13', 'Sprint 13', 'API hardening and design system foundation', 'Stabilize API layer, complete rate limiting, and establish design system tokens.', 'COMPLETED', '2026-08-04', '2026-08-17', 52, 47, 47],
  ['sprint-12', 'Sprint 12', 'Onboarding flow and initial mobile prototypes', 'Deliver onboarding flow v1 and mobile app wireframes.', 'COMPLETED', '2026-07-21', '2026-08-03', 45, 42, 42],
]

const tasks = [
  ['task-1', 'Navigation component refactor', 'done', 'high', 'proj-1', 'sprint-14', 'member-1', '2026-08-24', ['frontend', 'accessibility'], 0],
  ['task-2', 'Dark mode token mapping', 'done', 'medium', 'proj-1', 'sprint-14', 'member-1', '2026-08-23', ['design', 'dark-mode'], 1],
  ['task-3', 'Design system audit', 'in_progress', 'high', 'proj-1', 'sprint-14', 'member-3', '2026-08-27', ['design', 'audit'], 0],
  ['task-4', 'Security review checklist', 'todo', 'critical', 'proj-1', 'sprint-14', 'member-4', '2026-09-04', ['security'], 0],
  ['task-5', 'Stripe webhook handler', 'in_review', 'critical', 'proj-2', 'sprint-14', 'member-2', '2026-08-29', ['backend', 'payments'], 0],
  ['task-6', 'Payment gateway integration', 'in_progress', 'critical', 'proj-2', 'sprint-14', 'member-2', '2026-08-29', ['mobile', 'payments'], 1],
  ['task-7', 'Push notification setup', 'todo', 'high', 'proj-2', 'sprint-14', 'member-2', '2026-09-05', ['mobile', 'notifications'], 1],
  ['task-8', 'Offline sync mechanism', 'todo', 'medium', 'proj-2', 'sprint-15', null, '2026-09-20', ['mobile', 'offline'], 2],
  ['task-9', 'Rate limiting middleware', 'in_review', 'high', 'proj-3', 'sprint-14', 'member-4', '2026-08-28', ['backend', 'api'], 0],
  ['task-10', 'API documentation update', 'in_progress', 'medium', 'proj-3', 'sprint-14', 'member-5', '2026-08-30', ['documentation', 'api'], 0],
  ['task-11', 'GraphQL schema migration', 'todo', 'high', 'proj-3', 'sprint-15', 'member-4', '2026-09-10', ['backend', 'graphql'], 0],
  ['task-12', 'Onboarding flow wireframes', 'done', 'medium', 'proj-4', 'sprint-13', 'member-3', '2026-08-20', ['design', 'ux'], 0],
  ['task-13', 'User testing session prep', 'todo', 'medium', 'proj-4', 'sprint-15', 'member-3', '2026-09-02', ['research', 'ux'], 0],
  ['task-14', 'Billing page mockups', 'in_progress', 'low', 'proj-4', null, 'member-3', '2026-09-15', ['design'], 0],
  ['task-15', 'Custom widget framework', 'in_progress', 'high', 'proj-5', 'sprint-14', 'member-2', '2026-08-26', ['frontend', 'analytics'], 0],
  ['task-16', 'Export to CSV feature', 'todo', 'medium', 'proj-5', 'sprint-14', 'member-4', '2026-09-01', ['feature', 'analytics'], 1],
  ['task-17', 'Penetration test report review', 'todo', 'critical', 'proj-6', null, 'member-4', '2026-08-20', ['security'], 0],
  ['task-18', 'Dashboard chart animations', 'in_review', 'low', 'proj-5', 'sprint-14', 'member-1', '2026-08-31', ['frontend', 'animation'], 1],
]

async function main() {
  await prisma.workspace.upsert({
    where: { id: workspaceId },
    update: { name: 'TaskFlow Demo Workspace', slug: 'taskflow-demo' },
    create: { id: workspaceId, name: 'TaskFlow Demo Workspace', slug: 'taskflow-demo' },
  })

  for (const [id, name, email, initials, title, roleKey, department, color, availability] of users) {
    await prisma.user.upsert({
      where: { id },
      update: { name, email, initials, title, roleKey, department, color, availability },
      create: { id, name, email, initials, title, roleKey, department, color, availability },
    })
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId, userId: id } },
      update: {},
      create: { workspaceId, userId: id, role: id === 'member-5' ? 'ADMIN' : 'MEMBER' },
    })
  }

  for (const [id, name, description, color, projectStatus, projectPriority, startDate, endDate, ownerId, memberIds] of projects) {
    await prisma.project.upsert({
      where: { id },
      update: { name, description, color, status: projectStatus, priority: projectPriority, startDate: date(startDate), endDate: date(endDate), ownerId },
      create: { id, workspaceId, name, description, color, status: projectStatus, priority: projectPriority, startDate: date(startDate), endDate: date(endDate), ownerId },
    })
    for (const userId of memberIds) {
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: id, userId } },
        update: {},
        create: { projectId: id, userId },
      })
    }
  }

  for (const [id, name, goal, description, sprintStatus, startDate, endDate, committedPoints, completedPoints, velocity] of sprints) {
    await prisma.sprint.upsert({
      where: { id },
      update: { name, goal, description, status: sprintStatus, startDate: date(startDate), endDate: date(endDate), committedPoints, completedPoints, velocity },
      create: { id, workspaceId, name, goal, description, status: sprintStatus, startDate: date(startDate), endDate: date(endDate), committedPoints, completedPoints, velocity },
    })
  }

  const labelIds = new Map()
  for (const task of tasks) {
    for (const name of task[8]) {
      const label = await prisma.label.upsert({
        where: { workspaceId_name: { workspaceId, name } },
        update: {},
        create: { workspaceId, name },
      })
      labelIds.set(name, label.id)
    }
  }

  for (const [id, title, taskStatus, taskPriority, projectId, sprintId, assigneeId, dueDate, labels, position] of tasks) {
    const taskPriorityValue = priority[taskPriority]
    const storyPoints = { LOW: 2, MEDIUM: 3, HIGH: 5, CRITICAL: 8 }[taskPriorityValue]
    const data = { workspaceId, projectId, sprintId, assigneeId, creatorId: 'member-5', title, description: `Seeded TaskFlow task: ${title}.`, status: status[taskStatus], priority: taskPriorityValue, storyPoints, dueDate: date(dueDate), position }
    await prisma.task.upsert({
      where: { id },
      update: data,
      create: { id, ...data, labels: { create: labels.map((name) => ({ labelId: labelIds.get(name) })) } },
    })
  }

  await prisma.activity.upsert({
    where: { id: 'act-1' },
    update: {},
    create: { id: 'act-1', workspaceId, actorId: 'member-1', projectId: 'proj-1', taskId: 'task-1', type: 'TASK_COMPLETED', description: 'completed "Navigation component refactor"' },
  })

  console.log('TaskFlow development data seeded successfully.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
