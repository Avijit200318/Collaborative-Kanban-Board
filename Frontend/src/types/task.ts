export type TaskPriority = "low" | "medium" | "high";

export type ColumnStatus = "Backlog" | "Todo" | "In Progress" | "Done";

export const COLUMN_ORDER: ColumnStatus[] = [
  "Backlog",
  "Todo",
  "In Progress",
  "Done",
];

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignee: string;
  status: string;
  position: number;
  updatedAt: string;
};

export type TaskPayload = {
  title: string;
  description: string;
  priority: TaskPriority;
  assignee: string;
  status: ColumnStatus;
};
