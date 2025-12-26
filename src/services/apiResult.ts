/**
 * Unified API envelope used by the Spring Boot backend:
 *   { code: number, msg?: string, data: T }
 *
 * Some endpoints may return raw data directly; helpers here handle both cases.
 */
export type ApiResult<T> = {
  code: number;
  msg?: string;
  data: T;
};

/**
 * API helper: isOkCode.
 */
export function isOkCode(code: number) {
  return code === 0 || code === 200;
}