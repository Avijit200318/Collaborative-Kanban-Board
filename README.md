# Collaborative Kanban Board

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
- **Task Details Drawer:** Click any task card to open a slide-over detail drawer to view and edit its title, description, priority, assignee, and status.
- **Optimistic Updates & Rollback:** Creating, editing, deleting, and dragging tasks update the UI immediately; if the backend request fails, Redux restores the pre-mutation snapshot and shows an error banner (with a **Simulate Error** toggle in the navbar for testing).
- **Layered Backend Architecture:** Follows a clean `Route → Middleware → Controller → Service → Model` structure with `express-validator` request validation and centralized error handling.

## Project Status

- [x] **1. Board** — Fetch board from API, group tasks by status, and support create, edit, and delete
- [x] **2. Drag and drop** — Move tasks between columns, reorder within a column, and persist `status` and `position`
- [x] **3. Search and filters** — Search by title and combine priority + assignee filters together
- [x] **4. Task details** — Click any task card to open a detail drawer to view and edit description, priority, assignee, and status
- [x] **5. Optimistic updates** — Instant UI updates with snapshot rollback and error banner on API failures
- [ ] **6. Real-time collaboration** — Upcoming
- [ ] **7. URL state** — Upcoming

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
- Create a `.env` file in the root directory using `.env.example` as a template and fill in your values:

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

## Usage

1. **View Board:** Open `http://localhost:5173` to see all tasks grouped into **Backlog**, **Todo**, **In Progress**, and **Done**.
2. **Create a Task:** Click **New Task** in the navbar (or the **+** icon on any column header), fill in title, description, status, priority, and assignee, and submit.
3. **Edit / Delete a Task:** Hover over a task card and click the **pencil** icon to edit or the **trash** icon to delete.
4. **Drag & Drop:** Grab any task card to move it to another column or reorder it within the same column—changes are saved automatically via the backend API.

## License

This project is licensed under the ISC License.
