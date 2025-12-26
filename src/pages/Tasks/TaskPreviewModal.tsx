import React from "react";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { formatDateShort, isOverdue } from "../../utils/date";
import type { Task } from "../../features/tasks/types";
import { ArrowRight, Timer } from "lucide-react";

function prTone(
  p: Task["priority"]
): import("../../components/ui/Chip").ChipTone {
  return p === "high" ? "red" : p === "medium" ? "amber" : "neutral";
}

function prLabel(p: Task["priority"]) {
  return p === "high" ? "High" : p === "medium" ? "Medium" : "Low";
}

function statusTone(
  s: Task["status"]
): import("../../components/ui/Chip").ChipTone {
  return s === "completed" ? "green" : "neutral";
}

/**
 * Page component: TaskPreviewModal.
 */
export function TaskPreviewModal({
  open,
  onClose,
  task,
  onOpenTasks,
  onStartFocus, 
}: {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onOpenTasks: (taskId: string) => void;
  onStartFocus?: (taskId: string) => void;
}) {
  if (!task) return null;

  const overdue = task.status === "active" && isOverdue(task.dueAt ?? null);
  const canStart = task.status === "active";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base md:text-lg font-semibold truncate">
              {task.title}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Chip tone={prTone(task.priority)}>{prLabel(task.priority)}</Chip>
              <Chip tone={statusTone(task.status)}>
                {task.status === "completed" ? "Completed" : "Active"}
              </Chip>
              {task.tag ? <Chip tone="neutral">{task.tag}</Chip> : null}

              <span className="text-xs text-neutral-500">
                Due:{" "}
                <span
                  className={
                    overdue ? "text-red-700 font-medium" : "text-neutral-700"
                  }
                >
                  {formatDateShort(task.dueAt ?? null)}
                  {overdue ? " (overdue)" : ""}
                </span>
              </span>
            </div>
          </div>
        </div>
      }
      className="w-full md:max-w-3xl"
    >
      <div className="space-y-4">
        {/* Description */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-xs font-medium text-neutral-500 mb-2">
            Description
          </div>
          <div className="text-sm text-neutral-700 whitespace-pre-wrap">
            {task.description?.trim() ? (
              task.description
            ) : (
              <span className="text-neutral-500">No description.</span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="text-xs font-medium text-neutral-500">Priority</div>
            <div className="mt-2 text-sm font-medium text-neutral-800">
              {prLabel(task.priority)}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="text-xs font-medium text-neutral-500">Status</div>
            <div className="mt-2 text-sm font-medium text-neutral-800">
              {task.status === "completed" ? "Completed" : "Active"}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="text-xs font-medium text-neutral-500">Tag</div>
            <div className="mt-2 text-sm font-medium text-neutral-800">
              {task.tag || "—"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="text-xs font-medium text-neutral-500">Due date</div>
            <div className="mt-2 text-sm font-medium">
              <span className={overdue ? "text-red-700" : "text-neutral-800"}>
                {formatDateShort(task.dueAt ?? null)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="text-xs font-medium text-neutral-500">Created</div>
            <div className="mt-2 text-sm font-medium text-neutral-800">
              {task.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="text-xs font-medium text-neutral-500">Updated</div>
            <div className="mt-2 text-sm font-medium text-neutral-800">
              {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "—"}
            </div>
          </div>
        </div>

        {/* Footer actions (mobile stacked) */}
        <div className="pt-2">
          <div className="text-xs text-neutral-500">
            Editing is available on the <b>Tasks</b> page.
          </div>

          <div className="mt-3 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
            <Button
              className="w-full sm:w-auto"
              variant="ghost"
              onClick={onClose}
            >
              Close
            </Button>

            <Button
              className="w-full sm:w-auto"
              variant="outline"
              onClick={() => onOpenTasks(task.id)}
            >
              Open in Tasks <ArrowRight className="h-4 w-4" />
            </Button>

            {}
            {onStartFocus ? (
              <Button
                className="w-full sm:w-auto"
                variant="primary"
                onClick={() => onStartFocus(task.id)}
                disabled={!canStart}
              >
                <Timer className="h-4 w-4" />
                Start Focus
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  );
}