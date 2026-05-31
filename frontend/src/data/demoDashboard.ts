import type { HealthResponse, RecentAnalysis } from "../types/api";
import { isLocalAnalysisMode } from "../utils/geminiStatus";

export const DEMO_REVIEWS_COMPLETED = 12;

export const DEMO_RECENT_ANALYSES: RecentAnalysis[] = [
  {
    id: "demo-1",
    type: "review",
    language: "python",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    score: 84,
    summary: "Solid structure; minor exception handling improvements suggested.",
  },
  {
    id: "demo-2",
    type: "debug",
    language: "typescript",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    summary: "Resolved undefined access on nested API response object.",
  },
  {
    id: "demo-3",
    type: "review",
    language: "javascript",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    score: 72,
    summary: "Detected async race condition and missing input validation.",
  },
  {
    id: "demo-4",
    type: "review",
    language: "java",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    score: 91,
    summary: "Clean service layer; logging and test coverage recommendations.",
  },
  {
    id: "demo-5",
    type: "debug",
    language: "python",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    summary: "Fixed type mismatch in dataframe merge pipeline.",
  },
];

/** True when the dashboard should show sample metrics (UI only). */
export function isDashboardDemoMode(health: HealthResponse | null): boolean {
  return isLocalAnalysisMode(health);
}

export interface DashboardViewModel {
  reviewsCompleted: number;
  recentAnalyses: RecentAnalysis[];
  recentCount: number;
  isDemo: boolean;
}

/** Merge live health data with demo placeholders for presentation only. */
export function getDashboardViewModel(
  health: HealthResponse | null
): DashboardViewModel {
  const isDemo = isDashboardDemoMode(health);

  if (!isDemo || !health) {
    const analyses = health?.recent_analyses ?? [];
    return {
      reviewsCompleted: health?.reviews_completed ?? 0,
      recentAnalyses: analyses,
      recentCount: analyses.length,
      isDemo: false,
    };
  }

  return {
    reviewsCompleted: DEMO_REVIEWS_COMPLETED,
    recentAnalyses: DEMO_RECENT_ANALYSES,
    recentCount: DEMO_RECENT_ANALYSES.length,
    isDemo: true,
  };
}
