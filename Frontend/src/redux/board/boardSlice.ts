import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { COLUMN_ORDER, ColumnStatus, Task, TaskPayload } from "../../types/task";

type BoardState = {
  tasks: Task[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  simulateError: boolean;
  snapshots: Record<string, Task[]>;
  pendingTaskIds: Record<string, string>;
};

const initialState: BoardState = {
  tasks: [],
  loading: false,
  saving: false,
  error: null,
  simulateError: false,
  snapshots: {},
  pendingTaskIds: {},
};

const parseJsonOrThrow = async (res: Response) => {
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const cloneTasks = (tasks: Task[]): Task[] =>
  tasks.map((task) => ({ ...task }));

const reindexColumnTasks = (tasks: Task[], status: string) => {
  const columnTasks = tasks
    .filter((t) => t.status === status)
    .sort((a, b) => a.position - b.position);

  columnTasks.forEach((task, index) => {
    task.position = index;
  });
};

const applyOptimisticMove = (
  tasks: Task[],
  taskId: string,
  targetStatus: string,
  targetPosition?: number
): Task[] => {
  const next = cloneTasks(tasks);
  const movingTask = next.find((t) => t.id === taskId);
  if (!movingTask) return next;

  const oldStatus = movingTask.status;

  if (oldStatus === targetStatus) {
    const siblings = next
      .filter((t) => t.status === oldStatus && t.id !== taskId)
      .sort((a, b) => a.position - b.position);

    const clamped = Math.max(
      0,
      Math.min(targetPosition ?? movingTask.position, siblings.length)
    );
    siblings.splice(clamped, 0, movingTask);
    siblings.forEach((t, idx) => {
      t.position = idx;
    });
  } else {
    const oldSiblings = next
      .filter((t) => t.status === oldStatus && t.id !== taskId)
      .sort((a, b) => a.position - b.position);
    oldSiblings.forEach((t, idx) => {
      t.position = idx;
    });

    const targetSiblings = next
      .filter((t) => t.status === targetStatus && t.id !== taskId)
      .sort((a, b) => a.position - b.position);

    const clamped = Math.max(
      0,
      Math.min(targetPosition ?? targetSiblings.length, targetSiblings.length)
    );
    movingTask.status = targetStatus;
    targetSiblings.splice(clamped, 0, movingTask);
    targetSiblings.forEach((t, idx) => {
      t.position = idx;
    });
  }

  movingTask.updatedAt = new Date().toISOString();

  next.sort((a, b) => {
    const colDiff =
      COLUMN_ORDER.indexOf(a.status as ColumnStatus) -
      COLUMN_ORDER.indexOf(b.status as ColumnStatus);
    return colDiff !== 0 ? colDiff : a.position - b.position;
  });

  return next;
};

export const fetchBoard = createAsyncThunk("board/fetchBoard", async () => {
  const res = await fetch("/api/board");
  const data = await parseJsonOrThrow(res);
  return data.tasks as Task[];
});

export const createTask = createAsyncThunk<
  Task,
  TaskPayload,
  { state: { board: BoardState } }
>("board/createTask", async (payload, { getState }) => {
  const { simulateError } = getState().board;
  const res = await fetch("/api/tasks/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(simulateError ? { "x-simulate-error": "true" } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonOrThrow(res);
  return data.task as Task;
});

export const updateTask = createAsyncThunk<
  Task[],
  { id: string; updates: Partial<TaskPayload> & { position?: number } },
  { state: { board: BoardState } }
>("board/updateTask", async ({ id, updates }, { getState }) => {
  const { simulateError } = getState().board;
  const res = await fetch(`/api/tasks/update/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(simulateError ? { "x-simulate-error": "true" } : {}),
    },
    body: JSON.stringify(updates),
  });
  const data = await parseJsonOrThrow(res);
  return data.tasks as Task[];
});

export const moveTask = createAsyncThunk<
  Task[],
  { id: string; status: ColumnStatus; position: number },
  { state: { board: BoardState } }
>("board/moveTask", async ({ id, status, position }, { getState }) => {
  const { simulateError } = getState().board;
  const res = await fetch(`/api/tasks/update/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(simulateError ? { "x-simulate-error": "true" } : {}),
    },
    body: JSON.stringify({ status, position }),
  });
  const data = await parseJsonOrThrow(res);
  return data.tasks as Task[];
});

export const deleteTask = createAsyncThunk<
  Task[],
  string,
  { state: { board: BoardState } }
>("board/deleteTask", async (id, { getState }) => {
  const { simulateError } = getState().board;
  const res = await fetch(`/api/tasks/delete/${id}`, {
    method: "DELETE",
    headers: {
      ...(simulateError ? { "x-simulate-error": "true" } : {}),
    },
  });
  const data = await parseJsonOrThrow(res);
  return data.tasks as Task[];
});

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    clearBoardError: (state) => {
      state.error = null;
    },
    toggleSimulateError: (state) => {
      state.simulateError = !state.simulateError;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load board";
      })

      // Optimistic Create
      .addCase(createTask.pending, (state, action) => {
        const { requestId, arg } = action.meta;
        state.snapshots[requestId] = cloneTasks(state.tasks);
        state.saving = true;
        state.error = null;

        const targetColTasks = state.tasks.filter(
          (t) => t.status === arg.status
        );
        const tempId = `temp-${requestId}`;
        state.pendingTaskIds[requestId] = tempId;

        state.tasks.push({
          id: tempId,
          title: arg.title,
          description: arg.description,
          priority: arg.priority,
          assignee: arg.assignee,
          status: arg.status,
          position: targetColTasks.length,
          updatedAt: new Date().toISOString(),
        });
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const { requestId } = action.meta;
        const tempId = `temp-${requestId}`;
        delete state.snapshots[requestId];
        delete state.pendingTaskIds[requestId];
        state.saving = Object.keys(state.snapshots).length > 0;

        const tempIndex = state.tasks.findIndex((t) => t.id === tempId);
        if (tempIndex !== -1) {
          state.tasks[tempIndex] = action.payload;
        } else {
          state.tasks.push(action.payload);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        const { requestId } = action.meta;
        if (state.snapshots[requestId]) {
          state.tasks = state.snapshots[requestId];
          delete state.snapshots[requestId];
        }
        delete state.pendingTaskIds[requestId];
        state.saving = Object.keys(state.snapshots).length > 0;
        state.error = action.error.message || "Failed to create task";
      })

      // Optimistic Update
      .addCase(updateTask.pending, (state, action) => {
        const { requestId, arg } = action.meta;
        state.snapshots[requestId] = cloneTasks(state.tasks);
        state.pendingTaskIds[requestId] = arg.id;
        state.saving = true;
        state.error = null;

        const existing = state.tasks.find((t) => t.id === arg.id);
        if (!existing) return;

        if (arg.updates.title !== undefined) existing.title = arg.updates.title;
        if (arg.updates.description !== undefined)
          existing.description = arg.updates.description;
        if (arg.updates.priority !== undefined)
          existing.priority = arg.updates.priority;
        if (arg.updates.assignee !== undefined)
          existing.assignee = arg.updates.assignee;

        if (
          arg.updates.status !== undefined ||
          arg.updates.position !== undefined
        ) {
          state.tasks = applyOptimisticMove(
            state.tasks,
            arg.id,
            arg.updates.status ?? existing.status,
            arg.updates.position
          );
        } else {
          existing.updatedAt = new Date().toISOString();
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { requestId } = action.meta;
        delete state.snapshots[requestId];
        delete state.pendingTaskIds[requestId];
        state.saving = Object.keys(state.snapshots).length > 0;

        if (Object.keys(state.snapshots).length === 0) {
          state.tasks = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        const { requestId } = action.meta;
        if (state.snapshots[requestId]) {
          state.tasks = state.snapshots[requestId];
          delete state.snapshots[requestId];
        }
        delete state.pendingTaskIds[requestId];
        state.saving = Object.keys(state.snapshots).length > 0;
        state.error = action.error.message || "Failed to update task";
      })

      // Optimistic Drag & Drop Move
      .addCase(moveTask.pending, (state, action) => {
        const { requestId, arg } = action.meta;
        state.snapshots[requestId] = cloneTasks(state.tasks);
        state.pendingTaskIds[requestId] = arg.id;
        state.saving = true;
        state.error = null;

        state.tasks = applyOptimisticMove(
          state.tasks,
          arg.id,
          arg.status,
          arg.position
        );
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        const { requestId } = action.meta;
        delete state.snapshots[requestId];
        delete state.pendingTaskIds[requestId];
        state.saving = Object.keys(state.snapshots).length > 0;

        if (Object.keys(state.snapshots).length === 0) {
          state.tasks = action.payload;
        }
      })
      .addCase(moveTask.rejected, (state, action) => {
        const { requestId } = action.meta;
        if (state.snapshots[requestId]) {
          state.tasks = state.snapshots[requestId];
          delete state.snapshots[requestId];
        }
        delete state.pendingTaskIds[requestId];
        state.saving = Object.keys(state.snapshots).length > 0;
        state.error = action.error.message || "Failed to move task";
      })

      // Optimistic Delete
      .addCase(deleteTask.pending, (state, action) => {
        const { requestId, arg: id } = action.meta;
        state.snapshots[requestId] = cloneTasks(state.tasks);
        state.pendingTaskIds[requestId] = id;
        state.saving = true;
        state.error = null;

        const target = state.tasks.find((t) => t.id === id);
        state.tasks = state.tasks.filter((t) => t.id !== id);
        if (target) {
          reindexColumnTasks(state.tasks, target.status);
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { requestId } = action.meta;
        delete state.snapshots[requestId];
        delete state.pendingTaskIds[requestId];
        state.saving = Object.keys(state.snapshots).length > 0;

        if (Object.keys(state.snapshots).length === 0) {
          state.tasks = action.payload;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        const { requestId } = action.meta;
        if (state.snapshots[requestId]) {
          state.tasks = state.snapshots[requestId];
          delete state.snapshots[requestId];
        }
        delete state.pendingTaskIds[requestId];
        state.saving = Object.keys(state.snapshots).length > 0;
        state.error = action.error.message || "Failed to delete task";
      });
  },
});

export const { clearBoardError, toggleSimulateError } = boardSlice.actions;
export default boardSlice.reducer;
