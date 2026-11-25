import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { ColumnStatus, Task } from "../types/task";
import TaskCard from "./TaskCard";

type KanbanColumnProps = {
  status: ColumnStatus;
  tasks: Task[];
  onAddTask: (status: ColumnStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
};

const COLUMN_ACCENTS: Record<ColumnStatus, string> = {
  Backlog: "bg-slate-400",
  Todo: "bg-blue-500",
  "In Progress": "bg-amber-500",
  Done: "bg-emerald-500",
};

export default function KanbanColumn({
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "Column", status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[520px] flex-col rounded-2xl border p-3.5 transition-colors ${
        isOver
          ? "border-blue-300 bg-blue-50/40"
          : "border-slate-200 bg-slate-100/80"
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${COLUMN_ACCENTS[status]}`} />
          <h2 className="text-sm font-semibold text-slate-800">{status}</h2>
          <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-600">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTask(status)}
          title={`Add task to ${status}`}
          className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-2.5">
          {tasks.length === 0 ? (
            <div
              className={`flex flex-1 items-center justify-center rounded-xl border-2 border-dashed p-6 text-center text-xs ${
                isOver
                  ? "border-blue-400 bg-blue-50 text-blue-600"
                  : "border-slate-200 text-slate-400"
              }`}
            >
              Drop a task here or click + to add one
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
