import type { DebugResponse, ReviewResponse } from "../types/api";

export const DEMO_PYTHON_REVIEW: ReviewResponse = {
  overall_score: 72,
  bugs: [
    {
      title: "Division by zero risk",
      description: "No check before dividing by b.",
      severity: "high",
    },
  ],
  security_issues: [
    {
      title: "Hardcoded password",
      description: "Credentials stored in source code.",
      severity: "high",
    },
  ],
  performance_issues: [],
  code_smells: [],
  best_practices: [
    {
      title: "Use environment variables",
      description: "Store secrets in os.environ or a vault.",
      severity: "high",
    },
    {
      title: "Add validation",
      description: "Validate inputs before division and other operations.",
      severity: "medium",
    },
  ],
  refactored_code: `import os

def divide(a, b):
    if b == 0:
        raise ValueError("Denominator cannot be zero")
    return a / b

def main():
    password = os.environ.get("APP_PASSWORD", "")
    try:
        result = divide(10, 2)
        print(result)
    except ValueError as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()`,
  summary:
    "Several security and reliability issues detected. Address hardcoded secrets and division safety.",
  fallback: false,
};

export const DEMO_NAME_ERROR_DEBUG: DebugResponse = {
  root_cause: "Variable 'y' is not defined.",
  explanation:
    "The name y was referenced in print() but never assigned in the current scope.",
  fix_recommendation: "Declare y before use, fix typos, or use the intended variable (e.g. x).",
  corrected_code: `x = 10
y = x  # declare before use
print(y)`,
  severity: "high",
  confidence_score: 95,
  best_practices: [
    "Run static analysis (mypy/pylint) to catch undefined names early.",
    "Add unit tests for each code path that prints output.",
  ],
  analysis_source: "local",
  fallback: false,
};

export function getDemoReviewResult(
  language: string,
  code: string
): ReviewResponse | null {
  if (
    language === "python" &&
    (code.includes("admin123") || code.includes("divide"))
  ) {
    return DEMO_PYTHON_REVIEW;
  }
  return {
    ...DEMO_PYTHON_REVIEW,
    overall_score: 68,
    summary: `Demo analysis for ${language} code — connect Gemini for live AI reviews.`,
  };
}

export function getDemoDebugResult(
  language: string,
  errorMessage: string
): DebugResponse | null {
  if (
    language === "python" &&
    errorMessage.toLowerCase().includes("name 'y'")
  ) {
    return DEMO_NAME_ERROR_DEBUG;
  }
  return DEMO_NAME_ERROR_DEBUG;
}
