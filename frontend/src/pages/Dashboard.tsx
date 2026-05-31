import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Clock, Zap } from "lucide-react";
import { getHealth } from "../api/client";
import { LocalAnalysisActive } from "../components/LocalAnalysisActive";
import { StatusBadge } from "../components/StatusBadge";
import type { HealthResponse } from "../types/api";
import { getDashboardViewModel } from "../data/demoDashboard";
import {
  getGeminiDisplayStatus,
  getGeminiLabel,
  isLocalAnalysisMode,
} from "../utils/geminiStatus";

export function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getHealth();
        if (!cancelled) {
          setHealth(data);
          setApiError(false);
        }
      } catch {
        if (!cancelled) {
          setApiError(true);
          setHealth(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const localMode = isLocalAnalysisMode(health);
  const geminiStatus = getGeminiDisplayStatus(health);
  const geminiLabel = loading
    ? "..."
    : getGeminiLabel(geminiStatus, localMode);
  const view = getDashboardViewModel(health);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h2>
          <p className="mt-1 text-slate-400">
            Overview of system health and your latest code analyses
          </p>
        </div>
        {!loading && localMode && <LocalAnalysisActive />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          label="API Status"
          value={loading ? "..." : apiError ? "Offline" : "Online"}
          badge={apiError ? "unavailable" : "running"}
        />
        <StatCard
          icon={Zap}
          label="Analysis Engine"
          value={geminiLabel}
          badge={
            localMode ? "local_analysis_active" : (geminiStatus ?? undefined)
          }
        />
        <StatCard
          icon={CheckCircle2}
          label="Reviews Completed"
          value={loading ? "..." : String(view.reviewsCompleted)}
        />
        <StatCard
          icon={Clock}
          label="Recent Analyses"
          value={loading ? "..." : String(view.recentCount)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-700/50 px-6 py-4">
          <h3 className="font-semibold text-white">Recent Analyses</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Your latest code reviews and debug sessions
          </p>
        </div>
        <div className="divide-y divide-slate-700/50">
          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              Loading activity...
            </p>
          ) : !view.recentAnalyses.length ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              No analyses yet. Start with Code Review or Debug Assistant.
            </p>
          ) : (
            view.recentAnalyses.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition hover:bg-surface-700/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-surface-700 px-2 py-0.5 text-xs font-medium capitalize text-slate-200">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-500">{item.language}</span>
                    {item.score != null && (
                      <span className="text-xs font-medium text-accent-hover">
                        Score {item.score}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-400">
                    {item.summary || "—"}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-slate-500">
                  {new Date(item.timestamp).toLocaleString()}
                </time>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="card p-5 transition hover:border-slate-600/60">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/20">
          <Icon className="h-5 w-5 text-accent-hover" />
        </div>
        {badge && <StatusBadge status={badge} />}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-white capitalize">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}
