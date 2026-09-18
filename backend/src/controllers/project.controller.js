import { createProject, deleteProject, getProject, listProjects, replaceProjectMembers, updateProject } from '../services/project.service.js'
import { asyncHandler } from '../utils/async-handler.js'
import { validateProjectMembers, validateProject } from '../validators/workspace.validator.js'

export const getProjects = asyncHandler(async (request, response) => {
  response.status(200).json({ projects: await listProjects(request.workspace.id) })
})

export const getProjectById = asyncHandler(async (request, response) => {
  response.status(200).json({ project: await getProject(request.workspace.id, request.params.projectId) })
})

export const postProject = asyncHandler(async (request, response) => {
  response.status(201).json({ project: await createProject(request.workspace.id, request.user.id, validateProject(request.body)) })
})

export const patchProject = asyncHandler(async (request, response) => {
  response.status(200).json({ project: await updateProject(request.workspace.id, request.params.projectId, validateProject(request.body, { partial: true }), request.user.id) })
})

export const removeProject = asyncHandler(async (request, response) => {
  await deleteProject(request.workspace.id, request.params.projectId, request.user.id)
  response.status(204).end()
})

export const putProjectMembers = asyncHandler(async (request, response) => {
  const project = await getProject(request.workspace.id, request.params.projectId)
  response.status(200).json({ project: await replaceProjectMembers(request.workspace.id, request.params.projectId, validateProjectMembers(request.body), project.ownerId, request.user.id) })
})
