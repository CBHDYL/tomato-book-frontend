import React from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/common/ToastHost";
import {
  useAdminInsightsQuery,
  useAdminRecomputeInsights,
} from "../../features/admin/adminQueries";

/**
 * Page component: AdminInsightsPage.
 */
export default function AdminInsightsPage() {
  const toast = useToast();

  const [userId, setUserId] = React.useState("");
  const [range, setRange] = React.useState("7d");
  const [ai, setAi] = React.useState("0");

  const uid = userId.trim() ? Number(userId) : 0;

  const { data, isLoading, error, refetch } = useAdminInsightsQuery({
    userId: uid,
    range,
    ai: Number(ai),
  });

  const mutRecompute = useAdminRecomputeInsights();

  function onRecompute() {
    if (!uid) return;
    mutRecompute.mutate(
      { userId: uid, range, ai: Number(ai) },
      {
        onSuccess: () => {
          toast.success("Recomputed");
          refetch();
        },
        onError: () => toast.error("Failed to recompute"),
      }
    );
  }

  return (
    <div className="p-5 md:p-8 space-y-6">
      <Card>
        <CardHeader
          title="Admin · Insights"
          subtitle="Run insights for any user (AI optional)"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter userId"
            />
            <Select
              value={range}
              onChange={(v) => setRange(v)}
              options={[
                { value: "7d", label: "7d" },
                { value: "14d", label: "14d" },
                { value: "30d", label: "30d" },
              ]}
            />
            <Select
              value={ai}
              onChange={(v) => setAi(v)}
              options={[
                { value: "0", label: "AI off" },
                { value: "1", label: "AI on" },
              ]}
            />
            <Button onClick={() => refetch()} disabled={!uid}>
              Run
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              Tip: AI on requires your python service to be available.
            </div>
            {}
            <Button variant="outline" onClick={onRecompute} disabled={!uid}>
              Recompute
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {!uid ? (
            <div className="text-sm text-neutral-500">
              Enter a userId to run insights.
            </div>
          ) : isLoading ? (
            <div className="text-sm text-neutral-500">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">Failed to load insights.</div>
          ) : !data ? (
            <div className="text-sm text-neutral-500">No data.</div>
          ) : (
            <div className="space-y-4">
              {}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="rounded-2xl border border-neutral-200 shadow-sm">
                  <CardBody>
                    <div className="text-sm text-neutral-600">Range</div>
                    <div className="mt-1 font-semibold">{data.range}</div>
                  </CardBody>
                </Card>

                <Card className="rounded-2xl border border-neutral-200 shadow-sm">
                  <CardBody>
                    <div className="text-sm text-neutral-600">Generated at</div>
                    <div className="mt-1 font-semibold">
                      {data.generatedAt ?? "-"}
                    </div>
                  </CardBody>
                </Card>

                <Card className="rounded-2xl border border-neutral-200 shadow-sm">
                  <CardBody>
                    <div className="text-sm text-neutral-600">
                      Recommendations
                    </div>
                    <div className="mt-1 font-semibold">
                      {data.recommendations?.length ?? 0}
                    </div>
                  </CardBody>
                </Card>
              </div>

              <div className="space-y-3">
                {data.recommendations?.map((r, idx) => (
                  <Card
                    key={idx}
                    className="rounded-2xl border border-neutral-200 shadow-sm"
                  >
                    <CardBody>
                      {}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{r.title}</div>
                          <div className="mt-1 text-sm text-neutral-600">
                            Task #{r.taskId} · Priority: {r.priority} ·
                            Deadline: {r.deadline ?? "-"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            Score {Number(r.score).toFixed(3)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            +{r.suggestedPomodoros} pomodoros
                          </div>
                        </div>
                      </div>

                      {r.reasons?.length ? (
                        <div className="mt-3 text-xs text-neutral-600">
                          Reasons: {r.reasons.join(" · ")}
                        </div>
                      ) : null}
                    </CardBody>
                  </Card>
                ))}

                {!data.recommendations || data.recommendations.length === 0 ? (
                  <div className="text-sm text-neutral-500">
                    No recommendations.
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}