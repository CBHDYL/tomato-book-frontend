// src/features/insights/insightsQueries.ts
import { useQuery } from "@tanstack/react-query";
import { apiGetRecommendations } from "./insightsApi";

export const insightKeys = {
  recommendations: (range: string, ai: number) =>
    ["insights", "recommendations", range, ai] as const,
};

/**
 * React hook: useRecommendations.
 */
export function useRecommendations(
  range: string,
  ai: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: insightKeys.recommendations(range, ai),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      try {
        const res = await apiGetRecommendations({ range, ai });

        
        if (!res || !Array.isArray(res.recommendations)) {
          return {
            generatedAt: new Date().toISOString(),
            range,
            recommendations: [],
          };
        }

        return res;
      } catch {
        
        return {
          generatedAt: new Date().toISOString(),
          range,
          recommendations: [],
        };
      }
    },
    staleTime: 60_000,
  });
}