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
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>

        {!isOverlay && (
          <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
              }}
              title="Edit task"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(task.id);
              }}
              title="Delete task"
              className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold leading-snug text-slate-900">
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate">
          <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">
            {task.assignee ? task.assignee : "Unassigned"}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">#{task.position + 1}</span>
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
      <div className="cursor-grabbing rounded-xl border-2 border-blue-500 bg-white p-3.5 shadow-2xl ring-2 ring-blue-400/30">
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
        className="rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/50 p-3.5"
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
      className="group cursor-pointer touch-none rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-slate-300 hover:shadow-sm active:cursor-grabbing"
    >
      <TaskCardBody
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
