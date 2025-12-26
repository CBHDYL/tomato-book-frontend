import React from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/common/ToastHost";
import {
  useAdminUsersQuery,
  useAdminDeleteUser,
  useAdminResetUserPassword,
  useAdminSetUserRole,
  useAdminSetUserStatus,
} from "../../features/admin/adminQueries";

function roleLabel(r: string | null | undefined) {
  if (!r) return "Unknown";
  const up = r.toUpperCase();
  if (up === "ADMIN" || up === "ROLE_ADMIN") return "ADMIN";
  return "USER";
}

/**
 * Page component: AdminUsersPage.
 */
export default function AdminUsersPage() {
  const toast = useToast();

  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(20);

  const { data, isLoading, error } = useAdminUsersQuery({
    page,
    size,
    q: q.trim() || undefined,
  });

  const mutStatus = useAdminSetUserStatus();
  const mutRole = useAdminSetUserRole();
  const mutReset = useAdminResetUserPassword();
  const mutDelete = useAdminDeleteUser();

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  function onToggleStatus(id: number, cur: number | null | undefined) {
    const next = (cur ?? 1) === 1 ? 0 : 1; 
    mutStatus.mutate(
      { id, status: next },
      {
        onSuccess: () => toast.success("User status updated"),
        onError: () => toast.error("Failed to update status"),
      }
    );
  }

  function onChangeRole(id: number, next: "USER" | "ADMIN") {
    mutRole.mutate(
      { id, role: next },
      {
        onSuccess: () => toast.success("User role updated"),
        onError: () => toast.error("Failed to update role"),
      }
    );
  }

  function onResetPassword(id: number) {
    const pwd = window.prompt("New password for this user:");
    if (!pwd) return;
    mutReset.mutate(
      { id, newPassword: pwd },
      {
        onSuccess: () => toast.success("Password reset"),
        onError: () => toast.error("Failed to reset password"),
      }
    );
  }

  function onDeleteUser(id: number) {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    mutDelete.mutate(id, {
      onSuccess: () => toast.success("User deleted"),
      onError: () => toast.error("Failed to delete user"),
    });
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      <Card>
        <CardHeader
          title="Admin · Users"
          subtitle="Manage users, roles, and status"
        />
        <CardBody>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
                placeholder="Search (username / email / phone)…"
              />
            </div>
            <div className="w-full md:w-40">
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
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="text-sm text-neutral-500">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">Failed to load users.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500">
                    <th className="py-3 pr-3">ID</th>
                    <th className="py-3 pr-3">Username</th>
                    <th className="py-3 pr-3">Nickname</th>
                    <th className="py-3 pr-3">Email</th>
                    <th className="py-3 pr-3">Role</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-neutral-200">
                      <td className="py-3 pr-3 text-neutral-500">{u.id}</td>
                      <td className="py-3 pr-3 font-medium">{u.username}</td>
                      <td className="py-3 pr-3">{u.nickname ?? "-"}</td>
                      <td className="py-3 pr-3">{u.email ?? "-"}</td>
                      <td className="py-3 pr-3">
                        <Select
                          value={roleLabel(u.role)}
                          onChange={(v) => onChangeRole(u.id, v as any)}
                          options={[
                            { value: "USER", label: "USER" },
                            { value: "ADMIN", label: "ADMIN" },
                          ]}
                          className="w-40"
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          className={[
                            "px-3 py-1 rounded-full text-xs border",
                            (u.status ?? 1) === 1
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-neutral-200 bg-neutral-50 text-neutral-600",
                          ].join(" ")}
                          onClick={() => onToggleStatus(u.id, u.status)}
                        >
                          {(u.status ?? 1) === 1 ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => onResetPassword(u.id)}
                          >
                            Reset pwd
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => onDeleteUser(u.id)}
                            className="text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-neutral-500"
                      >
                        No users
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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