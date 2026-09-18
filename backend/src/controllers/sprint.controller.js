import { assignTasksToSprint, createSprint, deleteSprint, getSprint, getSprintTasks, listSprints, removeTaskFromSprint, updateSprint } from '../services/sprint.service.js'
import { asyncHandler } from '../utils/async-handler.js'
import { validateSprint, validateTaskIds } from '../validators/sprint.validator.js'

export const getSprints = asyncHandler(async (request, response) => {
  response.status(200).json({ sprints: await listSprints(request.workspace.id) })
})

export const getSprintById = asyncHandler(async (request, response) => {
  response.status(200).json({ sprint: await getSprint(request.workspace.id, request.params.sprintId) })
})

export const postSprint = asyncHandler(async (request, response) => {
  response.status(201).json({ sprint: await createSprint(request.workspace.id, validateSprint(request.body), request.user.id) })
})

export const patchSprint = asyncHandler(async (request, response) => {
  response.status(200).json({ sprint: await updateSprint(request.workspace.id, request.params.sprintId, validateSprint(request.body, { partial: true }), request.user.id) })
})

export const removeSprint = asyncHandler(async (request, response) => {
  await deleteSprint(request.workspace.id, request.params.sprintId, request.user.id)
  response.status(204).end()
})

export const getTasksForSprint = asyncHandler(async (request, response) => {
  response.status(200).json({ tasks: await getSprintTasks(request.workspace.id, request.params.sprintId) })
})

export const addTasksToSprint = asyncHandler(async (request, response) => {
  response.status(200).json({ sprint: await assignTasksToSprint(request.workspace.id, request.params.sprintId, validateTaskIds(request.body), request.user.id) })
})

export const deleteTaskFromSprint = asyncHandler(async (request, response) => {
  response.status(200).json({ task: await removeTaskFromSprint(request.workspace.id, request.params.sprintId, request.params.taskId, request.user.id) })
})
