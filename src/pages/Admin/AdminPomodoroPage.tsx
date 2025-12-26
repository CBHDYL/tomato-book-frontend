import React from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/common/ToastHost";
import {
  useAdminPomodoroQuery,
  useAdminDeletePomodoro,
  useAdminBatchDeletePomodoro,
} from "../../features/admin/adminQueries";

function fmt(s?: string | null) {
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString();
}

/**
 * Page component: AdminPomodoroPage.
 */
export default function AdminPomodoroPage() {
  const toast = useToast();

  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(20);
  const [userId, setUserId] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const params = {
    page,
    size,
    userId: userId.trim() ? Number(userId) : undefined,
    from: from.trim() || undefined,
    to: to.trim() || undefined,
  };

  const { data, isLoading, error } = useAdminPomodoroQuery(params);
  const mutDelete = useAdminDeletePomodoro();
  const mutBatch = useAdminBatchDeletePomodoro();

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const selectedIds = Object.keys(selected)
    .filter((k) => selected[k])
    .map(Number);

  function toggleAll(checked: boolean) {
    const next: Record<string, boolean> = {};
    for (const s of items) next[String(s.id)] = checked;
    setSelected(next);
  }

  function onDelete(id: number) {
    if (!window.confirm("Delete this session?")) return;
    mutDelete.mutate(id, {
      onSuccess: () => toast.success("Session deleted"),
      onError: () => toast.error("Failed to delete session"),
    });
  }

  function onBatchDelete() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} sessions?`)) return;
    mutBatch.mutate(selectedIds, {
      onSuccess: () => {
        toast.success("Batch deleted");
        setSelected({});
      },
      onError: () => toast.error("Failed to batch delete"),
    });
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      <Card>
        <CardHeader
          title="Admin · Pomodoro"
          subtitle="Audit and manage Pomodoro sessions"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setPage(0);
              }}
              placeholder="Filter by userId"
            />
            <Input
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(0);
              }}
              placeholder="from (LocalDateTime) e.g. 2025-12-01T00:00:00"
            />
            <Input
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(0);
              }}
              placeholder="to (LocalDateTime) e.g. 2025-12-31T23:59:59"
            />
            <Select
              value={String(size)}
              onChange={(v) => {
                setSize(Number(v));
                setPage(0);
              }}
              options={[
                { value: "10", label: "10 / page" },
                { value: "20", label: "20 / page" },
                { value: "50", label: "50 / page" },
              ]}
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              Selected: {selectedIds.length}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toggleAll(true)}>
                Select page
              </Button>
              <Button variant="outline" onClick={() => toggleAll(false)}>
                Clear
              </Button>
              <Button
                onClick={onBatchDelete}
                disabled={selectedIds.length === 0}
                className="text-red-700"
                variant="outline"
              >
                Batch delete
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="text-sm text-neutral-500">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">Failed to load sessions.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500">
                    <th className="py-3 pr-3">
                      <input
                        type="checkbox"
                        checked={
                          items.length > 0 &&
                          selectedIds.length === items.length
                        }
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </th>
                    <th className="py-3 pr-3">ID</th>
                    <th className="py-3 pr-3">User</th>
                    <th className="py-3 pr-3">Task</th>
                    <th className="py-3 pr-3">Mode</th>
                    <th className="py-3 pr-3">Minutes</th>
                    <th className="py-3 pr-3">Started</th>
                    <th className="py-3 pr-3">Ended</th>
                    <th className="py-3 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s.id} className="border-t border-neutral-200">
                      <td className="py-3 pr-3">
                        <input
                          type="checkbox"
                          checked={!!selected[String(s.id)]}
                          onChange={(e) =>
                            setSelected((m) => ({
                              ...m,
                              [String(s.id)]: e.target.checked,
                            }))
                          }
                        />
                      </td>
                      <td className="py-3 pr-3 text-neutral-500">{s.id}</td>
                      <td className="py-3 pr-3">{s.userId}</td>
                      <td className="py-3 pr-3">{s.taskId ?? "-"}</td>
                      <td className="py-3 pr-3">{s.mode ?? "-"}</td>
                      <td className="py-3 pr-3">{s.minutes ?? "-"}</td>
                      <td className="py-3 pr-3">{fmt(s.startedAt ?? null)}</td>
                      <td className="py-3 pr-3">{fmt(s.endedAt ?? null)}</td>
                      <td className="py-3 pr-3">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            className="text-red-700"
                            onClick={() => onDelete(s.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-8 text-center text-neutral-500"
                      >
                        No sessions
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              Page {page + 1} / {Math.max(1, totalPages)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}