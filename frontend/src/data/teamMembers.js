import {
  getTeamMemberById,
  getMembersState,
  initialTeamMembers,
  toLegacyMember,
} from './teamData'

export { getTeamMemberById }

export const teamMembers = initialTeamMembers.map(toLegacyMember)

export function getTeamMembersList() {
  return getMembersState().map(toLegacyMember)
}
