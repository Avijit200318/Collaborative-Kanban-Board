import { FormEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, Calendar, Trash2, X } from "lucide-react";
import {
  COLUMN_ORDER,
  ColumnStatus,
  Task,
  TaskPayload,
  TaskPriority,
} from "../types/task";

type TaskDetailDrawerProps = {
  task: Task | null;
  saving: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<TaskPayload>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function TaskDetailDrawer({
  task,
  saving,
  onClose,
  onSave,
  onDelete,
}: TaskDetailDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState<ColumnStatus>("Backlog");
  const [validationError, setValidationError] = useState("");
  const [remoteUpdateNotice, setRemoteUpdateNotice] = useState(false);

  const loadedTaskIdRef = useRef<string | null>(null);
  const lastSeenUpdatedAtRef = useRef<string | null>(null);

  const hasChanges = task
    ? title.trim() !== task.title ||
      description !== task.description ||
      priority !== task.priority ||
      assignee.trim() !== task.assignee ||
      status !== task.status
    : false;

  const hasChangesRef = useRef(hasChanges);
  hasChangesRef.current = hasChanges;

  useEffect(() => {
    if (!task) {
      loadedTaskIdRef.current = null;
      lastSeenUpdatedAtRef.current = null;
      setRemoteUpdateNotice(false);
      return;
    }

    const isNewTaskOpened = loadedTaskIdRef.current !== task.id;
    const isRemoteTimestampChanged =
      lastSeenUpdatedAtRef.current !== null &&
      lastSeenUpdatedAtRef.current !== task.updatedAt;

    if (isNewTaskOpened) {
      loadedTaskIdRef.current = task.id;
      lastSeenUpdatedAtRef.current = task.updatedAt;
      setValidationError("");
      setRemoteUpdateNotice(false);
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setAssignee(task.assignee);
      setStatus(task.status as ColumnStatus);
      return;
    }

    if (isRemoteTimestampChanged) {
      lastSeenUpdatedAtRef.current = task.updatedAt;
      if (hasChangesRef.current) {
        // Preserve the user's unsaved local edits instead of overwriting them
        setRemoteUpdateNotice(true);
      } else {
        setTitle(task.title);
        setDescription(task.description);
        setPriority(task.priority);
        setAssignee(task.assignee);
        setStatus(task.status as ColumnStatus);
      }
    }
  }, [task]);

  useEffect(() => {
    if (!task) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [task, onClose]);

  if (!task) return null;

  const handleLoadLatest = () => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setAssignee(task.assignee);
    setStatus(task.status as ColumnStatus);
    setRemoteUpdateNotice(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError("Title cannot be empty.");
      return;
    }

    await onSave(task.id, {
      title: title.trim(),
      description,
      priority,
      assignee: assignee.trim(),
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Task Details
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Edit Task
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col justify-between overflow-y-auto p-5"
        >
          <div className="space-y-4">
            {remoteUpdateNotice && (
              <div className="flex items-start justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Updated by another user while you were editing. Your local
                    inputs were preserved.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadLatest}
                  className="shrink-0 cursor-pointer font-semibold underline hover:text-amber-950"
                >
                  Load latest
                </button>
              </div>
            )}

            {validationError && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {validationError}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ColumnStatus)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900"
                >
                  {COLUMN_ORDER.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Assignee
              </label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Unassigned"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Description
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add detailed notes, acceptance criteria, or links..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-slate-900"
              />
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Last updated:{" "}
                  {new Date(task.updatedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Column position: #{task.position + 1}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => onDelete(task.id)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-default disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-default disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}
