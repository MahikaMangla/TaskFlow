import { randomBytes } from 'node:crypto'
import bcrypt from 'bcrypt'
import { env } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/app-error.js'
import { issueTokensForUser, toPublicUser } from './auth.service.js'
import { getTokenHash } from './token.service.js'

function initialsFromName(name) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function createInvitationToken() {
  return randomBytes(32).toString('base64url')
}

function invitationExpiryDate() {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.invitationExpiresDays)
  return expiresAt
}

function buildAcceptUrl(token) {
  return `${env.appOrigin}/accept-invitation?token=${encodeURIComponent(token)}`
}

export function toInvitation(invitation) {
  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role.toLowerCase(),
    status: invitation.status.toLowerCase(),
    expiresAt: invitation.expiresAt,
    acceptedAt: invitation.acceptedAt,
    createdAt: invitation.createdAt,
    metadata: invitation.metadata ?? null,
    inviter: invitation.inviter
      ? { id: invitation.inviter.id, name: invitation.inviter.name }
      : undefined,
  }
}

async function loadInvitationByToken(rawToken) {
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: getTokenHash(rawToken) },
    include: {
      workspace: { select: { id: true, name: true, slug: true } },
      inviter: { select: { id: true, name: true } },
    },
  })

  if (!invitation) throw new AppError(404, 'Invitation not found.')
  if (invitation.status === 'ACCEPTED') throw new AppError(410, 'This invitation has already been accepted.')
  if (invitation.status === 'REVOKED') throw new AppError(410, 'This invitation has been revoked.')

  if (invitation.status === 'EXPIRED' || invitation.expiresAt <= new Date()) {
    if (invitation.status === 'PENDING') {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      })
    }
    throw new AppError(410, 'This invitation has expired.')
  }

  return invitation
}

export async function createInvitation(workspaceId, inviterId, input) {
  const existingMember = await prisma.workspaceMember.findFirst({
    where: { workspaceId, user: { email: input.email } },
  })
  if (existingMember) throw new AppError(409, 'This user is already a workspace member.')

  const rawToken = createInvitationToken()
  const invitationData = {
    workspaceId,
    inviterId,
    email: input.email,
    role: input.role,
    tokenHash: getTokenHash(rawToken),
    status: 'PENDING',
    expiresAt: invitationExpiryDate(),
    acceptedAt: null,
    metadata: input.metadata,
  }

  const existingInvite = await prisma.invitation.findUnique({
    where: { workspaceId_email: { workspaceId, email: input.email } },
  })

  let invitation
  if (existingInvite) {
    if (existingInvite.status === 'PENDING' && existingInvite.expiresAt > new Date()) {
      throw new AppError(409, 'A pending invitation already exists for this email.')
    }
    if (existingInvite.status === 'ACCEPTED') {
      throw new AppError(409, 'This user has already accepted an invitation to this workspace.')
    }

    invitation = await prisma.invitation.update({
      where: { id: existingInvite.id },
      data: invitationData,
      include: { inviter: { select: { id: true, name: true } } },
    })
  } else {
    invitation = await prisma.invitation.create({
      data: invitationData,
      include: { inviter: { select: { id: true, name: true } } },
    })
  }

  return {
    invitation: toInvitation(invitation),
    acceptUrl: buildAcceptUrl(rawToken),
  }
}

export async function listInvitations(workspaceId) {
  const invitations = await prisma.invitation.findMany({
    where: { workspaceId },
    include: { inviter: { select: { id: true, name: true } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  const now = new Date()
  const expiredPending = invitations.filter(
    (invitation) => invitation.status === 'PENDING' && invitation.expiresAt <= now,
  )

  if (expiredPending.length) {
    await prisma.invitation.updateMany({
      where: { id: { in: expiredPending.map((invitation) => invitation.id) } },
      data: { status: 'EXPIRED' },
    })
  }

  return invitations.map((invitation) => toInvitation({
    ...invitation,
    status: invitation.status === 'PENDING' && invitation.expiresAt <= now ? 'EXPIRED' : invitation.status,
  }))
}

export async function revokeInvitation(workspaceId, invitationId) {
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, workspaceId },
  })
  if (!invitation) throw new AppError(404, 'Invitation not found.')
  if (invitation.status !== 'PENDING') {
    throw new AppError(400, 'Only pending invitations can be revoked.')
  }

  const revoked = await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: 'REVOKED' },
    include: { inviter: { select: { id: true, name: true } } },
  })

  return toInvitation(revoked)
}

export async function previewInvitation(rawToken) {
  const invitation = await loadInvitationByToken(rawToken)
  const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } })

  return {
    invitation: {
      email: invitation.email,
      role: invitation.role.toLowerCase(),
      expiresAt: invitation.expiresAt,
      metadata: invitation.metadata ?? null,
      workspace: invitation.workspace,
      inviter: invitation.inviter,
    },
    requiresAccount: !existingUser,
    requiresSignIn: Boolean(existingUser),
  }
}

export async function acceptInvitation(rawToken, { name, password }, authenticatedUser, metadata = {}) {
  const invitation = await loadInvitationByToken(rawToken)
  const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } })
  const profile = invitation.metadata ?? {}

  if (existingUser) {
    if (!authenticatedUser || authenticatedUser.id !== existingUser.id) {
      throw new AppError(401, 'Sign in with the invited email address to accept this invitation.')
    }
    if (authenticatedUser.email.toLowerCase() !== invitation.email) {
      throw new AppError(403, 'This invitation was sent to a different email address.')
    }

    const alreadyMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: invitation.workspaceId, userId: existingUser.id } },
    })
    if (alreadyMember) throw new AppError(409, 'You are already a member of this workspace.')

    await prisma.$transaction(async (transaction) => {
      await transaction.workspaceMember.create({
        data: { workspaceId: invitation.workspaceId, userId: existingUser.id, role: invitation.role },
      })
      await transaction.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      })
    })

    return {
      user: toPublicUser(existingUser),
      tokens: await issueTokensForUser(existingUser, metadata),
      workspace: invitation.workspace,
    }
  }

  if (!name || !password) {
    throw new AppError(400, 'Name and password are required to create your account.')
  }

  const user = await prisma.$transaction(async (transaction) => {
    const createdUser = await transaction.user.create({
      data: {
        name: name.trim(),
        email: invitation.email,
        passwordHash: await bcrypt.hash(password, env.bcryptSaltRounds),
        initials: initialsFromName(name),
        title: profile.title ?? null,
        roleKey: profile.roleKey ?? null,
        department: profile.department ?? null,
        color: profile.color ?? undefined,
        availability: profile.availability
          ? profile.availability.toUpperCase().replace('-', '_')
          : undefined,
        bio: profile.bio ?? null,
        location: profile.location ?? null,
        joinedAt: new Date(),
      },
    })

    await transaction.workspaceMember.create({
      data: { workspaceId: invitation.workspaceId, userId: createdUser.id, role: invitation.role },
    })

    await transaction.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    })

    return createdUser
  })

  return {
    user: toPublicUser(user),
    tokens: await issueTokensForUser(user, metadata),
    workspace: invitation.workspace,
  }
}
