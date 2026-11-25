import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { AlertCircle, X } from "lucide-react";
import Navbar from "../components/Navbar";
import BoardFilters, { PriorityFilter } from "../components/BoardFilters";
import KanbanColumn from "../components/KanbanColumn";
import TaskCard from "../components/TaskCard";
import TaskDetailDrawer from "../components/TaskDetailDrawer";
import TaskFormModal from "../components/TaskFormModal";
import { AppDispatch, RootState } from "../redux/store";
import {
  clearBoardError,
  createTask,
  deleteTask,
  fetchBoard,
  moveTask,
  toggleSimulateError,
  updateTask,
} from "../redux/board/boardSlice";
import { COLUMN_ORDER, ColumnStatus, Task, TaskPayload } from "../types/task";

const groupAndSortTasks = (taskList: Task[]) => {
  const groups: Record<ColumnStatus, Task[]> = {
    Backlog: [],
    Todo: [],
    "In Progress": [],
    Done: [],
  };

  for (const task of taskList) {
    const col = task.status as ColumnStatus;
    if (groups[col]) {
      groups[col].push(task);
    }
  }

  for (const col of COLUMN_ORDER) {
    groups[col].sort((a, b) => a.position - b.position);
  }

  return groups;
};

const flattenGroups = (groups: Record<ColumnStatus, Task[]>): Task[] => {
  const result: Task[] = [];
  for (const col of COLUMN_ORDER) {
    groups[col].forEach((task, idx) => {
      result.push({ ...task, status: col, position: idx });
    });
  }
  return result;
};

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, saving, error, simulateError } = useSelector(
    (state: RootState) => state.board
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<ColumnStatus>("Backlog");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [draftTasks, setDraftTasks] = useState<Task[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  useEffect(() => {
    dispatch(fetchBoard());
  }, [dispatch]);

  const displayedTasks = draftTasks ?? tasks;

  const uniqueAssignees = useMemo(() => {
    const set = new Set<string>();
    for (const task of tasks) {
      const trimmed = task.assignee.trim();
      if (trimmed) set.add(trimmed);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const hasActiveFilters =
    searchText.trim() !== "" ||
    priorityFilter !== "all" ||
    assigneeFilter !== "all";

  const filteredTasks = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return displayedTasks.filter((task) => {
      const matchesTitle =
        !query || task.title.toLowerCase().includes(query);
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;
      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "__unassigned__"
          ? task.assignee.trim() === ""
          : task.assignee.trim() === assigneeFilter);

      return matchesTitle && matchesPriority && matchesAssignee;
    });
  }, [displayedTasks, searchText, priorityFilter, assigneeFilter]);

  const groupedTasks = useMemo(
    () => groupAndSortTasks(filteredTasks),
    [filteredTasks]
  );

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const openCreateModal = (status: ColumnStatus = "Backlog") => {
    setEditingTask(null);
    setDefaultStatus(status);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setDefaultStatus(task.status as ColumnStatus);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (payload: TaskPayload) => {
    setIsModalOpen(false);
    if (editingTask) {
      if (editingTask.id.startsWith("temp-")) return;
      dispatch(updateTask({ id: editingTask.id, updates: payload }));
    } else {
      dispatch(createTask(payload));
    }
  };

  const handleDrawerSave = async (
    id: string,
    updates: Partial<TaskPayload>
  ) => {
    setSelectedTaskId(null);
    if (id.startsWith("temp-")) return;
    dispatch(updateTask({ id, updates }));
  };

  const handleDeleteTask = async (id: string) => {
    if (selectedTaskId === id) {
      setSelectedTaskId(null);
    }
    if (id.startsWith("temp-")) return;
    dispatch(deleteTask(id));
  };

  const handleClearFilters = () => {
    setSearchText("");
    setPriorityFilter("all");
    setAssigneeFilter("all");
  };

  const findContainer = (
    id: string,
    groups: Record<ColumnStatus, Task[]>
  ): ColumnStatus | null => {
    if (COLUMN_ORDER.includes(id as ColumnStatus)) {
      return id as ColumnStatus;
    }
    for (const col of COLUMN_ORDER) {
      if (groups[col].some((task) => task.id === id)) {
        return col;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = String(event.active.id);
    const found = tasks.find((t) => t.id === taskId) || null;
    setActiveTask(found);
    setDraftTasks(tasks);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !draftTasks) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const currentGroups = groupAndSortTasks(draftTasks);
    const activeContainer = findContainer(activeId, currentGroups);
    const overContainer = findContainer(overId, currentGroups);

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const columnItems = currentGroups[activeContainer];
      const oldIndex = columnItems.findIndex((t) => t.id === activeId);
      const newIndex = columnItems.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        currentGroups[activeContainer] = arrayMove(
          columnItems,
          oldIndex,
          newIndex
        );
        setDraftTasks(flattenGroups(currentGroups));
      }
      return;
    }

    const activeItems = [...currentGroups[activeContainer]];
    const overItems = [...currentGroups[overContainer]];

    const activeIndex = activeItems.findIndex((t) => t.id === activeId);
    if (activeIndex === -1) return;

    const [movedTask] = activeItems.splice(activeIndex, 1);

    const overIndex = overItems.findIndex((t) => t.id === overId);
    const insertIndex = overIndex >= 0 ? overIndex : overItems.length;

    overItems.splice(insertIndex, 0, {
      ...movedTask,
      status: overContainer,
    });

    currentGroups[activeContainer] = activeItems;
    currentGroups[overContainer] = overItems;

    setDraftTasks(flattenGroups(currentGroups));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);
    const finalSnapshot = draftTasks ?? tasks;

    setActiveTask(null);
    setDraftTasks(null);

    if (!over || activeId.startsWith("temp-")) {
      return;
    }

    const originalTask = tasks.find((t) => t.id === activeId);
    const updatedTask = finalSnapshot.find((t) => t.id === activeId);

    if (!originalTask || !updatedTask) {
      return;
    }

    if (
      originalTask.status === updatedTask.status &&
      originalTask.position === updatedTask.position
    ) {
      return;
    }

    dispatch(
      moveTask({
        id: updatedTask.id,
        status: updatedTask.status as ColumnStatus,
        position: updatedTask.position,
      })
    );
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setDraftTasks(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        totalTasks={tasks.length}
        loading={loading}
        simulateError={simulateError}
        onToggleSimulateError={() => dispatch(toggleSimulateError())}
        onRefresh={() => dispatch(fetchBoard())}
        onCreateClick={() => openCreateModal("Backlog")}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => dispatch(clearBoardError())}
              className="rounded-md p-1 hover:bg-rose-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <BoardFilters
          searchText={searchText}
          priorityFilter={priorityFilter}
          assigneeFilter={assigneeFilter}
          assignees={uniqueAssignees}
          filteredCount={filteredTasks.length}
          totalCount={tasks.length}
          onSearchChange={setSearchText}
          onPriorityChange={setPriorityFilter}
          onAssigneeChange={setAssigneeFilter}
          onClearAll={handleClearFilters}
        />

        {loading && tasks.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {COLUMN_ORDER.map((col) => (
              <div
                key={col}
                className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {COLUMN_ORDER.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={groupedTasks[status]}
                  isFiltered={hasActiveFilters}
                  onAddTask={openCreateModal}
                  onSelectTask={(task) => setSelectedTaskId(task.id)}
                  onEditTask={openEditModal}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <TaskFormModal
        isOpen={isModalOpen}
        initialTask={editingTask}
        defaultStatus={defaultStatus}
        saving={saving}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <TaskDetailDrawer
        task={selectedTask}
        saving={saving}
        onClose={() => setSelectedTaskId(null)}
        onSave={handleDrawerSave}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
