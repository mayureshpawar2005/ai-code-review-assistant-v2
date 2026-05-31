import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { IssueItem, ReviewResponse } from "../types/api";
import { BulletList, ReportSection } from "./ReportSection";

interface ReviewResultsPanelProps {
  result: ReviewResponse;
}

function collectIssueTitles(result: ReviewResponse): string[] {
  const all: IssueItem[] = [
    ...result.security_issues,
    ...result.bugs,
    ...result.performance_issues,
    ...result.code_smells,
  ];
  return all.map((i) => i.title).filter(Boolean);
}

function collectRecommendationTitles(result: ReviewResponse): string[] {
  return result.best_practices.map((p) => p.title).filter(Boolean);
}

export function ReviewResultsPanel({ result }: ReviewResultsPanelProps) {
  const [copied, setCopied] = useState(false);
  const issues = collectIssueTitles(result);
  const recommendations = collectRecommendationTitles(result);

  const scoreColor =
    result.overall_score >= 80
      ? "text-emerald-400"
      : result.overall_score >= 60
        ? "text-amber-400"
        : "text-red-400";

  async function copyImprovedCode() {
    if (!result.refactored_code) return;
    await navigator.clipboard.writeText(result.refactored_code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card overflow-hidden">
      <div className="space-y-0 p-6">
        <ReportSection title={`Review Score: ${result.overall_score}/100`}>
          <p className={`text-2xl font-bold ${scoreColor}`}>
            {result.overall_score}
            <span className="text-lg font-medium text-slate-500"> / 100</span>
          </p>
          {result.summary && (
            <p className="mt-3 text-sm text-slate-400">{result.summary}</p>
          )}
        </ReportSection>

        <ReportSection title="Issues Found">
          <BulletList items={issues} />
        </ReportSection>

        <ReportSection title="Recommendations">
          <BulletList items={recommendations} />
        </ReportSection>

        {result.refactored_code && (
          <ReportSection title="Improved Code">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={copyImprovedCode}
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
            <pre className="max-h-[360px] overflow-auto rounded-lg border border-slate-700/50 bg-surface-900 p-4 font-mono text-sm leading-relaxed text-slate-300">
              {result.refactored_code}
            </pre>
          </ReportSection>
        )}
      </div>
    </div>
  );
}
