import React from "react";
import { useAdminStatsQuery } from "../../features/admin/adminQueries";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";

function StatCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <Card className="rounded-2xl border border-neutral-200 shadow-sm">
      <CardBody>
        <div className="text-sm text-neutral-600">{title}</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">
          {value}
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Page component: AdminDashboardPage.
 */
export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminStatsQuery();

  return (
    <div className="p-5 md:p-8 space-y-6">
      <Card>
        <CardHeader
          title="Admin Dashboard"
          subtitle="System overview (admin-only)"
        />
        <CardBody>
          <div className="text-sm text-neutral-600">
            Use the left navigation to manage Users, Tasks, Pomodoro sessions,
            and Insights.
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-600">Failed to load stats.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={data?.totalUsers ?? 0} />
          <StatCard title="Total Tasks" value={data?.totalTasks ?? 0} />
          <StatCard
            title="Pomodoro Sessions"
            value={data?.totalPomodoroSessions ?? 0}
          />
          <StatCard
            title="Pomodoro (Last 7 Days)"
            value={data?.pomodoroLast7Days ?? 0}
          />
        </div>
      )}
    </div>
  );
}