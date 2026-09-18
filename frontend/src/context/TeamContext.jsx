/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../lib/api'

const TeamContext = createContext(null)

export function toMember(member) {
  return {
    ...member,
    title: member.title ?? 'Team member',
    roleKey: member.roleKey ?? member.workspaceRole ?? 'member',
    department: member.department ?? 'operations',
    availability: member.availability ?? 'available',
    capacity: member.capacity ?? 100,
  }
}

export function TeamProvider({ children }) {
  const { accessToken } = useAuth()
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [workspace, setWorkspace] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const fetchMembers = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setStatus('loading')
      setError(null)
    }
    try {
      const response = await apiRequest('/workspaces/members', { token: accessToken })
      const nextMembers = (response.members ?? []).map(toMember)
      setMembers(nextMembers)
      setStatus('success')
      return nextMembers
    } catch (requestError) {
      if (!silent) {
        setError(requestError.message)
        setStatus('error')
      }
      throw requestError
    }
  }, [accessToken])

  const fetchWorkspace = useCallback(async () => {
    const response = await apiRequest('/workspaces/current', { token: accessToken })
    setWorkspace(response.workspace ?? null)
    return response.workspace ?? null
  }, [accessToken])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      apiRequest('/workspaces/members', { token: accessToken }),
      apiRequest('/workspaces/current', { token: accessToken }),
    ])
      .then(([membersResponse, workspaceResponse]) => {
        if (!cancelled) {
          setMembers((membersResponse.members ?? []).map(toMember))
          setWorkspace(workspaceResponse.workspace ?? null)
          setStatus('success')
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message)
          setStatus('error')
        }
      })
    return () => { cancelled = true }
  }, [accessToken])

  const getMemberById = useCallback((id) => members.find((member) => member.id === id) ?? null, [members])

  const fetchMemberById = useCallback(async (memberId) => {
    const response = await apiRequest(`/workspaces/members/${memberId}`, { token: accessToken })
    const member = toMember(response.member)
    setMembers((previous) => {
      const exists = previous.some((item) => item.id === member.id)
      return exists ? previous.map((item) => (item.id === member.id ? member : item)) : [...previous, member]
    })
    return member
  }, [accessToken])

  const updateMember = useCallback(async (memberId, input) => {
    const response = await apiRequest(`/workspaces/members/${memberId}`, {
      token: accessToken,
      method: 'PATCH',
      body: JSON.stringify(input),
    })
    const member = toMember(response.member)
    setMembers((previous) => previous.map((item) => (item.id === memberId ? member : item)))
    return member
  }, [accessToken])

  const fetchInvitations = useCallback(async () => {
    const response = await apiRequest('/workspaces/invitations', { token: accessToken })
    setInvitations(response.invitations ?? [])
    return response.invitations ?? []
  }, [accessToken])

  const createInvitation = useCallback(async (input) => {
    const response = await apiRequest('/workspaces/invitations', {
      token: accessToken,
      method: 'POST',
      body: JSON.stringify(input),
    })
    setInvitations((previous) => [response.invitation, ...previous.filter((item) => item.id !== response.invitation.id)])
    return response
  }, [accessToken])

  const revokeInvitation = useCallback(async (invitationId) => {
    const response = await apiRequest(`/workspaces/invitations/${invitationId}`, {
      token: accessToken,
      method: 'DELETE',
    })
    setInvitations((previous) => previous.map((item) => (item.id === invitationId ? response.invitation : item)))
    return response.invitation
  }, [accessToken])

  const removeMember = useCallback(async (memberId) => {
    await apiRequest(`/workspaces/members/${memberId}`, { token: accessToken, method: 'DELETE' })
    setMembers((previous) => previous.filter((member) => member.id !== memberId))
  }, [accessToken])

  const value = useMemo(() => ({
    members, invitations, workspace, status, error, fetchMembers, fetchWorkspace, fetchInvitations,
    createInvitation, revokeInvitation, getMemberById, fetchMemberById, updateMember, removeMember,
    isLoading: status === 'loading', isAdmin: workspace?.role === 'admin',
  }), [members, invitations, workspace, status, error, fetchMembers, fetchWorkspace, fetchInvitations, createInvitation, revokeInvitation, getMemberById, fetchMemberById, updateMember, removeMember])

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (!context) throw new Error('useTeam must be used within TeamProvider')
  return context
}
