import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, User } from "lucide-react";
import { Task, TaskPriority } from "../types/task";

type TaskCardProps = {
  task: Task;
  isOverlay?: boolean;
  onSelect?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
};

function TaskCardBody({
  task,
  isOverlay,
  onEdit,
  onDelete,
}: {
  task: Task;
  isOverlay?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <>
      <div className="mb-2 flex items-start justify-between gap-1.5">
        <div className="flex min-w-0 items-center gap-1 lg:gap-1.5">
          <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-400 lg:h-4 lg:w-4" />
          <span
            className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide lg:px-2 lg:text-[11px] ${PRIORITY_STYLES[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>

        {!isOverlay && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity lg:gap-1 lg:opacity-0 lg:group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
              }}
              title="Edit task"
              className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Pencil className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(task.id);
              }}
              title="Delete task"
              className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
            </button>
          </div>
        )}
      </div>

      <h3 className="break-words text-xs font-semibold leading-snug text-slate-900 lg:text-sm">
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-1.5 break-words text-[11px] leading-relaxed text-slate-600 lg:text-xs">
          {task.description}
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2 text-[11px] text-slate-500 lg:mt-3 lg:pt-2.5 lg:text-xs">
        <div className="flex min-w-0 items-center gap-1 truncate lg:gap-1.5">
          <User className="h-3 w-3 shrink-0 text-slate-400 lg:h-3.5 lg:w-3.5" />
          <span className="truncate">
            {task.assignee ? task.assignee : "Unassigned"}
          </span>
        </div>
        <span className="shrink-0 text-[10px] text-slate-400 lg:text-[11px]">
          #{task.position + 1}
        </span>
      </div>
    </>
  );
}

export default function TaskCard({
  task,
  isOverlay = false,
  onSelect,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
    disabled: isOverlay,
  });

  if (isOverlay) {
    return (
      <div className="cursor-grabbing rounded-xl border-2 border-blue-500 bg-white p-2.5 shadow-2xl ring-2 ring-blue-400/30 lg:p-3.5">
        <TaskCardBody task={task} isOverlay />
      </div>
    );
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/50 p-2.5 lg:p-3.5"
      >
        <div className="invisible">
          <TaskCardBody task={task} />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect?.(task)}
      className="group cursor-pointer touch-none rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs transition hover:border-slate-300 hover:shadow-sm active:cursor-grabbing lg:p-3.5"
    >
      <TaskCardBody
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
