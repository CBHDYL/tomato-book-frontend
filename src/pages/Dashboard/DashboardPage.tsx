import React from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { Button } from "../../components/ui/Button";
import { isOverdue } from "../../utils/date";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../../components/ui/StatCard";
import {
  AlertTriangle,
  CalendarClock,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Flame,
  CalendarDays,
  Timer,
  Zap,
} from "lucide-react";
import { TaskPreviewModal } from "../Tasks/TaskPreviewModal";
import { useTasks } from "../../features/tasks/taskQueries";
import { usePomodoro } from "../../features/pomodoro/pomodoroStore";

import { useRecommendations } from "../../features/insights/insightsQueries";
import type { Recommendation } from "../../features/insights/insightsApi";
import { useAiMode } from "../../features/insights/aiMode";

function fmtDue(deadline: string | null) {
  if (!deadline) return "No deadline";
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return "Deadline set";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function priorityTone(p: string): import("../../components/ui/Chip").ChipTone {
  const x = (p || "").toLowerCase();
  if (x === "high") return "red";
  if (x === "medium") return "amber";
  return "neutral";
}

function reasonTone(
  reason: string
): import("../../components/ui/Chip").ChipTone {
  const r = (reason || "").toLowerCase();
  if (r.includes("overdue")) return "red";
  if (r.includes("due")) return "amber";
  return "neutral";
}

function AiPill({
  enabled,
  onToggle,
  busy,
  className,
}: {
  enabled: boolean;
  onToggle: () => void;
  busy?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={[
        "group relative inline-flex items-center gap-2 rounded-2xl px-3 py-2 border transition",
        "border-neutral-200 bg-white hover:bg-neutral-50",
        "focus:outline-none focus:ring-2 focus:ring-red-200",
        className ?? "",
      ].join(" ")}
      title={enabled ? "AI enabled" : "AI disabled"}
    >
      <span
        className={[
          "relative h-2.5 w-2.5 rounded-full",
          enabled ? "bg-red-500 animate-pulse" : "bg-neutral-300",
        ].join(" ")}
      />
      <span className="text-sm font-semibold text-neutral-900">
        AI {enabled ? "ON" : "OFF"}
      </span>

      {enabled ? (
        <span className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-500">
          <Zap className="h-3.5 w-3.5 text-red-500" />
          {busy ? "thinking…" : "ready"}
        </span>
      ) : null}

      {enabled ? (
        <span
          className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-red-200 via-amber-100 to-red-200"
          style={{ zIndex: -1 }}
        />
      ) : null}
    </button>
  );
}

function RecCard({
  rec,
  onOpenDetail,
  onStart,
}: {
  rec: Recommendation;
  onOpenDetail: () => void;
  onStart: () => void;
}) {
  return (
    <button
      onClick={onOpenDetail}
      className={[
        "w-full text-left rounded-3xl border border-neutral-200 bg-white p-4 transition",
        "shadow-sm hover:shadow-md hover:-translate-y-[1px]",
        "focus:outline-none focus:ring-2 focus:ring-red-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-semibold text-neutral-900 truncate">
            {rec.title}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {fmtDue(rec.deadline)}
          </div>
        </div>

        <Chip tone={priorityTone(rec.priority)}>
          {String(rec.priority || "priority").toUpperCase()}
        </Chip>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(rec.reasons || []).slice(0, 3).map((r, idx) => (
          <Chip key={idx} tone={reasonTone(r)}>
            {r}
          </Chip>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-neutral-700">
          <Timer className="h-4 w-4" />
          <span>
            Suggested:{" "}
            <span className="font-semibold">
              {Number(rec.suggestedPomodoros || 0)}
            </span>{" "}
            pomodoro{Number(rec.suggestedPomodoros || 0) > 1 ? "s" : ""}
          </span>
        </div>

        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onStart();
          }}
          variant="primary"
        >
          Start Focus <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <span>Click to preview</span>
        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
          View details <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

/**
 * Page component: DashboardPage.
 */
export function DashboardPage() {
  const nav = useNavigate();
  const { data: tasks = [] } = useTasks();
  const pom = usePomodoro();

  const { enabled: aiEnabled, toggle: toggleAi } = useAiMode();

  const range = "7d";
  const ai = aiEnabled ? 1 : 0;

  const {
    data: recData,
    isLoading: recLoading,
    isFetching: recFetching,
    error: recError,
  } = useRecommendations(range, ai, { enabled: aiEnabled });

  const recs = (recData?.recommendations ?? []).slice(0, 3);

  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailTask, setDetailTask] = React.useState<any | null>(null);

  const total = tasks.length;
  const active = tasks.filter((t) => t.status === "active").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const overdue = tasks.filter(
    (t) => t.status === "active" && isOverdue(t.dueAt ?? null)
  ).length;

  const highCount = tasks.filter(
    (t) => t.status === "active" && t.priority === "high"
  ).length;
  const medCount = tasks.filter(
    (t) => t.status === "active" && t.priority === "medium"
  ).length;
  const lowCount = tasks.filter(
    (t) => t.status === "active" && t.priority === "low"
  ).length;

  function openRecDetail(rec: Recommendation) {
    const t = tasks.find((x) => String(x.id) === String(rec.taskId)) ?? null;
    setDetailTask(t);
    setDetailOpen(true);
  }

  function startFocusFor(rec: Recommendation) {
    pom.switchMode("focus");
    nav(`/pomodoro?taskId=${rec.taskId}`);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <Card className="rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <CardHeader
          title={
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-red-100 bg-red-50 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-red-500" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-semibold text-neutral-900">
                  Dashboard
                </div>
                <div className="text-xs text-neutral-500">
                  Your today snapshot — tasks + quick focus plan.
                </div>
              </div>
            </div>
          }
          right={
            // ✅ Mobile: stack to avoid overflow
            <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end">
              <AiPill
                enabled={aiEnabled}
                onToggle={toggleAi}
                busy={aiEnabled && recFetching}
                className="w-full sm:w-auto justify-center"
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="primary"
                  onClick={() => nav("/pomodoro")}
                  className="w-full sm:w-auto justify-center"
                >
                  Start Focus <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => nav("/insights")}
                  className="w-full sm:w-auto justify-center"
                >
                  Insights
                </Button>
              </div>
            </div>
          }
        />
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={total} icon={CheckSquare} />
        <StatCard label="Active" value={active} icon={CalendarClock} />
        <StatCard label="Completed" value={completed} icon={CheckSquare} />
        <StatCard label="Overdue" value={overdue} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left */}
        <div className="xl:col-span-2 space-y-6">
          {/* Recommended */}
          <Card className="rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span className="font-semibold text-neutral-900">
                    Recommended for Now
                  </span>
                </div>
              }
              subtitle={aiEnabled ? "AI recommendations" : "AI is disabled"}
              right={
                <div className="flex items-center gap-2">
                  <Chip tone="red">Tomato Insights</Chip>
                  {aiEnabled && recFetching ? (
                    <span className="text-xs text-neutral-500">updating…</span>
                  ) : null}
                </div>
              }
            />

            <CardBody>
              {!aiEnabled ? (
                <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-5">
                  <div className="text-sm font-semibold text-neutral-900">
                    Turn on AI to see recommendations here
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">
                    When AI is off, Dashboard won’t request or render
                    recommendation cards.
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" onClick={toggleAi}>
                      Enable AI <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => nav("/insights")}>
                      Open Insights
                    </Button>
                  </div>
                </div>
              ) : recLoading ? (
                <div className="text-sm text-neutral-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                    Generating recommendations…
                  </span>
                </div>
              ) : recError ? (
                <div className="rounded-3xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
                  Failed to load recommendations.
                  <div className="mt-1 text-xs text-neutral-500">
                    You can still use the Tasks page to pick a focus task.
                  </div>
                </div>
              ) : recs.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
                  No recommendations yet.
                  <div className="mt-1 text-xs text-neutral-500">
                    Tip: create active tasks + add due dates for better recs.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recs.map((r) => (
                    <RecCard
                      key={String(r.taskId)}
                      rec={r}
                      onOpenDetail={() => openRecDetail(r)}
                      onStart={() => startFocusFor(r)}
                    />
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2">
                <Button variant="primary" onClick={() => nav("/tasks")}>
                  Open Tasks
                </Button>
                <Button variant="outline" onClick={() => nav("/calendar")}>
                  Plan Calendar
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Focus plan */}
          <Card className="rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <CardHeader
              title="Today's Focus Plan"
              subtitle="Quick and practical — start with one high/overdue task"
              right={<Chip tone="red">Tomato</Chip>}
            />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-3xl bg-neutral-50/70 border border-neutral-200 p-4">
                  <div className="text-sm text-neutral-500">Remaining</div>
                  <div className="mt-2 text-3xl font-semibold text-neutral-900">
                    {active}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    active tasks
                  </div>
                </div>

                <div className="rounded-3xl bg-red-50 border border-red-200 p-4">
                  <div className="text-sm text-neutral-500">High</div>
                  <div className="mt-2 text-3xl font-semibold text-red-700">
                    {highCount}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    do these first
                  </div>
                </div>

                <div className="rounded-3xl bg-amber-50 border border-amber-200 p-4">
                  <div className="text-sm text-neutral-500">Medium + Low</div>
                  <div className="mt-2 text-3xl font-semibold text-amber-700">
                    {medCount + lowCount}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    keep moving
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                Tip: pick <b>one</b> high-priority task → start Pomodoro for 25
                min.
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      pom.switchMode("focus");
                      nav("/pomodoro");
                    }}
                  >
                    <Timer className="h-4 w-4" />
                    Start Pomodoro
                  </Button>
                  <Button variant="outline" onClick={() => nav("/tasks")}>
                    Choose Task
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <Card className="rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <CardHeader title="Priority Breakdown" subtitle="Active tasks" />
            <CardBody>
              <div className="space-y-4 text-sm">
                <Row label="High" value={highCount} priority="high" />
                <Row label="Medium" value={medCount} priority="medium" />
                <Row label="Low" value={lowCount} priority="low" />
              </div>
            </CardBody>
          </Card>

          <Card className="rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <CardHeader title="Quick Actions" subtitle="Jump to key areas" />
            <CardBody>
              <div className="grid grid-cols-1 gap-2">
                <ActionBtn
                  icon={CheckSquare}
                  label="Create / Edit Tasks"
                  onClick={() => nav("/tasks")}
                />
                <ActionBtn
                  icon={CalendarDays}
                  label="Plan on Calendar"
                  onClick={() => nav("/calendar")}
                />
                <ActionBtn
                  icon={Timer}
                  label="Start Pomodoro"
                  onClick={() => nav("/pomodoro")}
                />
              </div>
            </CardBody>
          </Card>

          <div className="text-xs text-neutral-500">
            {aiEnabled && recData?.generatedAt ? (
              <>
                Recommendations generated{" "}
                <span className="text-neutral-700">
                  {new Date(recData.generatedAt).toLocaleString()}
                </span>
              </>
            ) : (
              <>
                {aiEnabled
                  ? recFetching
                    ? "Updating recommendations…"
                    : ""
                  : "AI is off"}
              </>
            )}
          </div>
        </div>
      </div>

      <TaskPreviewModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        task={detailTask}
        onOpenTasks={(id) => {
          setDetailOpen(false);
          nav(`/tasks?open=${id}`);
        }}
        onStartFocus={(id) => {
          setDetailOpen(false);
          pom.switchMode("focus");
          nav(`/pomodoro?taskId=${id}`);
        }}
      />
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full rounded-3xl border border-neutral-200 bg-white p-4 text-left",
        "shadow-sm hover:shadow-md hover:-translate-y-[1px] transition",
        "flex items-center gap-3",
      ].join(" ")}
    >
      <div className="h-10 w-10 rounded-2xl border border-red-100 bg-red-50 flex items-center justify-center">
        <Icon className="h-5 w-5 text-red-500" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-neutral-900 truncate">{label}</div>
        <div className="text-xs text-neutral-500">Open</div>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 text-neutral-400" />
    </button>
  );
}

type Priority = "high" | "medium" | "low";

function Row({
  label,
  value,
  priority,
}: {
  label: string;
  value: number;
  priority: Priority;
}) {
  const pct = Math.min(100, value * 10);

  const fill =
    priority === "high"
      ? "bg-red-500"
      : priority === "medium"
      ? "bg-amber-500"
      : "bg-neutral-400";

  const track =
    priority === "high"
      ? "bg-red-100"
      : priority === "medium"
      ? "bg-amber-100"
      : "bg-neutral-100";

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-medium text-neutral-900">{label}</span>
        <span className="text-neutral-500">{value}</span>
      </div>

      <div className={`mt-2 h-2 rounded-full overflow-hidden ${track}`}>
        <div className={`h-2 ${fill}`} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}