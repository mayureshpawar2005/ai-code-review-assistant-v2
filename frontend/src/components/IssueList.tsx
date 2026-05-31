import type { IssueItem } from "../types/api";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface IssueListProps {
  title: string;
  issues: IssueItem[];
  emptyMessage?: string;
}

const severityIcon = {
  critical: AlertCircle,
  high: AlertCircle,
  medium: AlertTriangle,
  low: Info,
};

const severityColor = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-amber-400",
  low: "text-slate-400",
};

export function IssueList({ title, issues, emptyMessage }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="card p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">{title}</h3>
        <p className="text-sm text-slate-500">
          {emptyMessage ?? "No issues found."}
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">
        {title} ({issues.length})
      </h3>
      <ul className="space-y-3">
        {issues.map((issue, i) => {
          const sev = (issue.severity?.toLowerCase() ?? "medium") as keyof typeof severityIcon;
          const Icon = severityIcon[sev] ?? AlertTriangle;
          const color = severityColor[sev] ?? "text-slate-400";
          return (
            <li
              key={`${issue.title}-${i}`}
              className="rounded-lg border border-slate-700/50 bg-surface-900/50 p-3"
            >
              <div className="flex items-start gap-2">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      {issue.title}
                    </span>
                    {issue.line != null && (
                      <span className="text-xs text-slate-500">
                        Line {issue.line}
                      </span>
                    )}
                    <span className={`text-xs capitalize ${color}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{issue.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
