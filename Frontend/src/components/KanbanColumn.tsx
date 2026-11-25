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
  isFiltered: boolean;
  onAddTask: (status: ColumnStatus) => void;
  onSelectTask: (task: Task) => void;
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
  isFiltered,
  onAddTask,
  onSelectTask,
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
      className={`flex min-h-[380px] min-w-0 flex-col rounded-2xl border p-2.5 transition-colors sm:min-h-[460px] lg:min-h-[520px] lg:p-3.5 ${
        isOver
          ? "border-blue-300 bg-blue-50/40"
          : "border-slate-200 bg-slate-100/80"
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-1 px-0.5 lg:mb-3 lg:px-1">
        <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full lg:h-2.5 lg:w-2.5 ${COLUMN_ACCENTS[status]}`} />
          <h2 className="truncate text-xs font-semibold text-slate-800 lg:text-sm">
            {status}
          </h2>
          <span className="shrink-0 rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 lg:px-2 lg:text-xs">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTask(status)}
          title={`Add task to ${status}`}
          className="shrink-0 cursor-pointer rounded-lg p-1 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900"
        >
          <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
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
              {isFiltered
                ? "No matching tasks in this column"
                : "Drop a task here or click + to add one"}
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onSelect={onSelectTask}
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
