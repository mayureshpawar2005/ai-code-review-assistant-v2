export interface IssueItem {
  title: string;
  description: string;
  severity: string;
  line?: number | null;
}

export interface ReviewResponse {
  overall_score: number;
  bugs: IssueItem[];
  security_issues: IssueItem[];
  performance_issues: IssueItem[];
  code_smells: IssueItem[];
  best_practices: IssueItem[];
  refactored_code: string;
  summary: string;
  fallback?: boolean;
  message?: string | null;
}

export interface DebugResponse {
  root_cause: string;
  explanation: string;
  fix_recommendation: string;
  corrected_code: string;
  severity?: string;
  confidence_score?: number;
  best_practices?: string[];
  analysis_source?: "ai" | "local";
  fallback?: boolean;
  message?: string | null;
}

export interface RecentAnalysis {
  id: string;
  type: string;
  language: string;
  timestamp: string;
  score?: number | null;
  summary: string;
}

export interface HealthResponse {
  status: string;
  api: string;
  gemini: string;
  gemini_configured: boolean;
  gemini_message?: string | null;
  reviews_completed: number;
  recent_analyses: RecentAnalysis[];
}
