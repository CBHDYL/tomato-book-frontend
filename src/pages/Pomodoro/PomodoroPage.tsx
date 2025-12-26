import React from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { usePomodoro } from "../../features/pomodoro/pomodoroStore";
import { useTasks } from "../../features/tasks/taskQueries";
import { Chip } from "../../components/ui/Chip";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../components/common/ToastHost";
import { Sparkles, Timer, Coffee, BarChart3, Link2, List } from "lucide-react";
import { usePomodoroSessionsQuery } from "../../features/pomodoro/pomodoroQueries";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${mm}:${ss}`;
}

type UISession = {
  id: string | number;
  taskId: string | number | null;
  mode: "focus" | "break" | string;
  minutes: number;
  startedAt: string;
  endedAt: string;
};

function safeDate(v: string) {
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d : null;
}

function inRange(s: UISession, range: string) {
  if (range === "all") return true;

  const d = safeDate(s.startedAt);
  if (!d) return false;

  const now = new Date();
  const days =
    range === "7d" ? 7 : range === "14d" ? 14 : range === "30d" ? 30 : 7;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d >= from && d <= now;
}

function TomatoDots({ count }: { count: number }) {
  const n = Math.max(0, count);
  const show = Math.min(n, 6);
  const extra = n - show;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: show }).map((_, i) => (
        <span
          key={i}
          className="h-4 w-4 rounded-full border border-red-200 bg-red-50 flex items-center justify-center text-[10px] leading-none text-red-600"
          title="Pomodoro"
        >
          🍅
        </span>
      ))}
      {extra > 0 ? (
        <span className="ml-1 text-xs text-neutral-500">+{extra}</span>
      ) : null}
    </div>
  );
}

/**
 * Page component: PomodoroPage.
 */
export function PomodoroPage() {
  const toast = useToast();
  const pom = usePomodoro();
  const { data: tasks = [] } = useTasks();

  const [breakType, setBreakType] = React.useState<"short" | "long">("short");
  const [range, setRange] = React.useState<"7d" | "14d" | "30d" | "all">("7d");

  // ✅ backend sessions
  const backendRange = range === "all" ? undefined : range;
  const { data: sessionDtos = [] } = usePomodoroSessionsQuery(
    backendRange as any,
    true
  );

  const backendSessions: UISession[] = (sessionDtos || []).map((s: any) => ({
    id: s.id ?? `${s.startedAt}-${s.endedAt}`,
    taskId: s.taskId ?? null,
    mode: s.mode ?? "focus",
    minutes: Number(s.minutes || 0),
    startedAt: String(s.startedAt || ""),
    endedAt: String(s.endedAt || ""),
  }));

  const localSessions: UISession[] = (pom.sessions || []).map((s: any) => ({
    id: s.id ?? `${s.startedAt}-${s.endedAt}`,
    taskId: s.taskId ?? null,
    mode: s.mode ?? "focus",
    minutes: Number(s.minutes || 0),
    startedAt: String(s.startedAt || ""),
    endedAt: String(s.endedAt || ""),
  }));

  const hasBackend = backendSessions.length > 0;
  const sourceSessions = hasBackend ? backendSessions : localSessions;

  const filteredSessions = React.useMemo(() => {
    const list = (sourceSessions || []).filter((x) => inRange(x, range));
    return list.sort((a, b) => {
      const da = safeDate(a.startedAt)?.getTime() ?? 0;
      const db = safeDate(b.startedAt)?.getTime() ?? 0;
      return db - da;
    });
  }, [sourceSessions, range]);

  const recentSessions = filteredSessions.slice(0, 10);

  const pomodoroCountByTask = React.useMemo(() => {
    const m = new Map<string, number>();
    filteredSessions.forEach((x) => {
      if (!x.taskId) return;
      if (String(x.mode || "").toLowerCase() !== "focus") return;
      const key = String(x.taskId);
      m.set(key, (m.get(key) ?? 0) + 1);
    });
    return m;
  }, [filteredSessions]);

  const stats = React.useMemo(() => {
    const focus = filteredSessions.filter(
      (s) => String(s.mode || "").toLowerCase() === "focus"
    );
    const focusCount = focus.length;
    const focusMinutes = focus.reduce(
      (sum, s) => sum + (Number(s.minutes) || 0),
      0
    );
    const avgMinutes =
      focusCount > 0 ? Math.round(focusMinutes / focusCount) : 0;

    const breaks = filteredSessions.filter(
      (s) => String(s.mode || "").toLowerCase() === "break"
    );
    const breakMinutes = breaks.reduce(
      (sum, s) => sum + (Number(s.minutes) || 0),
      0
    );

    return { focusCount, focusMinutes, avgMinutes, breakMinutes };
  }, [filteredSessions]);

  React.useEffect(() => {
    function onDone(e: any) {
      const { mode, minutes } = e.detail || {};
      toast.push(
        `⏰ ${mode === "focus" ? "Focus" : "Break"} finished • ${minutes} min`
      );
    }
    window.addEventListener("pomodoro:done", onDone as any);
    return () => window.removeEventListener("pomodoro:done", onDone as any);
  }, [toast]);

  const activeTasks = tasks.filter((t: any) => t.status === "active");
  const currentTaskTitle = pom.currentTaskId
    ? tasks.find((t: any) => t.id === pom.currentTaskId)?.title ?? "Task"
    : null;

  const isFocus = pom.mode === "focus";

  const SHORT_BREAK = 5;
  const LONG_BREAK = 15;

  React.useEffect(() => {
    if (pom.mode !== "break") return;
    const want = breakType === "short" ? SHORT_BREAK : LONG_BREAK;
    if (pom.settings.breakMinutes === want) return;
    pom.updateSettings({ ...pom.settings, breakMinutes: want });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakType, pom.mode]);

  function switchMode(mode: "focus" | "break") {
    pom.switchMode(mode);
    if (mode === "break") {
      const want = breakType === "short" ? SHORT_BREAK : LONG_BREAK;
      if (pom.settings.breakMinutes !== want) {
        pom.updateSettings({ ...pom.settings, breakMinutes: want });
      }
    }
  }

  const activeTasksRanked = React.useMemo(() => {
    const withCount = activeTasks.map((t: any) => {
      const c = pomodoroCountByTask.get(String(t.id)) ?? 0;
      return { ...t, _pomo: c };
    });

    return withCount
      .sort(
        (a: any, b: any) =>
          b._pomo - a._pomo || String(a.title).localeCompare(String(b.title))
      )
      .slice(0, 6);
  }, [activeTasks, pomodoroCountByTask]);

  function formatShortTime(v: string) {
    const d = safeDate(v);
    if (!d) return v;
    return d.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Main */}
      <Card className="xl:col-span-2 rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <CardHeader
          title={
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-red-100 bg-red-50 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-red-500" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-semibold tracking-tight text-neutral-900">
                  Pomodoro
                </div>
                <div className="text-xs text-neutral-500">
                  Focus sessions • task-linked analytics
                </div>
              </div>
            </div>
          }
          right={
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
                <Button
                  size="sm"
                  variant={pom.mode === "focus" ? "primary" : "outline"}
                  onClick={() => switchMode("focus")}
                >
                  <span className="inline-flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Focus
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant={pom.mode === "break" ? "primary" : "outline"}
                  onClick={() => switchMode("break")}
                >
                  <span className="inline-flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    Break
                  </span>
                </Button>
              </div>

              {pom.mode === "break" ? (
                <div className="min-w-[190px]">
                  <Select
                    value={breakType}
                    onChange={(v) => setBreakType(v as any)}
                    options={[
                      {
                        value: "short",
                        label: `Short break • ${SHORT_BREAK} min`,
                      },
                      {
                        value: "long",
                        label: `Long break • ${LONG_BREAK} min`,
                      },
                    ]}
                  />
                </div>
              ) : null}
            </div>
          }
        />

        <CardBody>
          <div className="space-y-6">
            {/* Timer */}
            <div className="w-full rounded-3xl border border-neutral-200 bg-gradient-to-b from-white to-red-50/40 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
              <div className="mx-auto max-w-[560px]">
                <div className="text-center">
                  <div className="text-[72px] leading-none font-medium tracking-tight text-neutral-900">
                    {fmt(pom.secondsLeft)}
                  </div>
                </div>

                <div className="mt-3 text-sm text-neutral-500 text-left">
                  <span
                    className={[
                      "font-medium",
                      isFocus ? "text-red-700" : "text-emerald-700",
                    ].join(" ")}
                  >
                    {isFocus
                      ? "Focus session"
                      : breakType === "long"
                      ? "Long break"
                      : "Short break"}
                  </span>

                  {currentTaskTitle ? (
                    <>
                      {" "}
                      <span className="text-neutral-300">•</span>{" "}
                      <span className="font-medium text-neutral-800">
                        {currentTaskTitle}
                      </span>
                    </>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-start gap-2">
                  {!pom.isRunning ? (
                    <Button
                      variant="primary"
                      className="min-w-[120px]"
                      onClick={() => {
                        pom.start();
                        toast.push("Started");
                      }}
                    >
                      Start
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="min-w-[120px]"
                      onClick={() => {
                        pom.pause();
                        toast.push("Paused");
                      }}
                    >
                      Pause
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="min-w-[120px]"
                    onClick={() => {
                      pom.reset();
                      toast.push("Reset");
                    }}
                  >
                    Reset
                  </Button>

                  <Button
                    variant="outline"
                    className="min-w-[120px]"
                    onClick={() => {
                      pom.reset();
                      toast.push("Skipped");
                    }}
                  >
                    Skip
                  </Button>
                </div>

                <div className="mt-4 text-xs text-neutral-500 text-left">
                  {hasBackend ? (
                    <>
                      <span className="font-medium text-neutral-800">
                        Backend
                      </span>{" "}
                      sessions enabled • Range:{" "}
                      <span className="font-medium text-neutral-800">
                        {range}
                      </span>
                    </>
                  ) : (
                    <>
                      Using{" "}
                      <span className="font-medium text-neutral-800">
                        local
                      </span>{" "}
                      sessions fallback (backend empty/unavailable).
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ Active Tasks moved UNDER timer and centered as a block */}
            <div className="mx-auto w-full max-w-[560px]">
              <Card className="w-full rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <CardHeader
                  title={
                    <span className="inline-flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-neutral-700" />
                      Active Tasks
                    </span>
                  }
                  subtitle="Click a task to attach • 🍅 = focus count"
                />
                <CardBody>
                  <div className="space-y-2">
                    {activeTasksRanked.map((t: any) => {
                      const selected =
                        String(pom.currentTaskId ?? "") === String(t.id);
                      const cnt = pomodoroCountByTask.get(String(t.id)) ?? 0;

                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            pom.setTask(t.id);
                            toast.push(`Attached: ${t.title}`);
                          }}
                          className={[
                            "w-full text-left rounded-2xl border p-3 transition",
                            "hover:bg-neutral-50",
                            selected
                              ? "border-red-200 bg-red-50/40"
                              : "border-neutral-200 bg-white",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-neutral-900 truncate">
                                {t.title}
                              </div>
                              <div className="mt-1 text-xs text-neutral-500">
                                {selected
                                  ? "Selected for timer"
                                  : "Tap to select"}
                              </div>
                            </div>

                            <div className="shrink-0 flex flex-col items-end gap-1">
                              <TomatoDots count={cnt} />
                              <div className="text-xs text-neutral-500">
                                {cnt} focus
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {activeTasksRanked.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                        No active tasks.
                      </div>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Attach */}
            <div className="w-full rounded-3xl border border-neutral-200 bg-neutral-50/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl border border-neutral-200 bg-white flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-neutral-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      Attach to Task
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Click a task above to quickly attach.
                    </div>
                  </div>
                </div>
                {pom.currentTaskId ? (
                  <Chip tone="red">linked</Chip>
                ) : (
                  <Chip tone="neutral">not linked</Chip>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select
                  value={pom.currentTaskId ?? ""}
                  onChange={(v) => pom.setTask(v ? v : null)}
                  options={[
                    { value: "", label: "No task selected" },
                    ...activeTasks.map((t: any) => {
                      const cnt = pomodoroCountByTask.get(String(t.id)) ?? 0;
                      return {
                        value: t.id,
                        label:
                          cnt > 0
                            ? `${t.title} • ${cnt} pomodoro${
                                cnt > 1 ? "s" : ""
                              }`
                            : t.title,
                      };
                    }),
                  ]}
                />

                <Button variant="outline" onClick={() => pom.setTask(null)}>
                  Clear
                </Button>

                <div className="text-sm text-neutral-500 self-center">
                  Tip: linking helps per-task analytics.
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Right column (Overview should NOT be fixed width) */}
      <div className="space-y-6">
        {/* Overview */}
        <Card className="w-full rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-neutral-700" />
                Overview
              </span>
            }
            subtitle="Filter & quick stats"
          />
          <CardBody>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  value={range}
                  onChange={(v) => setRange(v as any)}
                  options={[
                    { value: "7d", label: "Last 7 days" },
                    { value: "14d", label: "Last 14 days" },
                    { value: "30d", label: "Last 30 days" },
                    { value: "all", label: "All time" },
                  ]}
                />
              </div>
              <Chip tone={hasBackend ? "red" : "neutral"}>
                {hasBackend ? "backend" : "local"}
              </Chip>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="text-xs text-neutral-500">Focus</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900">
                  {stats.focusCount}
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="text-xs text-neutral-500">Minutes</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900">
                  {stats.focusMinutes}
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="text-xs text-neutral-500">Avg</div>
                <div className="mt-1 text-xl font-semibold text-neutral-900">
                  {stats.avgMinutes}m
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-neutral-500">
              Break minutes:{" "}
              <span className="font-medium text-neutral-800">
                {stats.breakMinutes}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Settings */}
        <Card className="w-full rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <CardHeader
            title="Settings"
            subtitle="Short / long break supported"
          />
          <CardBody>
            <div className="space-y-4">
              <label className="text-sm">
                <div className="mb-2 font-medium text-neutral-800">
                  Focus minutes
                </div>
                <Input
                  type="number"
                  min={1}
                  value={pom.settings.focusMinutes}
                  onChange={(e) =>
                    pom.updateSettings({
                      ...pom.settings,
                      focusMinutes: Number(e.target.value || 25),
                    })
                  }
                />
              </label>

              <div className="grid grid-cols-1 gap-2">
                <Select
                  value={breakType}
                  onChange={(v) => setBreakType(v as any)}
                  options={[
                    {
                      value: "short",
                      label: `Short break • ${SHORT_BREAK} min`,
                    },
                    { value: "long", label: `Long break • ${LONG_BREAK} min` },
                  ]}
                />
                <label className="text-sm">
                  <div className="mb-2 font-medium text-neutral-800">
                    Break minutes
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={pom.settings.breakMinutes}
                    onChange={(e) =>
                      pom.updateSettings({
                        ...pom.settings,
                        breakMinutes: Number(e.target.value || 5),
                      })
                    }
                  />
                </label>
              </div>

              <div className="pt-1 text-xs text-neutral-500">
                {hasBackend
                  ? "Sessions are loaded from backend."
                  : "Sessions are stored locally for demo (fallback)."}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Recent Sessions */}
        <Card className="w-full rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <List className="h-4 w-4 text-neutral-700" />
                Recent Sessions
              </span>
            }
            subtitle={`Latest ${recentSessions.length} • ${range}`}
          />
          <CardBody>
            <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
              {recentSessions.map((s) => {
                const isF = String(s.mode).toLowerCase() === "focus";
                const taskTitle = s.taskId
                  ? tasks.find((t: any) => t.id === s.taskId)?.title ??
                    String(s.taskId)
                  : null;

                return (
                  <div
                    key={String(s.id)}
                    className="px-4 py-3 flex items-center gap-3"
                  >
                    <div className="shrink-0">
                      <Chip tone={isF ? "red" : "green"}>
                        {isF ? "focus" : "break"}
                      </Chip>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-neutral-900 truncate">
                          {taskTitle ? taskTitle : "Not linked"}
                        </div>
                        <div className="text-sm font-semibold text-neutral-900 shrink-0">
                          {s.minutes}m
                        </div>
                      </div>

                      <div className="mt-1 text-xs text-neutral-500 flex items-center justify-between gap-3">
                        <div className="truncate">
                          {formatShortTime(s.startedAt)} →{" "}
                          {formatShortTime(s.endedAt)}
                        </div>
                        {s.taskId ? (
                          <div className="shrink-0 text-neutral-500">
                            🍅 {pomodoroCountByTask.get(String(s.taskId)) ?? 0}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

              {recentSessions.length === 0 ? (
                <div className="px-4 py-6 text-sm text-neutral-500 bg-neutral-50">
                  No sessions yet for this range.
                </div>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}