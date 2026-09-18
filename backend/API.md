# TaskFlow API

Base URL: `http://localhost:4000/api`. JSON responses use `{ error: { message } }` for errors.

## Authentication and workspace scope

Protected endpoints require `Authorization: Bearer <accessToken>`. Workspace endpoints also resolve the caller's active workspace from `X-Workspace-Id`; when omitted, the caller's earliest workspace membership is used. Resource lookups are always scoped to that workspace.

Roles are `ADMIN`, `MANAGER`, and `MEMBER`. Creating/updating projects and sprints requires admin or manager; deleting projects/sprints and removing members requires admin. Members can read workspace data and use task operations allowed by the existing routes.

## Endpoints

| Area | Endpoints |
| --- | --- |
| Health | `GET /health` |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Workspace/team | `GET /workspaces/current`, `GET /workspaces/members`, `GET /workspaces/members/:memberId`, `PATCH /workspaces/members/:memberId`, `DELETE /workspaces/members/:memberId` |
| Projects | `GET, POST /projects`, `GET, PATCH, DELETE /projects/:projectId`, `PUT /projects/:projectId/members` |
| Tasks | `GET, POST /tasks`, `GET, PATCH, DELETE /tasks/:taskId`, `PATCH /tasks/:taskId/status`, `GET /tasks/labels` |
| Sprints | `GET, POST /sprints`, `GET, PATCH, DELETE /sprints/:sprintId`, `GET /sprints/:sprintId/tasks`, `POST /sprints/:sprintId/tasks`, `DELETE /sprints/:sprintId/tasks/:taskId` |
| Activity | `GET /activity` (`/activities` is an alias) |
| Analytics | `GET /dashboard`, `GET /reports/overview` |

## Query parameters

`GET /tasks` accepts `projectId`, `sprintId` (`none` supported), `assigneeId` (`unassigned` supported), `status`, `priority`, `label`, `search` (max 200 characters), and `sort` (`updated-desc`, `dueDate-asc`, `dueDate-desc`, `priority-desc`, `priority-asc`).

`GET /activity` accepts `page` (default `1`), `limit` (default `20`, maximum `100`), `type`, `actorId`, `projectId`, `sprintId`, and `taskId`. It returns `{ activities, pagination }`.

## Important payloads

`POST /tasks` needs `title` and `projectId`; it accepts status, priority, sprint/assignee IDs, due date, story points, description, and up to 50 labels. `PATCH /tasks/:taskId/status` needs `status` and accepts a non-negative `order`.

`POST /sprints` needs `name`, `goal`, `startDate`, and `endDate`; dates must be real `YYYY-MM-DD` calendar dates. `POST /sprints/:sprintId/tasks` accepts `{ "taskIds": ["..."] }` with 1–100 IDs.

## Security behavior

The API accepts JSON bodies up to 1 MB, rejects malformed JSON with HTTP 400, applies security response headers, and only permits origins explicitly listed in `CORS_ORIGIN` (comma-separated values are supported). Registration, login, and token refresh are rate-limited to 10 attempts per IP and route per 15 minutes. Production deployments must use strong, distinct JWT secrets and HTTPS.
