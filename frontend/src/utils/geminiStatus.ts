import type { HealthResponse } from "../types/api";

const FAILURE_STATUSES = new Set([
  "quota_exceeded",
  "error",
  "degraded",
  "not_configured",
]);

export type GeminiDisplayStatus = "connected" | "configured" | "unavailable";

/** True when the app should use local/demo analysis (no Gemini errors shown). */
export function isLocalAnalysisMode(health: HealthResponse | null): boolean {
  if (!health) return true;
  if (health.gemini === "connected") return false;
  return true;
}

export function getGeminiDisplayStatus(
  health: HealthResponse | null
): GeminiDisplayStatus | null {
  if (!health) return null;

  if (health.gemini === "connected") {
    return "connected";
  }

  if (!health.gemini_configured) {
    return "unavailable";
  }

  if (FAILURE_STATUSES.has(health.gemini)) {
    return "unavailable";
  }

  return "configured";
}

export function getGeminiLabel(
  status: GeminiDisplayStatus | null,
  localMode?: boolean
): string {
  if (localMode) {
    return "Local Analysis";
  }
  switch (status) {
    case "connected":
      return "Connected";
    case "configured":
      return "Configured";
    case "unavailable":
      return "Local Analysis";
    default:
      return "—";
  }
}
