import { useState } from "react";
import { Check, Copy, Shield, Sparkles } from "lucide-react";
import type { DebugResponse } from "../types/api";
import { BulletList, ReportSection } from "./ReportSection";

interface DebugResultsPanelProps {
  result: DebugResponse;
}

const severityStyles: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

function AnalysisBadge({ source }: { source: string }) {
  const isAi = source === "ai";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        isAi
          ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
          : "border-slate-500/40 bg-slate-500/15 text-slate-300"
      }`}
    >
      {isAi ? (
        <Sparkles className="h-3 w-3" />
      ) : (
        <Shield className="h-3 w-3" />
      )}
      {isAi ? "AI Analysis" : "Local Analysis"}
    </span>
  );
}

export function DebugResultsPanel({ result }: DebugResultsPanelProps) {
  const [copied, setCopied] = useState(false);
  const severityKey = (result.severity ?? "medium").toLowerCase();
  const severityClass =
    severityStyles[severityKey] ?? severityStyles.medium;

  async function copyCorrected() {
    if (!result.corrected_code) return;
    await navigator.clipboard.writeText(result.corrected_code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
        <AnalysisBadge source={result.analysis_source ?? "local"} />
      </div>

      <div className="card flex-1 overflow-hidden">
        <div className="space-y-0 p-5">
          <ReportSection title="Root Cause">
            <p className="text-sm leading-relaxed text-slate-100">
              {result.root_cause}
            </p>
            {result.explanation && result.explanation !== result.root_cause && (
              <p className="mt-2 text-sm text-slate-400">{result.explanation}</p>
            )}
          </ReportSection>

          <ReportSection title="Severity">
            <p className={`text-sm font-semibold capitalize ${severityClass}`}>
              {severityKey}
            </p>
          </ReportSection>

          <ReportSection title="Confidence">
            <p className="text-sm font-semibold text-white">
              {result.confidence_score ?? 75}%
            </p>
          </ReportSection>

          <ReportSection title="Suggested Fix">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {result.fix_recommendation}
            </p>
          </ReportSection>

          {result.corrected_code && (
            <ReportSection title="Corrected Code">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={copyCorrected}
                  className="btn-secondary mb-2 py-1.5 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-48 overflow-auto rounded-lg border border-slate-700/50 bg-surface-900 p-3 font-mono text-sm leading-relaxed text-emerald-200/90">
                {result.corrected_code}
              </pre>
            </ReportSection>
          )}

          {result.best_practices && result.best_practices.length > 0 && (
            <ReportSection title="Best Practices">
              <BulletList items={result.best_practices} />
            </ReportSection>
          )}
        </div>
      </div>
    </div>
  );
}
