import { useState } from "react";
import {
  ClipboardCopy,
  Eraser,
  FileCode2,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { postReview } from "../api/client";
import { LocalAnalysisActive } from "../components/LocalAnalysisActive";
import { ReviewResultsPanel } from "../components/ReviewResultsPanel";
import { StatusBadge } from "../components/StatusBadge";
import { useLocalAnalysisMode } from "../hooks/useLocalAnalysisMode";
import {
  CODE_REVIEW_EXAMPLES,
  getDefaultCodeReviewExample,
  getExampleById,
  type CodeReviewExample,
} from "../data/codeReviewExamples";
import { getDemoReviewResult } from "../data/demoAnalysisResults";
import type { ReviewResponse } from "../types/api";

const LANGUAGES = [
  "python",
  "javascript",
  "typescript",
  "java",
  "go",
  "rust",
  "csharp",
  "cpp",
  "ruby",
  "php",
  "sql",
  "other",
];

const PLACEHOLDER =
  "Paste your code here or load one of the sample examples.";

const DEFAULT_EXAMPLE = getDefaultCodeReviewExample();

export function CodeReview() {
  const { localMode } = useLocalAnalysisMode();
  const [language, setLanguage] = useState(DEFAULT_EXAMPLE.language);
  const [code, setCode] = useState(DEFAULT_EXAMPLE.code);
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(
    DEFAULT_EXAMPLE.id
  );
  const [sampleLoaded, setSampleLoaded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResponse | null>(() =>
    getDemoReviewResult(DEFAULT_EXAMPLE.language, DEFAULT_EXAMPLE.code)
  );
  const [copyHint, setCopyHint] = useState<string | null>(null);

  function loadExample(
    example: CodeReviewExample,
    options?: { withDemo?: boolean }
  ) {
    setSelectedExampleId(example.id);
    setLanguage(example.language);
    setCode(example.code);
    setSampleLoaded(true);

    if (options?.withDemo !== false) {
      setResult(getDemoReviewResult(example.language, example.code));
    } else {
      setResult(null);
    }
  }

  function resetToExample() {
    const example = selectedExampleId
      ? getExampleById(selectedExampleId)
      : null;
    loadExample(example ?? getDefaultCodeReviewExample(), { withDemo: true });
  }

  function handleLoadExample() {
    const example = selectedExampleId
      ? getExampleById(selectedExampleId)
      : getDefaultCodeReviewExample();
    if (example) loadExample(example, { withDemo: true });
  }

  async function handleCopyExample() {
    if (!code.trim()) {
      setCopyHint("Nothing to copy");
      window.setTimeout(() => setCopyHint(null), 2000);
      return;
    }
    await navigator.clipboard.writeText(code);
    setCopyHint("Copied to clipboard");
    window.setTimeout(() => setCopyHint(null), 2000);
  }

  function handleClear() {
    setCode("");
    setSelectedExampleId(null);
    setResult(null);
    setSampleLoaded(false);
  }

  function handleCodeChange(value: string) {
    setCode(value);
    const ex = selectedExampleId
      ? getExampleById(selectedExampleId)
      : undefined;
    if (ex && value !== ex.code) {
      setSampleLoaded(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);
    setSampleLoaded(false);

    try {
      const data = await postReview(language, code);
      if (data.fallback) {
        setResult(getDemoReviewResult(language, code) ?? data);
      } else {
        setResult(data);
      }
    } catch {
      setResult(getDemoReviewResult(language, code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="h-7 w-7 text-accent-hover" />
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Code Review
            </h2>
          </div>
          <p className="mt-1 text-slate-400">
            Static analysis powered by AI — security, bugs, performance, and
            refactors in one pass
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {localMode && <LocalAnalysisActive />}
          {sampleLoaded && <StatusBadge status="sample_loaded" />}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-700/50 bg-surface-900/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-hover" />
              <h3 className="text-sm font-semibold text-slate-200">
                Try an Example
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Load a sample snippet to explore the reviewer
            </p>
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {CODE_REVIEW_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => loadExample(example, { withDemo: true })}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  selectedExampleId === example.id
                    ? "border-accent bg-accent/15 text-accent-hover"
                    : "border-slate-600 bg-surface-900 text-slate-300 hover:border-slate-500 hover:bg-surface-700"
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/50 bg-surface-900/80 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
                Language
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field w-auto min-w-[120px] py-1.5 text-xs"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </label>
              {copyHint && (
                <span className="text-xs text-emerald-400">{copyHint}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={resetToExample}
                className="btn-secondary py-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to Example
              </button>
              <button
                type="button"
                onClick={handleCopyExample}
                className="btn-secondary py-1.5 text-xs"
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
                Copy Example
              </button>
              <button
                type="button"
                onClick={handleLoadExample}
                className="btn-secondary py-1.5 text-xs"
              >
                <FileCode2 className="h-3.5 w-3.5" />
                Load Example
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary py-1.5 text-xs"
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="code-editor min-h-[320px] rounded-none border-0 focus:ring-0"
            placeholder={PLACEHOLDER}
            spellCheck={false}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="btn-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Review
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-4 border-t border-slate-700/50 pt-8">
          <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
          <ReviewResultsPanel result={result} />
        </div>
      )}
    </div>
  );
}
