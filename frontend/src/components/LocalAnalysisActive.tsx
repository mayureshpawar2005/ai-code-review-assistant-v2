import { Shield } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export function LocalAnalysisActive() {
  return (
    <div className="inline-flex items-center gap-2">
      <StatusBadge status="local_analysis_active" />
      <span className="hidden text-xs text-slate-500 sm:inline">
        <Shield className="mr-1 inline h-3 w-3" />
        Using built-in analysis engine
      </span>
    </div>
  );
}
