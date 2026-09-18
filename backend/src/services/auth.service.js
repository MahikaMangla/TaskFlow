import bcrypt from 'bcrypt'
import { env } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/app-error.js'
import { createSlug } from '../utils/slug.js'
import { createAccessToken, createRefreshToken, getTokenHash, verifyRefreshToken } from './token.service.js'

function initialsFromName(name) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

export function toPublicUser(user) {
  return {
    id: user.id, email: user.email, name: user.name, initials: user.initials,
    title: user.title, roleKey: user.roleKey, department: user.department,
    color: user.color, avatarUrl: user.avatarUrl, availability: user.availability.toLowerCase(),
    capacity: user.capacity, bio: user.bio, location: user.location, timezone: user.timezone,
    createdAt: user.createdAt, updatedAt: user.updatedAt,
  }
}

async function issueTokens(user, metadata = {}) {
  const refresh = createRefreshToken(user.id)
  await prisma.refreshToken.create({
    data: { id: refresh.tokenId, userId: user.id, tokenHash: refresh.tokenHash, expiresAt: refresh.expiresAt, userAgent: metadata.userAgent, ipAddress: metadata.ipAddress },
  })
  return { accessToken: createAccessToken(user.id), refreshToken: refresh.token }
}

export async function issueTokensForUser(user, metadata = {}) {
  return issueTokens(user, metadata)
}

async function uniqueWorkspaceSlug(name) {
  const base = createSlug(name)
  let slug = base
  let suffix = 2
  while (await prisma.workspace.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  return slug
}

export async function register({ name, email, password, workspaceName }, metadata) {
  const normalizedEmail = email.toLowerCase().trim()
  if (await prisma.user.findUnique({ where: { email: normalizedEmail } })) {
    throw new AppError(409, 'An account with this email already exists.')
  }
  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds)
  const workspaceLabel = workspaceName?.trim() || `${name.trim()}'s Workspace`
  const workspaceSlug = await uniqueWorkspaceSlug(workspaceLabel)
  const user = await prisma.$transaction(async (transaction) => {
    const createdUser = await transaction.user.create({
      data: { name: name.trim(), email: normalizedEmail, passwordHash, initials: initialsFromName(name), joinedAt: new Date() },
    })
    const workspace = await transaction.workspace.create({ data: { name: workspaceLabel, slug: workspaceSlug } })
    await transaction.workspaceMember.create({ data: { workspaceId: workspace.id, userId: createdUser.id, role: 'ADMIN' } })
    return createdUser
  })
  return { user: toPublicUser(user), tokens: await issueTokens(user, metadata) }
}

export async function login({ email, password }, metadata) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password.')
  }
  return { user: toPublicUser(user), tokens: await issueTokens(user, metadata) }
}

export async function refresh(refreshToken, metadata) {
  let payload
  try { payload = verifyRefreshToken(refreshToken) } catch { throw new AppError(401, 'Refresh token is invalid or expired.') }
  if (payload.type !== 'refresh' || typeof payload.sub !== 'string' || typeof payload.jti !== 'string') throw new AppError(401, 'Refresh token is invalid.')
  const stored = await prisma.refreshToken.findUnique({ where: { id: payload.jti }, include: { user: true } })
  if (!stored || stored.userId !== payload.sub || stored.tokenHash !== getTokenHash(refreshToken) || stored.revokedAt || stored.expiresAt <= new Date()) {
    throw new AppError(401, 'Refresh token is invalid or expired.')
  }
  const revocation = await prisma.refreshToken.updateMany({
    where: { id: stored.id, revokedAt: null, tokenHash: getTokenHash(refreshToken) },
    data: { revokedAt: new Date() },
  })
  if (revocation.count !== 1) throw new AppError(401, 'Refresh token is invalid or expired.')
  return { user: toPublicUser(stored.user), tokens: await issueTokens(stored.user, metadata) }
}

export async function logout(refreshToken) {
  if (!refreshToken) return
  await prisma.refreshToken.updateMany({ where: { tokenHash: getTokenHash(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } })
}
