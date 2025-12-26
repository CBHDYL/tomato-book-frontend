import React from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/common/ToastHost";
import {
  useAdminTasksQuery,
  useAdminDeleteTask,
  useAdminBatchDeleteTasks,
} from "../../features/admin/adminQueries";

function fmt(s?: string | null) {
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString();
}

/**
 * Page component: AdminTasksPage.
 */
export default function AdminTasksPage() {
  const toast = useToast();

  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(20);

  const [userId, setUserId] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("");
  const [priority, setPriority] = React.useState<string>("");

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const params = {
    page,
    size,
    userId: userId.trim() ? Number(userId) : undefined,
    status: status || undefined,
    priority: priority || undefined,
  };

  const { data, isLoading, error } = useAdminTasksQuery(params);
  const mutDelete = useAdminDeleteTask();
  const mutBatch = useAdminBatchDeleteTasks();

  const tasks = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  const selectedIds = Object.keys(selected)
    .filter((k) => selected[k])
    .map(Number);

  function toggleAll(checked: boolean) {
    const next: Record<string, boolean> = {};
    for (const t of tasks) next[String(t.id)] = checked;
    setSelected(next);
  }

  function onDelete(id: number) {
    if (!window.confirm("Delete this task?")) return;
    mutDelete.mutate(id, {
      onSuccess: () => toast.success("Task deleted"),
      onError: () => toast.error("Failed to delete task"),
    });
  }

  function onBatchDelete() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} tasks?`)) return;
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
          title="Admin · Tasks"
          subtitle="Search and manage tasks across users"
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
            <Select
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(0);
              }}
              placeholder="Status"
              options={[
                { value: "", label: "All status" },
                { value: "active", label: "active" },
                { value: "completed", label: "completed" },
              ]}
            />
            <Select
              value={priority}
              onChange={(v) => {
                setPriority(v);
                setPage(0);
              }}
              placeholder="Priority"
              options={[
                { value: "", label: "All priority" },
                { value: "low", label: "low" },
                { value: "medium", label: "medium" },
                { value: "high", label: "high" },
              ]}
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
            <div className="text-sm text-red-600">Failed to load tasks.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500">
                    <th className="py-3 pr-3">
                      <input
                        type="checkbox"
                        checked={
                          tasks.length > 0 &&
                          selectedIds.length === tasks.length
                        }
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </th>
                    <th className="py-3 pr-3">ID</th>
                    <th className="py-3 pr-3">Title</th>
                    <th className="py-3 pr-3">Priority</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 pr-3">Deadline</th>
                    <th className="py-3 pr-3">Updated</th>
                    <th className="py-3 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id} className="border-t border-neutral-200">
                      <td className="py-3 pr-3">
                        <input
                          type="checkbox"
                          checked={!!selected[String(t.id)]}
                          onChange={(e) =>
                            setSelected((s) => ({
                              ...s,
                              [String(t.id)]: e.target.checked,
                            }))
                          }
                        />
                      </td>
                      <td className="py-3 pr-3 text-neutral-500">{t.id}</td>
                      <td className="py-3 pr-3 font-medium">{t.title}</td>
                      <td className="py-3 pr-3">{t.priority}</td>
                      <td className="py-3 pr-3">{t.status}</td>

                      {}
                      <td className="py-3 pr-3">-</td>
                      <td className="py-3 pr-3">-</td>

                      <td className="py-3 pr-3">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            className="text-red-700"
                            onClick={() => onDelete(Number(t.id))}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-neutral-500"
                      >
                        No tasks
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