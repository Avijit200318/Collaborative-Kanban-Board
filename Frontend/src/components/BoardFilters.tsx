import { Search, X } from "lucide-react";
import { TaskPriority } from "../types/task";

export type PriorityFilter = "all" | TaskPriority;

type BoardFiltersProps = {
  searchText: string;
  priorityFilter: PriorityFilter;
  assigneeFilter: string;
  assignees: string[];
  filteredCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onPriorityChange: (value: PriorityFilter) => void;
  onAssigneeChange: (value: string) => void;
  onClearAll: () => void;
};

export default function BoardFilters({
  searchText,
  priorityFilter,
  assigneeFilter,
  assignees,
  filteredCount,
  totalCount,
  onSearchChange,
  onPriorityChange,
  onAssigneeChange,
  onClearAll,
}: BoardFiltersProps) {
  const hasActiveFilters =
    searchText.trim() !== "" ||
    priorityFilter !== "all" ||
    assigneeFilter !== "all";

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title..."
            aria-label="Search tasks by title"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              title="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value as PriorityFilter)}
            aria-label="Filter by priority"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => onAssigneeChange(e.target.value)}
            aria-label="Filter by assignee"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white"
          >
            <option value="all">All Assignees</option>
            {assignees.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
            <option value="__unassigned__">Unassigned</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="text-xs font-medium text-slate-500">
        {hasActiveFilters
          ? `Showing ${filteredCount} of ${totalCount} tasks`
          : `${totalCount} ${totalCount === 1 ? "task" : "tasks"} total`}
      </div>
    </div>
  );
}
