import { createTask, deleteTask, getTask, listLabels, listTasks, moveTask, updateTask } from '../services/task.service.js'
import { asyncHandler } from '../utils/async-handler.js'
import { validateTask, validateTaskMove, validateTaskQuery } from '../validators/task.validator.js'

export const getTasks = asyncHandler(async (request, response) => {
  response.status(200).json({ tasks: await listTasks(request.workspace.id, validateTaskQuery(request.query)) })
})
export const getTaskById = asyncHandler(async (request, response) => {
  response.status(200).json({ task: await getTask(request.workspace.id, request.params.taskId) })
})
export const postTask = asyncHandler(async (request, response) => {
  response.status(201).json({ task: await createTask(request.workspace.id, request.user.id, validateTask(request.body)) })
})
export const patchTask = asyncHandler(async (request, response) => {
  response.status(200).json({ task: await updateTask(request.workspace.id, request.params.taskId, validateTask(request.body, { partial: true }), request.user.id) })
})
export const patchTaskStatus = asyncHandler(async (request, response) => {
  const { status, order } = validateTaskMove(request.body)
  response.status(200).json({ task: await moveTask(request.workspace.id, request.params.taskId, status, order, request.user.id) })
})
export const removeTask = asyncHandler(async (request, response) => {
  await deleteTask(request.workspace.id, request.params.taskId, request.user.id)
  response.status(204).end()
})
export const getLabels = asyncHandler(async (request, response) => {
  response.status(200).json({ labels: await listLabels(request.workspace.id) })
})
