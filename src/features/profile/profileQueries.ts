import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, updateProfile } from "./profileApi";
import type { Profile, UpdateProfilePayload } from "./types";


/**
 * React hook: useProfileQuery.
 */
export function useProfileQuery(enabled: boolean = true) {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled,
    staleTime: 60 * 1000, 
  });
}

/**
 * React hook: useUpdateProfileMutation.
 */
export function useUpdateProfileMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (newProfile) => {
      
      qc.setQueryData(["profile"], newProfile);
    },
  });
}