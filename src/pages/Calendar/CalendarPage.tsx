import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";

import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { Select } from "../../components/ui/Select";
import { useCreateTask, useTasks } from "../../features/tasks/taskQueries";
import type { Task, TaskCreate } from "../../features/tasks/types";
import { TaskPreviewModal } from "../Tasks/TaskPreviewModal";
import { TaskEditorModal } from "../Tasks/TaskEditorModal";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";

function prTone(
  p: Task["priority"]
): import("../../components/ui/Chip").ChipTone {
  return p === "high" ? "red" : p === "medium" ? "amber" : "neutral";
}

function taskToEvent(t: Task) {
  if (!t.dueAt) return null;

  const cls =
    t.priority === "high"
      ? "ev-high"
      : t.priority === "medium"
      ? "ev-med"
      : "ev-low";

  return {
    id: t.id,
    title: t.title,
    start: t.dueAt,
    allDay: true,
    classNames: [cls, t.status === "completed" ? "ev-done" : "ev-active"],
    extendedProps: { task: t },
  };
}

/**
 * Page component: CalendarPage.
 */
export function CalendarPage() {
  const nav = useNavigate();
  const calendarRef = React.useRef<FullCalendar | null>(null);

  const { data: tasks = [], isLoading } = useTasks();
  const createMut = useCreateTask();

  const [view, setView] = React.useState<"dayGridMonth" | "timeGridWeek">(
    "dayGridMonth"
  );
  const [showCompleted, setShowCompleted] = React.useState<"hide" | "show">(
    "hide"
  );
  const [priority, setPriority] = React.useState<
    "all" | "low" | "medium" | "high"
  >("all");

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewTask, setPreviewTask] = React.useState<Task | null>(null);

  // ✅ Create modal state (minimal, doesn’t disturb existing structure)
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDraft, setCreateDraft] = React.useState<any>(null);

  const filteredTasks = React.useMemo(() => {
    let out = tasks;

    if (showCompleted === "hide")
      out = out.filter((t) => t.status !== "completed");
    if (priority !== "all") out = out.filter((t) => t.priority === priority);

    return out;
  }, [tasks, showCompleted, priority]);

  const events = React.useMemo(() => {
    return filteredTasks.map(taskToEvent).filter(Boolean) as any[];
  }, [filteredTasks]);

  function api() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (calendarRef.current as any)?.getApi?.();
  }

  function openCreateAt(info: DateClickArg) {
    // FullCalendar gives a Date (includes time in week view)
    const dueISO = info.date ? new Date(info.date).toISOString() : null;

    // TaskEditorModal only supports "initial?: Task | null".
    // We pass a lightweight draft without id so it stays "Create" mode.
    setCreateDraft({
      title: "",
      description: "",
      tag: "",
      priority: "medium",
      status: "active",
      dueAt: dueISO,
    } as any);

    setCreateOpen(true);
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <CardHeader
          title={
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-red-100 bg-red-50 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-red-500" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-semibold text-neutral-900">
                  Calendar
                </div>
                <div className="text-xs text-neutral-500">
                  Click a task to preview. Click a time slot to create.
                </div>
              </div>
            </div>
          }
          right={
            <div className="flex items-center rounded-full border border-neutral-200 bg-white px-2 py-1 shadow-sm">
              <button
                onClick={() => api()?.prev()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
              >
                ‹
              </button>

              <button
                onClick={() => api()?.today()}
                className="mx-1 rounded-full bg-red-50 px-5 py-1.5 text-sm font-semibold text-red-700 border border-red-100 hover:bg-red-100"
              >
                Today
              </button>

              <button
                onClick={() => api()?.next()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
              >
                ›
              </button>
            </div>
          }
        />

        <CardBody>
          {/* Controls */}
          <div className="mb-4 rounded-3xl border border-neutral-200 bg-neutral-50/70 p-3">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-600">
                    View
                  </span>
                  <Select
                    value={view}
                    onChange={(v) => {
                      const vv = v as "dayGridMonth" | "timeGridWeek";
                      setView(vv);
                      api()?.changeView(vv);
                    }}
                    options={[
                      { value: "dayGridMonth", label: "Month" },
                      { value: "timeGridWeek", label: "Week" },
                    ]}
                  />
                </div>

                <div className="h-6 w-px bg-neutral-200 hidden lg:block" />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-600">
                    Priority
                  </span>
                  <Select
                    value={priority}
                    onChange={(v) => setPriority(v as any)}
                    options={[
                      { value: "all", label: "All" },
                      { value: "high", label: "High" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-600">
                    Completed
                  </span>
                  <Select
                    value={showCompleted}
                    onChange={(v) => setShowCompleted(v as any)}
                    options={[
                      { value: "hide", label: "Hide" },
                      { value: "show", label: "Show" },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                <span className="hidden lg:inline">Legend</span>
                <Chip tone={prTone("high")}>High</Chip>
                <Chip tone={prTone("medium")}>Medium</Chip>
                <Chip tone={prTone("low")}>Low</Chip>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm">
            <FullCalendar
              ref={calendarRef as any}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view}
              headerToolbar={false}
              height="auto"
              events={events}
              dayMaxEvents={3}
              editable={false}
              selectable={true}
              dateClick={(info: DateClickArg) => {
                // ✅ click empty date/time slot => create task
                openCreateAt(info);
              }}
              eventClick={(info: EventClickArg) => {
                const t = info.event.extendedProps["task"] as Task | undefined;
                if (!t) return;
                setPreviewTask(t);
                setPreviewOpen(true);
              }}
              eventDidMount={(arg) => {
                arg.el.style.borderRadius = "14px";
                arg.el.style.cursor = "pointer";
                arg.el.style.padding = "2px 8px";
                arg.el.style.fontSize = "12px";
                arg.el.style.lineHeight = "16px";
                arg.el.style.boxShadow = "0 1px 0 rgba(0,0,0,0.06)";
              }}
            />
          </div>

          {isLoading ? (
            <div className="mt-3 text-sm text-neutral-500">Loading…</div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">Tip:</span>
              <span>Click a task to preview.</span>
              <span className="text-neutral-300">•</span>
              <span>Click a time slot to create a task.</span>
              <span className="text-neutral-300">•</span>
              <span>Use “Open Tasks” to edit.</span>
            </div>
          )}

          {/* FullCalendar CSS polish */}
          <style>{`
            .fc { font-family: inherit; }
            .fc .fc-scrollgrid { border: none; }
            .fc .fc-scrollgrid-section > td,
            .fc .fc-scrollgrid-section > th { border-color: rgb(229 229 229); }

            .fc .fc-col-header-cell-cushion {
              padding: 10px 0;
              font-size: 12px;
              font-weight: 600;
              color: rgb(82 82 82);
              letter-spacing: 0.2px;
            }
            .fc .fc-daygrid-day-number {
              padding: 10px 10px 0 10px;
              font-size: 12px;
              color: rgb(82 82 82);
            }

            .fc .fc-daygrid-day-frame {
              border-radius: 16px;
              transition: background 120ms ease, box-shadow 120ms ease;
            }
            .fc .fc-daygrid-day:hover .fc-daygrid-day-frame {
              background: rgb(250 250 250);
              box-shadow: inset 0 0 0 1px rgb(229 229 229);
            }

            .fc .fc-day-today { background: transparent !important; }
            .fc .fc-day-today .fc-daygrid-day-frame {
              background: rgb(254 242 242); /* red-50 */
              box-shadow: inset 0 0 0 1px rgb(254 202 202); /* red-200 */
            }

            .fc .fc-daygrid-more-link { font-size: 12px; color: rgb(82 82 82); }
            .fc .fc-daygrid-event-harness { margin: 4px 6px; }

            .fc-event {
              border: 1px solid rgba(0,0,0,0.06);
              transition: transform 120ms ease, filter 120ms ease;
            }
            .fc-event:hover { transform: translateY(-1px); filter: brightness(0.99); }

            /* Tomato-ish priority pills */
            .ev-high { background: rgb(254 202 202) !important; color: rgb(153 27 27) !important; }
            .ev-med  { background: rgb(253 230 138) !important; color: rgb(120 53 15) !important; }
            .ev-low  { background: rgb(229 231 235) !important; color: rgb(31 41 55) !important; }

            .ev-done { opacity: 0.55; text-decoration: line-through; }

            .fc .fc-timegrid-slot-label,
            .fc .fc-timegrid-axis-cushion { font-size: 12px; color: rgb(82 82 82); }
            .fc .fc-timegrid-event { border-radius: 14px; }
          `}</style>
        </CardBody>
      </Card>

      <TaskPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        task={previewTask}
        onOpenTasks={(id) => {
          setPreviewOpen(false);
          nav(`/tasks?open=${id}`);
        }}
        onStartFocus={(id) => {
          setPreviewOpen(false);
          nav(`/pomodoro?task=${id}`);
        }}
      />

      {/* ✅ Create Task Modal (from calendar click) */}
      <TaskEditorModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initial={createDraft}
        onSubmit={(payload) => {
          // TaskEditorModal can submit either create or edit union
          if ((payload as any)?.id) return;
          createMut.mutate(payload as TaskCreate);
        }}
      />
    </div>
  );
}