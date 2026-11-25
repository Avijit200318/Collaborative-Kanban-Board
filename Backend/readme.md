# Overview

This is the backend service for the Collaborative Kanban Board. Built with Node.js, Express 5, and MongoDB (Mongoose), it follows a clean **Route → Middleware → Controller → Service → Model** architecture to manage board retrieval, task CRUD operations, and persistent column ordering.

---

# API Documentation

> **Base URL (local):** `http://localhost:4000`

---

# Board API Endpoints

## Endpoint: `/api/board`

### Description
This endpoint fetches the full Kanban board state. It returns the ordered list of board columns along with all tasks sorted by `position` (and `updatedAt` as a tiebreaker).

### Method
`GET`

### Example Response
```json
{
  "columns": ["Backlog", "Todo", "In Progress", "Done"],
  "tasks": [
    {
      "id": "6744a1b2c3d4e5f60718293a",
      "title": "Design Home Page",
      "description": "Design the task home page",
      "priority": "medium",
      "assignee": "Avijit",
      "status": "Todo",
      "position": 0,
      "updatedAt": "2026-11-25T18:00:00.000Z"
    }
  ]
}
```

---

# Task API Endpoints

## Endpoint: `/api/tasks/create`

### Description
This endpoint creates a new task in MongoDB. It validates the incoming request body, calculates the next `position` at the end of the target column, saves the task, and returns the created task object.

### Method
`POST`

### Request Body
The request body should be a JSON object with the following fields:
- `title`: A non-empty string (required)
- `description`: A string describing the task (optional, defaults to `""`)
- `priority`: One of `"low"`, `"medium"`, or `"high"` (optional, defaults to `"medium"`)
- `assignee`: A string for the assigned person's name (optional, defaults to `""`)
- `status`: One of `"Backlog"`, `"Todo"`, `"In Progress"`, or `"Done"` (optional, defaults to `"Backlog"`)

Example:
```json
{
  "title": "Build Backend",
  "description": "Complete the backend part",
  "priority": "high",
  "assignee": "Avijit Hira",
  "status": "In Progress"
}
```

### Example Response
```json
{
  "task": {
    "id": "6744a1b2c3d4e5f60718293b",
    "title": "Build Backend",
    "description": "Complete the backend part",
    "priority": "high",
    "assignee": "Avijit Hira",
    "status": "In Progress",
    "position": 0,
    "updatedAt": "2026-11-25T18:05:00.000Z"
  }
}
```

---

## Endpoint: `/api/tasks/update/:id`

### Description
This endpoint updates an existing task. It supports both editing task fields (`title`, `description`, `priority`, `assignee`) and moving or reordering tasks via drag-and-drop (`status`, `position`). When `status` or `position` changes, it automatically re-indexes task positions in the affected column(s) so ordering stays gap-free, then returns the updated task along with the refreshed task list.

### Method
`PATCH`

### URL Parameters
- `id`: Valid MongoDB ObjectId of the task (required)

### Request Body
All fields are optional; send only the fields to update:
- `title`: Non-empty string
- `description`: String
- `priority`: One of `"low"`, `"medium"`, or `"high"`
- `assignee`: String
- `status`: One of `"Backlog"`, `"Todo"`, `"In Progress"`, or `"Done"`
- `position`: Non-negative integer (`0` or greater) representing the new index in the column

Example (moving/reordering a task):
```json
{
  "status": "Todo",
  "position": 1
}
```

### Example Response
```json
{
  "task": {
    "id": "6744a1b2c3d4e5f60718293b",
    "title": "Build Backend",
    "description": "Complete the backend part",
    "priority": "high",
    "assignee": "Avijit Hira",
    "status": "Todo",
    "position": 1,
    "updatedAt": "2026-11-25T18:10:00.000Z"
  },
  "tasks": [
    {
      "id": "6744a1b2c3d4e5f60718293a",
      "title": "Design Home Page",
      "description": "Design the task home page",
      "priority": "medium",
      "assignee": "Avijit",
      "status": "Todo",
      "position": 0,
      "updatedAt": "2026-11-25T18:00:00.000Z"
    },
    {
      "id": "6744a1b2c3d4e5f60718293b",
      "title": "Build Backend",
      "description": "Complete the backend part",
      "priority": "high",
      "assignee": "Avijit Hira",
      "status": "Todo",
      "position": 1,
      "updatedAt": "2026-11-25T18:10:00.000Z"
    }
  ]
}
```

---

## Endpoint: `/api/tasks/delete/:id`

### Description
This endpoint deletes a task by its ID, re-indexes the remaining task positions in that column, and returns the deleted task ID along with the updated task list.

### Method
`DELETE`

### URL Parameters
- `id`: Valid MongoDB ObjectId of the task (required)

### Example Response
```json
{
  "message": "Task deleted successfully",
  "id": "6744a1b2c3d4e5f60718293b",
  "tasks": []
}
```

---

# Real-Time Events Endpoint (SSE)

## Endpoint: `/api/events`

### Description
This endpoint opens a Server-Sent Events (SSE) stream to push real-time board updates to connected clients whenever any user creates, updates, moves, or deletes a task. It sends an initial `connected` event, broadcasts `board-update` events (`task:created`, `task:updated`, `task:deleted`) with `sourceClientId` so originating tabs can deduplicate their own mutations, and sends periodic heartbeats to keep the connection alive.

### Method
`GET`

### Response Stream (`text/event-stream`)
```text
event: connected
data: {"status":"connected"}

event: board-update
data: {"type":"task:created","sourceClientId":"client-uuid","task":{...}}
```

---

# Error Response Format

All validation, not-found (`404`), and server (`500`) errors are handled by the global error middleware in `Backend/app.js` and return JSON in this format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Title is required"
}
```
