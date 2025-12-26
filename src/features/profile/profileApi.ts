import type { Profile, UpdateProfilePayload } from "./types";
import { api } from "../../services/http";
import type { ApiResult } from "../../features/auth/authApi";

// GET /api/users/profile
/**
 * API helper: fetchProfile.
 */
export async function fetchProfile(): Promise<Profile> {
  const res = await api.get<ApiResult<Profile>>("/users/profile");
  return res.data.data;
}


/**
 * API helper: updateProfile.
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<Profile> {
  const res = await api.post<ApiResult<Profile>>("/users/profile", payload);
  return res.data.data;
}

// ===== UI helpers =====
/**
 * API helper: statusLabel.
 */
export function statusLabel(status: number | null) {
  if (status === 1) return "Active";
  if (status === 0) return "Disabled";
  return "—";
}

/**
 * API helper: genderLabel.
 */
export function genderLabel(g: number | null) {
  if (g === 1) return "Male";
  if (g === 2) return "Female";
  if (g === 0) return "Unspecified";
  return "—";
}