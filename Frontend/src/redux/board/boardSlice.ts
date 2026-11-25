import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ColumnStatus, Task, TaskPayload } from "../../types/task";

type BoardState = {
  tasks: Task[];
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: BoardState = {
  tasks: [],
  loading: false,
  saving: false,
  error: null,
};

const parseJsonOrThrow = async (res: Response) => {
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const fetchBoard = createAsyncThunk("board/fetchBoard", async () => {
  const res = await fetch("/api/board");
  const data = await parseJsonOrThrow(res);
  return data.tasks as Task[];
});

export const createTask = createAsyncThunk(
  "board/createTask",
  async (payload: TaskPayload) => {
    const res = await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseJsonOrThrow(res);
    return data.task as Task;
  }
);

export const updateTask = createAsyncThunk(
  "board/updateTask",
  async ({
    id,
    updates,
  }: {
    id: string;
    updates: Partial<TaskPayload> & { position?: number };
  }) => {
    const res = await fetch(`/api/tasks/update/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await parseJsonOrThrow(res);
    return data.tasks as Task[];
  }
);

export const moveTask = createAsyncThunk(
  "board/moveTask",
  async ({
    id,
    status,
    position,
  }: {
    id: string;
    status: ColumnStatus;
    position: number;
  }) => {
    const res = await fetch(`/api/tasks/update/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, position }),
    });
    const data = await parseJsonOrThrow(res);
    return data.tasks as Task[];
  }
);

export const deleteTask = createAsyncThunk(
  "board/deleteTask",
  async (id: string) => {
    const res = await fetch(`/api/tasks/delete/${id}`, {
      method: "DELETE",
    });
    const data = await parseJsonOrThrow(res);
    return data.tasks as Task[];
  }
);

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    clearBoardError: (state) => {
      state.error = null;
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
      .addCase(createTask.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.saving = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to create task";
      })
      .addCase(updateTask.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.saving = false;
        state.tasks = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to update task";
      })
      .addCase(moveTask.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.saving = false;
        state.tasks = action.payload;
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to move task";
      })
      .addCase(deleteTask.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.saving = false;
        state.tasks = action.payload;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to delete task";
      });
  },
});

export const { clearBoardError } = boardSlice.actions;
export default boardSlice.reducer;
