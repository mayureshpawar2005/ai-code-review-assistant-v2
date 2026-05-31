import { useEffect, useState } from "react";
import { getHealth } from "../api/client";
import type { HealthResponse } from "../types/api";
import { isLocalAnalysisMode } from "../utils/geminiStatus";

export function useLocalAnalysisMode() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getHealth();
        if (!cancelled) setHealth(data);
      } catch {
        if (!cancelled) setHealth(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading,
    health,
    localMode: isLocalAnalysisMode(health),
  };
}
