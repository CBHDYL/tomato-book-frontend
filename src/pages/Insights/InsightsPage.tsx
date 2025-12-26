import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Timer,
  ArrowRight,
  RefreshCw,
  ChartColumn,
  PieChart,
  Clock3,
  Focus,
  Percent,
  Zap,
} from "lucide-react";

import { useRecommendations } from "../../features/insights/insightsQueries";
import type { Recommendation } from "../../features/insights/insightsApi";
import { useAiMode } from "../../features/insights/aiMode";

import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Select } from "../../components/ui/Select";
import { usePomodoroSessionsQuery } from "../../features/pomodoro/pomodoroQueries";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RPieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

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
  const r = reason.toLowerCase();
  if (r.includes("overdue")) return "red";
  if (r.includes("due")) return "amber";
  return "neutral";
}

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
];

// ---------------- Charts helpers ----------------

type SessionLite = {
  mode: "focus" | "break" | string;
  minutes: number;
  startedAt: string; // ISO
};

function daysFromRange(range: string) {
  if (range === "14d") return 14;
  if (range === "30d") return 30;
  return 7;
}

function dayKey(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function buildDailyFocus(sessions: SessionLite[], range: string) {
  const days = daysFromRange(range);
  const now = new Date();
  const buckets: { date: string; focusMinutes: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    buckets.push({ date: dayKey(d), focusMinutes: 0 });
  }

  const idx = new Map(buckets.map((b, i) => [b.date, i]));
  sessions.forEach((s) => {
    if ((s.mode || "").toLowerCase() !== "focus") return;
    const dt = new Date(s.startedAt);
    if (Number.isNaN(dt.getTime())) return;
    const k = dayKey(dt);
    const pos = idx.get(k);
    if (pos === undefined) return;
    buckets[pos].focusMinutes += Number(s.minutes || 0);
  });

  return buckets;
}

function buildModePie(sessions: SessionLite[]) {
  let focus = 0;
  let brk = 0;
  sessions.forEach((s) => {
    const m = (s.mode || "").toLowerCase();
    const mins = Number(s.minutes || 0);
    if (m === "focus") focus += mins;
    else if (m === "break") brk += mins;
  });
  return [
    { name: "Focus", value: focus },
    { name: "Break", value: brk },
  ];
}

function fakeSessionsFromRecs(
  recs: Recommendation[],
  range: string
): SessionLite[] {
  const days = daysFromRange(range);
  const now = new Date();
  const totalMinutes = recs.reduce(
    (sum, r) => sum + Number(r.suggestedPomodoros || 0) * 25,
    0
  );
  if (!totalMinutes) return [];

  const perDay = Math.round(totalMinutes / days);
  const out: SessionLite[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({
      mode: "focus",
      minutes: perDay,
      startedAt: d.toISOString(),
    });
  }
  return out;
}

// ---------------- UI helpers ----------------

function minutesLabel(mins: number) {
  const m = Math.max(0, Math.round(Number(mins || 0)));
  if (m >= 120) return `${(m / 60).toFixed(1)} h`;
  return `${m} min`;
}

function clampPct(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = Number(payload[0]?.value || 0);
  return (
    <div className="rounded-2xl border border-red-100 bg-white px-3 py-2 shadow-lg">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-red-600">
        Focus: {minutesLabel(v)}
      </div>
    </div>
  );
}

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const name = p?.name ?? "";
  const value = Number(p?.value || 0);
  return (
    <div className="rounded-2xl border border-red-100 bg-white px-3 py-2 shadow-lg">
      <div className="text-xs text-neutral-500">{name}</div>
      <div className="mt-1 text-sm font-semibold text-neutral-900">
        {minutesLabel(value)}
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-neutral-500">{label}</div>
          <div className="mt-1 text-lg font-semibold text-neutral-900">
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs text-neutral-500">{hint}</div>
          ) : null}
        </div>
        <div className="h-9 w-9 rounded-2xl border border-red-100 bg-red-50 flex items-center justify-center">
          <Icon className="h-4 w-4 text-red-500" />
        </div>
      </div>
    </div>
  );
}

function RatioCard({ pct }: { pct: number }) {
  const p = clampPct(pct);
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-neutral-500">Focus ratio</div>
          <div className="mt-1 text-lg font-semibold text-neutral-900">
            {p}%
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Higher = more time spent focusing
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500"
              style={{ width: `${p}%` }}
            />
          </div>
        </div>
        <div className="h-9 w-9 rounded-2xl border border-red-100 bg-red-50 flex items-center justify-center">
          <Percent className="h-4 w-4 text-red-500" />
        </div>
      </div>
    </div>
  );
}

function RecCard({
  rec,
  onStart,
}: {
  rec: Recommendation;
  onStart: () => void;
}) {
  return (
    <Card className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <CardHeader
        title={
          <div className="min-w-0">
            <div className="text-base font-semibold text-neutral-900 truncate">
              {rec.title}
            </div>
          </div>
        }
        subtitle={<span className="text-xs">{fmtDue(rec.deadline)}</span>}
        right={
          <Chip tone={priorityTone(rec.priority)}>
            {String(rec.priority || "priority").toUpperCase()}
          </Chip>
        }
      />
      <CardBody>
        <div className="flex flex-wrap gap-2">
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
              <span className="font-semibold">{rec.suggestedPomodoros}</span>{" "}
              pomodoro{rec.suggestedPomodoros > 1 ? "s" : ""}
            </span>
          </div>

          <Button onClick={onStart} variant="primary">
            Start Focus <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function RecSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 border-b border-neutral-200">
        <div className="h-4 w-3/5 rounded bg-neutral-100 animate-pulse" />
        <div className="mt-2 h-3 w-2/5 rounded bg-neutral-100 animate-pulse" />
      </div>
      <div className="p-5">
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-neutral-100 animate-pulse" />
          <div className="h-6 w-24 rounded-full bg-neutral-100 animate-pulse" />
          <div className="h-6 w-16 rounded-full bg-neutral-100 animate-pulse" />
        </div>
        <div className="mt-4 h-10 w-full rounded-2xl bg-neutral-100 animate-pulse" />
      </div>
    </div>
  );
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
        enabled ? "shadow-sm" : "",
        "focus:outline-none focus:ring-2 focus:ring-red-200",
        className ?? "",
      ].join(" ")}
      title={enabled ? "AI enabled" : "AI disabled"}
    >
      <span
        className={[
          "relative h-2.5 w-2.5 rounded-full",
          enabled ? "bg-red-500" : "bg-neutral-300",
          enabled ? "animate-pulse" : "",
        ].join(" ")}
      />
      <span className="text-sm font-semibold text-neutral-900">
        AI {enabled ? "ON" : "OFF"}
      </span>

      {enabled ? (
        <span
          className={[
            "ml-1 inline-flex items-center gap-1 text-xs font-medium",
            "text-neutral-500",
          ].join(" ")}
        >
          <Zap className="h-3.5 w-3.5 text-red-500" />
          {busy ? "thinking…" : "ready"}
        </span>
      ) : null}

      {enabled ? (
        <span
          className={[
            "pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition",
            "bg-gradient-to-r from-red-200 via-amber-100 to-red-200",
          ].join(" ")}
          style={{ zIndex: -1 }}
        />
      ) : null}
    </button>
  );
}

// ---------------- Page ----------------

/**
 * Page component: InsightsPage.
 */
export default function InsightsPage() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();

  const { enabled: aiEnabled, toggle: toggleAi } = useAiMode();

  const range = sp.get("range") ?? "7d";

  const { data, isLoading, isFetching, refetch, error } = useRecommendations(
    range,
    aiEnabled ? 1 : 0,
    { enabled: aiEnabled }
  );

  const recs = data?.recommendations ?? [];

  function setRange(next: string) {
    const n = new URLSearchParams(sp);
    n.set("range", next);
    setSp(n, { replace: true });
  }

  const { data: sessionDtos = [] } = usePomodoroSessionsQuery(range, true);

  const backendSessions: SessionLite[] = sessionDtos.map((s) => ({
    mode: s.mode,
    minutes: s.minutes,
    startedAt: s.startedAt,
  }));

  const sessions =
    backendSessions.length > 0
      ? backendSessions
      : fakeSessionsFromRecs(recs, range);

  const daily = buildDailyFocus(sessions, range);
  const pie = buildModePie(sessions);

  const totalFocus = pie.find((p) => p.name === "Focus")?.value ?? 0;
  const totalBreak = pie.find((p) => p.name === "Break")?.value ?? 0;
  const total = totalFocus + totalBreak;
  const focusRatio = total ? (totalFocus / total) * 100 : 0;
  const focusPct = clampPct(focusRatio);

  const hasChartData =
    daily.some((d) => Number(d.focusMinutes || 0) > 0) || total > 0;

  const CHART = {
    bar: "#EF4444",
    pieFocus: "#EF4444",
    pieBreak: "#E5E7EB",
    grid: "#E5E7EB",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-sm rounded-2xl border border-neutral-200 bg-white">
        <CardHeader
          title={
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-red-100 bg-red-50 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-xl font-semibold text-neutral-900">
                  Insights
                </div>
                <div className="text-sm text-neutral-500">
                  Recommendations + analytics (Tomato-style).
                </div>
              </div>
            </div>
          }
          right={
            // ✅ Mobile: stack to avoid overflow
            <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end">
              <div className="w-full sm:w-[180px]">
                <Select
                  value={range}
                  onChange={setRange}
                  options={RANGE_OPTIONS}
                  className="rounded-2xl w-full"
                />
              </div>

              <AiPill
                enabled={aiEnabled}
                onToggle={toggleAi}
                busy={aiEnabled && isFetching}
                className="w-full sm:w-auto justify-center"
              />

              <Button
                variant="outline"
                onClick={() => aiEnabled && refetch()}
                disabled={!aiEnabled || isFetching}
                title={
                  !aiEnabled
                    ? "Enable AI to refresh recommendations"
                    : "Refresh"
                }
                className="w-full sm:w-auto justify-center"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "opacity-70" : ""}`}
                />
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          }
        />
      </Card>

      {/* Charts + KPI row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <ChartColumn className="h-4 w-4 text-neutral-700" />
                  <span className="font-semibold text-neutral-900">
                    Focus minutes by day
                  </span>
                </div>
              }
              subtitle={
                <span className="text-xs text-neutral-500">
                  Trend view (sessions API preferred; fallback is lightweight)
                </span>
              }
            />
            <CardBody>
              {!hasChartData ? (
                <div className="h-56 w-full rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center text-sm text-neutral-500">
                  No focus data yet — start a Pomodoro session and come back.
                </div>
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={daily}
                      margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke={CHART.grid}
                        strokeDasharray="3 6"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}`}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="focusMinutes"
                        radius={[10, 10, 0, 0]}
                        fill={CHART.bar}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <KpiCard
                  icon={Focus}
                  label="Focus time"
                  value={minutesLabel(totalFocus)}
                  hint={`${focusPct}% of total`}
                />
                <KpiCard
                  icon={Clock3}
                  label="Break time"
                  value={minutesLabel(totalBreak)}
                  hint="Rest matters too"
                />
                <KpiCard
                  icon={Timer}
                  label="Total tracked"
                  value={minutesLabel(total)}
                  hint={
                    range === "7d"
                      ? "Last 7 days"
                      : range === "14d"
                      ? "Last 14 days"
                      : "Last 30 days"
                  }
                />
                <RatioCard pct={focusPct} />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <Card className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-neutral-700" />
                  <span className="font-semibold text-neutral-900">
                    Focus vs Break
                  </span>
                </div>
              }
              subtitle={
                <span className="text-xs text-neutral-500">
                  Time allocation + focus ratio
                </span>
              }
            />
            <CardBody>
              {!hasChartData ? (
                <div className="h-56 w-full rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center text-sm text-neutral-500">
                  No allocation yet — do one session to populate.
                </div>
              ) : (
                <div className="relative h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie
                        data={pie}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={84}
                        paddingAngle={2}
                      >
                        <Cell fill={CHART.pieFocus} />
                        <Cell fill={CHART.pieBreak} />
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </RPieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-neutral-900">
                        {focusPct}%
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        Focus ratio
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                  <div className="text-xs text-neutral-500">Focus</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900">
                    {minutesLabel(totalFocus)}
                  </div>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                  <div className="text-xs text-neutral-500">Break</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900">
                    {minutesLabel(totalBreak)}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      {!aiEnabled ? (
        <Card className="shadow-sm rounded-2xl border border-neutral-200 bg-white overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-white to-amber-50" />
            <div className="relative p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">
                    AI recommendations are disabled
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">
                    Turn on AI to generate a focus plan based on deadlines,
                    priority and recent sessions.
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" onClick={toggleAi}>
                      Enable AI <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => nav("/tasks")}>
                      Manage Tasks
                    </Button>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <div className="rounded-3xl border border-red-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                      <span className="text-sm font-semibold text-neutral-800">
                        AI OFF
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      No requests are made.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <RecSkeleton />
          <RecSkeleton />
          <RecSkeleton />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
          Failed to load insights.
        </div>
      ) : recs.length === 0 ? (
        <Card className="shadow-sm rounded-2xl border border-neutral-200 bg-white">
          <CardHeader
            title={
              <div className="text-sm text-neutral-900 font-semibold">
                No recommendations
              </div>
            }
            subtitle={
              <div className="text-sm text-neutral-500">
                Create some active tasks and log focus sessions to get
                personalized recommendations.
              </div>
            }
            right={
              <div className="flex gap-3">
                <Button onClick={() => nav("/tasks")} variant="primary">
                  Go to Tasks
                </Button>
                <Button onClick={() => nav("/pomodoro")} variant="outline">
                  Open Pomodoro
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {recs.slice(0, 3).map((r) => (
            <RecCard
              key={r.taskId}
              rec={r}
              onStart={() => nav(`/pomodoro?taskId=${r.taskId}`)}
            />
          ))}
        </div>
      )}

      <div className="text-xs text-neutral-500">
        {aiEnabled && data?.generatedAt ? (
          <>
            Generated at{" "}
            <span className="text-neutral-700">
              {new Date(data.generatedAt).toLocaleString()}
            </span>
            {isFetching ? " · updating…" : ""}
          </>
        ) : aiEnabled ? (
          <>{isFetching ? "updating…" : ""}</>
        ) : (
          <>AI is off</>
        )}
      </div>
    </div>
  );
}