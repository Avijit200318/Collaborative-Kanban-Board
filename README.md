# Collaborative Kanban Board

**Live Link:** [**click here**](https://github.com/Avijit200318/Collaborative-Kanban-Board/blob/main/Backend/readme.md)

## Website Preview
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/8adfaeed-f652-47a4-9765-5d46d58128c6" />


## Overview

This Collaborative Kanban Board is a full-stack project management application built with the MERN stack and TypeScript. It organizes tasks across four ordered workflow columns (**Backlog**, **Todo**, **In Progress**, and **Done**) with persistent MongoDB ordering and interactive drag-and-drop.

## Table of Contents

- [Features](#features)
- [Project Status](#project-status)
- [Technologies Used](#technologies-used)
- [Project Setup](#project-setup)
- [Usage](#usage)
- [License](#license)

## Features

- **Kanban Board (4 Columns):** Fetches tasks from the backend API and displays them grouped in order across `Backlog`, `Todo`, `In Progress`, and `Done`.
- **Task Management (CRUD):** Create new tasks in any column, edit existing task details, and delete tasks.
- **Drag and Drop:** Move tasks smoothly between columns or reorder them within the same column using `@dnd-kit` with a solid `DragOverlay` card preview, persisting updated `status` and `position` values to MongoDB.
- **Search and Filters:** Search tasks by title and filter simultaneously by priority (`low`, `medium`, `high`) and assignee.
- **URL Query State:** Search text (`q`), priority (`priority`), and assignee (`assignee`) stay synchronized with URL query parameters so refreshing or sharing the URL restores the exact view.
- **Task Details Drawer:** Click any task card to open a slide-over detail drawer to view and edit its title, description, priority, assignee, and status.
- **Optimistic Updates & Rollback:** Creating, editing, deleting, and dragging tasks update the UI immediately; if the backend request fails, Redux restores the pre-mutation snapshot and shows an error banner (with a **Simulate Error** toggle in the navbar for testing).
- **Real-Time Collaboration (SSE):** Streams board changes (`task:created`, `task:updated`, `task:deleted`) over `GET /api/events` and applies remote updates without page reloads while preserving in-flight optimistic mutations, active drags, and unsaved edits in the task detail drawer.
- **Layered Backend Architecture:** Follows a clean `Route → Middleware → Controller → Service → Model` structure with `express-validator` request validation and centralized error handling.

## Project Status

- [x] **1. Board** — Fetch board from API, group tasks by status, and support create, edit, and delete
- [x] **2. Drag and drop** — Move tasks between columns, reorder within a column, and persist `status` and `position`
- [x] **3. Search and filters** — Search by title and combine priority + assignee filters together
- [x] **4. Task details** — Click any task card to open a detail drawer to view and edit description, priority, assignee, and status
- [x] **5. Optimistic updates** — Instant UI updates with snapshot rollback and error banner on API failures
- [x] **6. Real-time collaboration** — Server-Sent Events (`GET /api/events`) broadcast creates, updates, and deletes across connected tabs without overwriting local optimistic or drawer edits
- [x] **7. URL state** — Search text and priority/assignee filters sync to URL query parameters and restore on refresh

## Architecture Notes

### Optimistic Updates & Rollback
Every mutation (`createTask`, `updateTask`, `moveTask`, and `deleteTask`) in `Frontend/src/redux/board/boardSlice.ts` saves a deep copy of `state.tasks` into `snapshots[requestId]` during `.pending` and applies the change immediately to Redux state. If the API responds with success (`.fulfilled`), the snapshot is cleared and the canonical server task list is applied once no other optimistic requests remain in flight. If the API fails (`.rejected`), Redux restores `state.tasks` from `snapshots[requestId]` and surfaces the error message in the alert banner.

### Real-Time Collaboration & Conflict Handling
The backend streams changes via Server-Sent Events (`GET /api/events`). Each tab sends a unique `x-client-id` header on mutations so incoming SSE events from the same tab are ignored (`sourceClientId === CLIENT_ID`). For updates coming from other users, `applyRemoteEvent` builds a lock set from in-flight `pendingTaskIds` and the currently dragged card (`activeDragId`), merging remote changes only for unlocked tasks. Inside `TaskDetailDrawer.tsx`, active unsaved form inputs are never overwritten by background updates—instead, a non-intrusive banner lets the user keep editing or click **Load latest**.

### Coding Agents Used
- Built collaboratively with **Antigravity** (AI coding assistant).

## Technologies Used

- **MongoDB & Mongoose:** NoSQL database and schema modeling for tasks and column positions.
- **Express.js & Node.js:** RESTful backend API with validation (`express-validator`) and centralized error handling.
- **React 19 + TypeScript:** Component-based frontend UI built with Vite.
- **Redux Toolkit:** Predictable client-side state management for board tasks and async API calls.
- **Tailwind CSS v4:** Utility-first styling for the responsive Kanban layout.
- **@dnd-kit (`core`, `sortable`, `utilities`):** Accessible, pointer-based drag-and-drop across and within columns.

## Project Setup

### Getting Started

Follow the steps below to set up and run the application on your local machine:

1. **Navigate to the Project Directory**

```bash
cd Collaborative-Kanban-Board
```

2. **Add all the `.env` variables**
- Create a `.env` file in the root directory using `.env.example.txt` as a template and fill in your values:

```env
PORT=4000
MONGO=your_mongodb_connection_string
```

3. **Install and Start Backend**

```bash
npm install
npm run dev
```

This starts the backend server on `http://localhost:4000`.

4. **Install and Start Frontend**

```bash
cd Frontend
npm install
npm run dev
```

This starts the frontend server on `http://localhost:5173`.

⚠️ Make sure your backend server is running before launching the frontend.


## API Documentation
 For API documentation [**click here**](https://github.com/Avijit200318/Collaborative-Kanban-Board/blob/main/Backend/readme.md)
 


## Usage

1. **View Board:** Open `http://localhost:5173` to see all tasks grouped into **Backlog**, **Todo**, **In Progress**, and **Done**.
2. **Create a Task:** Click **New Task** in the navbar (or the **+** icon on any column header), fill in title, description, status, priority, and assignee, and submit.
3. **Edit / Delete a Task:** Hover over a task card and click the **pencil** icon to edit or the **trash** icon to delete.
4. **Drag & Drop:** Grab any task card to move it to another column or reorder it within the same column—changes are saved automatically via the backend API.


