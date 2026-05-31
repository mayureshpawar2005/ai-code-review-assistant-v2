import type { DebugResponse } from "../types/api";

/** Client-side fallback when the API is unreachable (mirrors backend local engine). */
export function localDebugFallback(
  language: string,
  code: string,
  errorMessage: string
): DebugResponse {
  const err = errorMessage.toLowerCase();

  if (
    language === "python" &&
    err.includes("typeerror") &&
    err.includes("str")
  ) {
    return {
      root_cause: "Type mismatch: string concatenated with a non-string value.",
      explanation:
        "Convert values with str() or use an f-string before building the message.",
      fix_recommendation: "Use f'Hello, {name}' or str(name) before concatenation.",
      corrected_code: code.replace(
        'print("Hello, " + name)',
        'print(f"Hello, {name}")'
      ),
      severity: "high",
      confidence_score: 94,
      best_practices: [
        "Prefer f-strings for readable string formatting.",
        "Validate input types at function boundaries.",
      ],
      analysis_source: "local",
      fallback: false,
    };
  }

  return {
    root_cause: `Runtime error detected in ${language} code.`,
    explanation:
      "Inspect the failing line and variable values at runtime to isolate the defect.",
    fix_recommendation:
      "Reproduce with a debugger, apply a minimal fix, and add a regression test.",
    corrected_code: code,
    severity: "medium",
    confidence_score: 72,
    best_practices: [
      "Add tests that reproduce the error before changing production code.",
      "Use logging with correlation IDs for production diagnostics.",
    ],
    analysis_source: "local",
    fallback: false,
  };
}
