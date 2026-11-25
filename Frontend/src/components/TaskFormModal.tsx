import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  COLUMN_ORDER,
  ColumnStatus,
  Task,
  TaskPayload,
  TaskPriority,
} from "../types/task";

type TaskFormModalProps = {
  isOpen: boolean;
  initialTask: Task | null;
  defaultStatus: ColumnStatus;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: TaskPayload) => void;
};

export default function TaskFormModal({
  isOpen,
  initialTask,
  defaultStatus,
  saving,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState<ColumnStatus>(defaultStatus);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setValidationError("");
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setPriority(initialTask.priority);
      setAssignee(initialTask.assignee);
      setStatus(initialTask.status as ColumnStatus);
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignee("");
      setStatus(defaultStatus);
    }
  }, [isOpen, initialTask, defaultStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError("Title is required.");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assignee.trim(),
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-[1px] sm:p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            {initialTask ? "Edit Task" : "Create Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {validationError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Set up real-time sync"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task details..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ColumnStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
              >
                {COLUMN_ORDER.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Assignee
            </label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="e.g. Avijit"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-default disabled:opacity-50"
            >
              {saving ? "Saving..." : initialTask ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
