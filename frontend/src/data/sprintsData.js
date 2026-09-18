/**
 * Supabase-ready sprint schema.
 * Table: sprints
 * Relations: tasks (sprint_id)
 */
export const initialSprints = [
  {
    id: 'sprint-14',
    name: 'Sprint 14',
    goal: 'Complete checkout flow and launch beta onboarding',
    description:
      'Focus on payment integration, onboarding polish, and beta launch readiness. Target velocity of 55 points.',
    status: 'active',
    startDate: '2026-08-18',
    endDate: '2026-09-01',
    committedPoints: 55,
    completedPoints: 38,
    velocity: null,
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-08-25T09:00:00Z',
  },
  {
    id: 'sprint-15',
    name: 'Sprint 15',
    goal: 'Ship customer portal MVP and analytics widgets',
    description:
      'Deliver core customer portal features and first wave of analytics dashboard widgets.',
    status: 'planning',
    startDate: '2026-09-02',
    endDate: '2026-09-15',
    committedPoints: 48,
    completedPoints: 0,
    velocity: null,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-22T14:00:00Z',
  },
  {
    id: 'sprint-16',
    name: 'Sprint 16',
    goal: 'Mobile offline sync and push notifications',
    description:
      'Complete offline sync mechanism and configure push notifications for mobile app v2.',
    status: 'planning',
    startDate: '2026-09-16',
    endDate: '2026-09-29',
    committedPoints: 42,
    completedPoints: 0,
    velocity: null,
    createdAt: '2026-08-23T11:00:00Z',
    updatedAt: '2026-08-23T11:00:00Z',
  },
  {
    id: 'sprint-13',
    name: 'Sprint 13',
    goal: 'API hardening and design system foundation',
    description:
      'Stabilize API layer, complete rate limiting, and establish design system tokens.',
    status: 'completed',
    startDate: '2026-08-04',
    endDate: '2026-08-17',
    committedPoints: 52,
    completedPoints: 47,
    velocity: 47,
    createdAt: '2026-07-28T09:00:00Z',
    updatedAt: '2026-08-17T18:00:00Z',
  },
  {
    id: 'sprint-12',
    name: 'Sprint 12',
    goal: 'Onboarding flow and initial mobile prototypes',
    description:
      'Deliver onboarding flow v1 and mobile app wireframe prototypes for stakeholder review.',
    status: 'completed',
    startDate: '2026-07-21',
    endDate: '2026-08-03',
    committedPoints: 45,
    completedPoints: 42,
    velocity: 42,
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-08-03T16:00:00Z',
  },
]

/** @deprecated Use useSprints().sprints — kept for static fallbacks during load */
export const sprints = initialSprints

export function getSprintById(id) {
  return initialSprints.find((s) => s.id === id) ?? null
}
