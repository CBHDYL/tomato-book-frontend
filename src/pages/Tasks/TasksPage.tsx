import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Play,
  CheckSquare,
  Square,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Chip } from "../../components/ui/Chip";
import { Button } from "../../components/ui/Button";
import { formatDateShort, isOverdue } from "../../utils/date";
import type {
  Status,
  Task,
  TaskCreate,
  TaskQuery,
} from "../../features/tasks/types";
import {
  useBulkDeleteTasks,
  useBulkUpdateStatus,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "../../features/tasks/taskQueries";
import { TaskEditorModal } from "./TaskEditorModal";
import { useToast } from "../../components/common/ToastHost";
import { usePomodoro } from "../../features/pomodoro/pomodoroStore";

function useQueryString() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function useIsMobile() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)"); // < sm
    const onChange = () => setM(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return m;
}

function scorePr(p: Task["priority"]) {
  return p === "high" ? 3 : p === "medium" ? 2 : 1;
}

function applyFilter(tasks: Task[], q: TaskQuery) {
  let out = [...tasks];

  if (q.q?.trim()) {
    const s = q.q.toLowerCase();
    out = out.filter((t) =>
      (t.title + " " + (t.description ?? "") + " " + (t.tag ?? ""))
        .toLowerCase()
        .includes(s)
    );
  }

  if (q.priority && q.priority !== "all") {
    out = out.filter((t) => t.priority === q.priority);
  }

  if (q.status && q.status !== "all") {
    out = out.filter((t) => t.status === q.status);
  }

  if (q.due && q.due !== "all") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endToday = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const endWeek = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

    out = out.filter((t) => {
      const due = t.dueAt ? new Date(t.dueAt).getTime() : null;
      if (q.due === "none") return !due;
      if (!due) return false;
      if (q.due === "overdue") return due < start.getTime();
      if (q.due === "today")
        return due >= start.getTime() && due < endToday.getTime();
      if (q.due === "week")
        return due >= start.getTime() && due < endWeek.getTime();
      return true;
    });
  }

  switch (q.sort) {
    case "dueAsc":
      out.sort((a, b) => (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999"));
      break;
    case "dueDesc":
      out.sort((a, b) => (b.dueAt ?? "0000").localeCompare(a.dueAt ?? "0000"));
      break;
    case "priorityDesc":
      out.sort((a, b) => scorePr(b.priority) - scorePr(a.priority));
      break;
    case "createdDesc":
    default:
      out.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      break;
  }

  return out;
}

function TaskRow({
  task,
  expanded,
  bulkMode,
  selected,
  onToggleSelected,
  onToggleExpand,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartFocus,
  onLongPress,
  isMobile,
  onOpenDetail,
}: {
  task: Task;
  expanded: boolean;

  bulkMode: boolean;
  selected: boolean;
  onToggleSelected: () => void;

  onToggleExpand: () => void;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartFocus: () => void;
  onLongPress: () => void;

  isMobile: boolean;
  onOpenDetail: () => void;
}) {
  const overdue = task.status === "active" && isOverdue(task.dueAt ?? null);

  const prTone: import("../../components/ui/Chip").ChipTone =
    task.priority === "high"
      ? "red"
      : task.priority === "medium"
      ? "amber"
      : "neutral";

  const pressRef = React.useRef<number | null>(null);

  function startPress() {
    if (bulkMode) return;
    if (pressRef.current) window.clearTimeout(pressRef.current);
    pressRef.current = window.setTimeout(() => {
      pressRef.current = null;
      onLongPress();
    }, 450);
  }

  function cancelPress() {
    if (!pressRef.current) return;
    window.clearTimeout(pressRef.current);
    pressRef.current = null;
  }

  const disableFocusEdit = bulkMode;

  // ✅ Mobile: reduce density, no expand area, tap row = open detail
  if (isMobile) {
    return (
      <div
        className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
      >
        <button
          className="w-full text-left px-4 py-4 flex items-center gap-3"
          onClick={onOpenDetail}
        >
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-neutral-900 truncate">
              {task.title}
            </div>

            <div className="mt-1 text-xs text-neutral-500 flex items-center gap-2 min-w-0">
              <span className={overdue ? "text-red-600 font-medium" : ""}>
                {formatDateShort(task.dueAt ?? null)}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="truncate">
                {task.priority}
                {task.status === "completed" ? " • done" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {bulkMode ? (
              <button
                className="h-9 w-9 rounded-xl border border-neutral-300 bg-white flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelected();
                }}
                aria-label={selected ? "Unselect" : "Select"}
                title={selected ? "Unselect" : "Select"}
              >
                {selected ? (
                  <CheckSquare className="h-5 w-5 text-neutral-800" />
                ) : (
                  <Square className="h-5 w-5 text-neutral-500" />
                )}
              </button>
            ) : null}

            <button
              className={[
                "h-9 w-9 rounded-xl border border-neutral-300 bg-white flex items-center justify-center transition",
                disableFocusEdit
                  ? "opacity-40 pointer-events-none"
                  : "hover:bg-neutral-50",
              ].join(" ")}
              onClick={(e) => {
                e.stopPropagation();
                onStartFocus();
              }}
              aria-label="Start focus"
              title={disableFocusEdit ? "Disabled in bulk mode" : "Start focus"}
            >
              <Play className="h-4 w-4 text-neutral-700" />
            </button>

            <button
              className="h-9 w-9 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center transition"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              aria-label="Toggle complete"
              title="Toggle complete"
            >
              {task.status === "completed" ? (
                <CheckSquare className="h-4 w-4 text-neutral-700" />
              ) : (
                <Square className="h-4 w-4 text-neutral-500" />
              )}
            </button>

            <button
              className="h-9 w-9 rounded-xl border border-neutral-300 bg-white hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Delete"
              title={bulkMode ? "Delete selected" : "Delete"}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </button>
      </div>
    );
  }

  // ✅ Desktop: keep your original rich expandable row
  return (
    <div
      className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
    >
      <div className="px-4 py-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {bulkMode ? (
            <button
              className="mt-0.5 h-9 w-9 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center transition"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelected();
              }}
              aria-label={selected ? "Unselect" : "Select"}
              title={selected ? "Unselect" : "Select"}
            >
              {selected ? (
                <CheckSquare className="h-5 w-5 text-neutral-800" />
              ) : (
                <Square className="h-5 w-5 text-neutral-500" />
              )}
            </button>
          ) : null}

          <button
            className="flex items-start gap-3 min-w-0 text-left"
            onClick={onToggleExpand}
          >
            <div className="mt-1 text-neutral-500">
              {expanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="font-semibold text-neutral-900 truncate">
                {task.title}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <Chip tone={prTone}>{task.priority}</Chip>
                {task.status === "completed" ? (
                  <Chip tone="green">completed</Chip>
                ) : (
                  <Chip tone="neutral">active</Chip>
                )}
                <span className="text-neutral-300">•</span>
                <span
                  className={
                    overdue ? "text-red-600 font-medium" : "text-neutral-500"
                  }
                >
                  {formatDateShort(task.dueAt ?? null)}
                  {overdue ? " (overdue)" : ""}
                </span>
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className={[
              "px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition",
              task.status === "completed"
                ? "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50",
            ].join(" ")}
            aria-label={
              bulkMode
                ? task.status === "completed"
                  ? "Mark selected active"
                  : "Mark selected complete"
                : task.status === "completed"
                ? "Mark active"
                : "Mark complete"
            }
            title={
              bulkMode
                ? task.status === "completed"
                  ? "Mark selected active"
                  : "Mark selected complete"
                : task.status === "completed"
                ? "Mark active"
                : "Mark complete"
            }
          >
            {bulkMode
              ? task.status === "completed"
                ? "Mark selected active"
                : "Mark selected complete"
              : task.status === "completed"
              ? "Mark active"
              : "Mark complete"}
          </button>

          <div className="flex items-center gap-1">
            <button
              className={[
                "h-9 w-9 rounded-xl border border-neutral-300 bg-white flex items-center justify-center transition",
                disableFocusEdit
                  ? "opacity-40 pointer-events-none"
                  : "hover:bg-neutral-50",
              ].join(" ")}
              onClick={(e) => {
                e.stopPropagation();
                onStartFocus();
              }}
              aria-label="Start focus"
              title={disableFocusEdit ? "Disabled in bulk mode" : "Start focus"}
            >
              <Play className="h-4 w-4 text-neutral-700" />
            </button>

            <button
              className={[
                "h-9 w-9 rounded-xl border border-neutral-300 bg-white flex items-center justify-center transition",
                disableFocusEdit
                  ? "opacity-40 pointer-events-none"
                  : "hover:bg-neutral-50",
              ].join(" ")}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label="Edit"
              title={disableFocusEdit ? "Disabled in bulk mode" : "Edit"}
            >
              <Pencil className="h-4 w-4 text-neutral-700" />
            </button>

            <button
              className="h-9 w-9 rounded-xl border border-neutral-300 bg-white hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Delete"
              title={bulkMode ? "Delete selected" : "Delete"}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={[
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div
            className={[
              "px-4 pb-4",
              "transition-all duration-300 ease-in-out",
              expanded
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-1",
            ].join(" ")}
          >
            <div className="border-t border-neutral-200 pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="rounded-2xl border-0 bg-white p-4">
                    <div className="text-xs font-medium text-neutral-500 mb-2">
                      Details
                    </div>
                    <div className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {task.description?.trim() ? (
                        task.description
                      ) : (
                        <span className="text-neutral-500">
                          No description.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <div className="text-xs font-medium text-neutral-500 mb-2">
                      Dates
                    </div>

                    <div className="text-sm">
                      <div className="text-neutral-500">Due</div>
                      <div
                        className={
                          overdue
                            ? "text-red-700 font-medium"
                            : "text-neutral-800 font-medium"
                        }
                      >
                        {formatDateShort(task.dueAt ?? null)}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-500">
                      <div className="rounded-xl bg-neutral-50 p-2">
                        <div className="font-medium text-neutral-600">
                          Created
                        </div>
                        <div className="mt-1">
                          {task.createdAt
                            ? new Date(task.createdAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>
                      <div className="rounded-xl bg-neutral-50 p-2">
                        <div className="font-medium text-neutral-600">
                          Updated
                        </div>
                        <div className="mt-1">
                          {task.updatedAt
                            ? new Date(task.updatedAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Page component: TasksPage.
 */
export function TasksPage() {
  const toast = useToast();
  const nav = useNavigate();
  const qs = useQueryString();
  const openId = qs.get("open");
  const isMobile = useIsMobile();

  const { data: tasks = [], isLoading } = useTasks();
  const createMut = useCreateTask();
  const updateMut = useUpdateTask();
  const deleteMut = useDeleteTask();
  const bulkDeleteMut = useBulkDeleteTasks();
  const bulkStatusMut = useBulkUpdateStatus();
  const pom = usePomodoro();

  const [filters, setFilters] = React.useState<TaskQuery>({
    q: "",
    priority: "all",
    status: "all",
    due: "all",
    sort: "createdDesc",
  });

  const filtered = React.useMemo(
    () => applyFilter(tasks, filters),
    [tasks, filters]
  );

  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);

  React.useEffect(() => {
    setPageIndex(0);
  }, [filters.q, filters.priority, filters.status, filters.due, filters.sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);

  React.useEffect(() => {
    if (safePageIndex !== pageIndex) setPageIndex(safePageIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const pageItems = React.useMemo(() => {
    const start = safePageIndex * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePageIndex, pageSize]);

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  React.useEffect(() => {
    if (!openId) return;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(openId);
      return next;
    });
  }, [openId]);

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorInitial, setEditorInitial] = React.useState<Task | null>(null);

  function openCreate() {
    setEditorInitial(null);
    setEditorOpen(true);
  }

  const [bulkMode, setBulkMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function exitBulk() {
    setBulkMode(false);
    clearSelection();
  }

  const selectedCount = selectedIds.size;
  const bulkBusy = bulkDeleteMut.isPending || bulkStatusMut.isPending;

  async function doBulkDelete() {
    if (selectedCount === 0) {
      toast.push("No tasks selected");
      return;
    }
    const yes = window.confirm(`Delete ${selectedCount} tasks?`);
    if (!yes) return;

    try {
      await bulkDeleteMut.mutateAsync(Array.from(selectedIds));
      toast.push(`Deleted ${selectedCount} tasks`);
      clearSelection();
    } catch (e) {
      console.error(e);
      toast.push("Bulk delete failed");
    }
  }

  async function doBulkStatus(status: Status) {
    if (selectedCount === 0) {
      toast.push("No tasks selected");
      return;
    }
    try {
      await bulkStatusMut.mutateAsync({ ids: Array.from(selectedIds), status });
      toast.push(`Updated ${selectedCount} tasks`);
      clearSelection();
    } catch (e) {
      console.error(e);
      toast.push("Bulk update failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-5">
        <div className="font-semibold mb-3">Filters & Sort</div>

        <div className="relative mb-3">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Search className="h-4 w-4" />
          </div>
          <Input
            className="pl-10 border-neutral-200 bg-white focus:border-red-300"
            placeholder="Search tasks…"
            value={filters.q ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select
            value={filters.priority ?? "all"}
            onChange={(v) =>
              setFilters((p) => ({
                ...p,
                priority: v as "all" | "low" | "medium" | "high",
              }))
            }
            options={[
              { value: "all", label: "All Priorities" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
          />

          <Select
            value={filters.status ?? "all"}
            onChange={(v) =>
              setFilters((p) => ({
                ...p,
                status: v as "all" | "active" | "completed",
              }))
            }
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
            ]}
          />

          <Select
            value={filters.due ?? "all"}
            onChange={(v) =>
              setFilters((p) => ({
                ...p,
                due: v as "all" | "overdue" | "today" | "week" | "none",
              }))
            }
            options={[
              { value: "all", label: "All Due" },
              { value: "overdue", label: "Overdue" },
              { value: "today", label: "Due Today" },
              { value: "week", label: "Due This Week" },
              { value: "none", label: "No Due Date" },
            ]}
          />

          <Select
            value={filters.sort ?? "createdDesc"}
            onChange={(v) =>
              setFilters((p) => ({
                ...p,
                sort: v as
                  | "createdDesc"
                  | "dueAsc"
                  | "dueDesc"
                  | "priorityDesc",
              }))
            }
            options={[
              { value: "createdDesc", label: "Sort: Newest" },
              { value: "dueAsc", label: "Sort: Due ↑" },
              { value: "dueDesc", label: "Sort: Due ↓" },
              { value: "priorityDesc", label: "Sort: Priority" },
            ]}
          />
        </div>
      </div>

      <Card>
        <CardHeader
          title="My Tasks"
          subtitle={
            bulkMode
              ? `Bulk mode • ${selectedCount} selected`
              : "Manage and organize your tasks"
          }
          right={
            <div className="flex items-center gap-2">
              {!bulkMode ? (
                <Button onClick={() => setBulkMode(true)}>
                  <CheckSquare className="h-4 w-4 mr-1" /> Bulk
                </Button>
              ) : (
                <Button onClick={exitBulk}>
                  <X className="h-4 w-4 mr-1" /> Done
                </Button>
              )}

              <Button variant="primary" onClick={openCreate}>
                <Plus className="h-4 w-4" /> New Task
              </Button>
            </div>
          }
        />
        <CardBody>
          {bulkMode ? (
            <div className="mb-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-neutral-700">
                Selected: <span className="font-semibold">{selectedCount}</span>
                <span className="text-neutral-400"> • </span>
                <span className="text-neutral-600">
                  Use any task&apos;s{" "}
                  <span className="font-medium">Mark complete</span> /{" "}
                  <span className="font-medium">Trash</span> to apply to
                  selected
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => doBulkStatus("completed")}
                  disabled={bulkBusy || selectedCount === 0}
                >
                  Mark complete
                </Button>

                <Button
                  onClick={() => doBulkStatus("active")}
                  disabled={bulkBusy || selectedCount === 0}
                >
                  Mark active
                </Button>

                <Button
                  onClick={clearSelection}
                  disabled={bulkBusy || selectedCount === 0}
                >
                  Clear
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-2 space-y-2">
            {isLoading ? (
              <div className="text-sm text-neutral-500">Loading…</div>
            ) : pageItems.length === 0 ? (
              <div className="text-sm text-neutral-500">No tasks found.</div>
            ) : (
              pageItems.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  expanded={expandedIds.has(t.id)}
                  bulkMode={bulkMode}
                  selected={selectedIds.has(t.id)}
                  onToggleSelected={() => toggleSelected(t.id)}
                  onToggleExpand={() => {
                    toggleExpand(t.id);
                    const sp = new URLSearchParams(window.location.search);
                    sp.set("open", t.id);
                    nav({ search: sp.toString() }, { replace: true });
                  }}
                  onToggleComplete={async () => {
                    if (bulkMode) {
                      await doBulkStatus(
                        t.status === "completed" ? "active" : "completed"
                      );
                      return;
                    }
                    try {
                      await updateMut.mutateAsync({
                        id: t.id,
                        patch: {
                          status:
                            t.status === "completed" ? "active" : "completed",
                        },
                      });
                      toast.push("Task updated");
                    } catch (err) {
                      console.error(err);
                      toast.push("Update failed");
                    }
                  }}
                  onEdit={() => {
                    setEditorInitial(t);
                    setEditorOpen(true);
                  }}
                  onDelete={async () => {
                    if (bulkMode) {
                      await doBulkDelete();
                      return;
                    }
                    const yes = window.confirm("Delete this task?");
                    if (!yes) return;
                    try {
                      await deleteMut.mutateAsync(t.id);
                      toast.push("Task deleted");
                    } catch (err) {
                      console.error(err);
                      toast.push("Delete failed");
                    }
                  }}
                  onStartFocus={() => {
                    pom.setTask(t.id);
                    nav("/pomodoro");
                    toast.push("Selected task for focus");
                  }}
                  onLongPress={() => {
                    if (bulkMode) return;
                    setBulkMode(true);
                    setSelectedIds(new Set([t.id]));
                    toast.push("Bulk mode");
                  }}
                  isMobile={isMobile}
                  onOpenDetail={() => {
                    setEditorInitial(t);
                    setEditorOpen(true);
                  }}
                />
              ))
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-neutral-600">
              Page{" "}
              <span className="font-medium text-neutral-900">
                {safePageIndex + 1}
              </span>{" "}
              / {totalPages} • {filtered.length} item(s)
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onChange={(v) => {
                  const n = Number(v);
                  setPageSize(n);
                  setPageIndex(0);
                }}
                options={[
                  { value: "5", label: "5 / page" },
                  { value: "10", label: "10 / page" },
                  { value: "20", label: "20 / page" },
                  { value: "50", label: "50 / page" },
                ]}
              />

              <button
                className="h-9 w-9 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center disabled:opacity-40"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={safePageIndex === 0}
                title="Prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                className="h-9 w-9 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center disabled:opacity-40"
                onClick={() =>
                  setPageIndex((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={safePageIndex >= totalPages - 1}
                title="Next"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      <TaskEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initial={editorInitial}
        onSubmit={async (
          payload: TaskCreate | { id: string; patch: Partial<Task> }
        ) => {
          try {
            if ("id" in payload) {
              await updateMut.mutateAsync({
                id: payload.id,
                patch: payload.patch,
              });
              toast.push("Task saved");
            } else {
              await createMut.mutateAsync(payload);
              toast.push("Task created");
            }
            setEditorOpen(false);
          } catch (err) {
            console.error(err);
            toast.push("Save failed");
          }
        }}
      />
    </div>
  );
}