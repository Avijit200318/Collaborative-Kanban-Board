import { AlertTriangle, Plus, RefreshCw } from "lucide-react";

type NavbarProps = {
  totalTasks: number;
  loading: boolean;
  liveConnected: boolean;
  simulateError: boolean;
  onToggleSimulateError: () => void;
  onRefresh: () => void;
  onCreateClick: () => void;
};

export default function Navbar({
  totalTasks,
  loading,
  liveConnected,
  simulateError,
  onToggleSimulateError,
  onRefresh,
  onCreateClick,
}: NavbarProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white sm:h-9 sm:w-9 sm:text-sm">
            KB
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                Collaborative Kanban Board
              </h1>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                  liveConnected
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    liveConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {liveConnected ? "Live" : "Reconnecting..."}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {totalTasks} {totalTasks === 1 ? "task" : "tasks"} across 4 columns
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onToggleSimulateError}
            title="Toggle simulated API failures to test optimistic rollback"
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:py-2 ${
              simulateError
                ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{simulateError ? "Error Mode: ON" : "Simulate Error"}</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-50 sm:px-3 sm:py-2 sm:text-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 sm:px-3.5 sm:py-2 sm:text-sm"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
