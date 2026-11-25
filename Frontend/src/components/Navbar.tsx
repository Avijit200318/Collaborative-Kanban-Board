import { AlertTriangle, Plus, RefreshCw } from "lucide-react";

type NavbarProps = {
  totalTasks: number;
  loading: boolean;
  simulateError: boolean;
  onToggleSimulateError: () => void;
  onRefresh: () => void;
  onCreateClick: () => void;
};

export default function Navbar({
  totalTasks,
  loading,
  simulateError,
  onToggleSimulateError,
  onRefresh,
  onCreateClick,
}: NavbarProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            KB
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Collaborative Kanban Board
            </h1>
            <p className="text-xs text-slate-500">
              {totalTasks} {totalTasks === 1 ? "task" : "tasks"} across 4 columns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleSimulateError}
            title="Toggle simulated API failures to test optimistic rollback"
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
              simulateError
                ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {simulateError ? "Error Mode: ON" : "Simulate Error"}
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </div>
    </header>
  );
}
