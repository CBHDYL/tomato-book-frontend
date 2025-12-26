import { api } from "../../services/http";

export type Recommendation = {
  taskId: number;
  title: string;
  priority: string;
  deadline: string | null;
  score: number;
  reasons: string[];
  suggestedPomodoros: number;
};

export type RecommendationsResponse = {
  generatedAt: string;
  range: string;
  recommendations: Recommendation[];
};

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    sp.set(k, String(v));
  });
  return sp.toString();
}

/**
 * API helper: apiGetRecommendations.
 */
export async function apiGetRecommendations(input: {
  range?: string;
  ai?: number;
}) {
  const query = qs({ range: input.range ?? "7d", ai: input.ai ?? 0 });
  const res = await api.get(`/insights/recommendations?${query}`);
  return res.data.data as RecommendationsResponse;
}