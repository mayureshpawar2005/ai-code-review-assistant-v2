import { useState } from "react";
import {
  Bug,
  ClipboardCopy,
  Eraser,
  FileCode2,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { postDebug } from "../api/client";
import { DebugResultsPanel } from "../components/DebugResultsPanel";
import { LocalAnalysisActive } from "../components/LocalAnalysisActive";
import { StatusBadge } from "../components/StatusBadge";
import { useLocalAnalysisMode } from "../hooks/useLocalAnalysisMode";
import {
  DEBUG_EXAMPLES,
  getDebugExampleById,
  getDefaultDebugExample,
  type DebugExample,
} from "../data/debugExamples";
import { getDemoDebugResult } from "../data/demoAnalysisResults";
import type { DebugResponse } from "../types/api";
import { localDebugFallback } from "../utils/localDebugFallback";

const LANGUAGES = [
  "python",
  "javascript",
  "typescript",
  "java",
  "go",
  "rust",
  "csharp",
  "cpp",
  "other",
];

const CODE_PLACEHOLDER =
  "Paste your source code or load a sample example.";
const ERROR_PLACEHOLDER =
  "Paste the stack trace or error message here.";

const DEFAULT_EXAMPLE = getDefaultDebugExample();

export function DebugAssistant() {
  const { localMode } = useLocalAnalysisMode();
  const [language, setLanguage] = useState(DEFAULT_EXAMPLE.language);
  const [code, setCode] = useState(DEFAULT_EXAMPLE.code);
  const [errorMessage, setErrorMessage] = useState(DEFAULT_EXAMPLE.errorMessage);
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(
    DEFAULT_EXAMPLE.id
  );
  const [sampleLoaded, setSampleLoaded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResponse | null>(() =>
    getDemoDebugResult(DEFAULT_EXAMPLE.language, DEFAULT_EXAMPLE.errorMessage)
  );
  const [copyHint, setCopyHint] = useState<string | null>(null);

  function loadExample(
    example: DebugExample,
    options?: { withDemo?: boolean }
  ) {
    setSelectedExampleId(example.id);
    setLanguage(example.language);
    setCode(example.code);
    setErrorMessage(example.errorMessage);
    setSampleLoaded(true);

    if (options?.withDemo !== false) {
      setResult(
        getDemoDebugResult(example.language, example.errorMessage)
      );
    } else {
      setResult(null);
    }
  }

  function resetToExample() {
    const example = selectedExampleId
      ? getDebugExampleById(selectedExampleId)
      : null;
    loadExample(example ?? getDefaultDebugExample(), { withDemo: true });
  }

  function handleLoadExample() {
    const example = selectedExampleId
      ? getDebugExampleById(selectedExampleId)
      : getDefaultDebugExample();
    if (example) loadExample(example, { withDemo: true });
  }

  async function handleCopyExample() {
    const text = `${code}\n\n--- Error ---\n${errorMessage}`.trim();
    if (!code.trim() && !errorMessage.trim()) {
      setCopyHint("Nothing to copy");
      window.setTimeout(() => setCopyHint(null), 2000);
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopyHint("Copied to clipboard");
    window.setTimeout(() => setCopyHint(null), 2000);
  }

  function handleClear() {
    setCode("");
    setErrorMessage("");
    setSelectedExampleId(null);
    setResult(null);
    setSampleLoaded(false);
  }

  function handleCodeChange(value: string) {
    setCode(value);
    const ex = selectedExampleId
      ? getDebugExampleById(selectedExampleId)
      : undefined;
    if (ex && (value !== ex.code || errorMessage !== ex.errorMessage)) {
      setSampleLoaded(false);
    }
  }

  function handleErrorChange(value: string) {
    setErrorMessage(value);
    const ex = selectedExampleId
      ? getDebugExampleById(selectedExampleId)
      : undefined;
    if (ex && (code !== ex.code || value !== ex.errorMessage)) {
      setSampleLoaded(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !errorMessage.trim()) return;

    setLoading(true);
    setSampleLoaded(false);

    try {
      const data = await postDebug(language, code, errorMessage);
      setResult(data);
    } catch {
      setResult(
        getDemoDebugResult(language, errorMessage) ??
          localDebugFallback(language, code, errorMessage)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bug className="h-7 w-7 text-accent-hover" />
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Debug Assistant
            </h2>
          </div>
          <p className="mt-1 text-slate-400">
            AI-powered root cause analysis with local fallback — Sentry-style
            debugging for your portfolio
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {localMode && <LocalAnalysisActive />}
          {sampleLoaded && <StatusBadge status="sample_loaded" />}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-700/50 bg-surface-900/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-hover" />
            <h3 className="text-sm font-semibold text-slate-200">
              Try an Example
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          {DEBUG_EXAMPLES.map((example) => (
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

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/50 bg-surface-900/80 px-4 py-3">
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
                <div className="flex flex-wrap items-center gap-2">
                  {copyHint && (
                    <span className="text-xs text-emerald-400">{copyHint}</span>
                  )}
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

              <div className="border-b border-slate-700/50 px-4 py-2">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Source Code
                </span>
              </div>
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="code-editor min-h-[220px] rounded-none border-0 focus:ring-0"
                placeholder={CODE_PLACEHOLDER}
                spellCheck={false}
              />

              <div className="border-t border-slate-700/50 px-4 py-2">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Error Message
                </span>
              </div>
              <textarea
                value={errorMessage}
                onChange={(e) => handleErrorChange(e.target.value)}
                className="code-editor min-h-[120px] rounded-none border-0 focus:ring-0"
                placeholder={ERROR_PLACEHOLDER}
                spellCheck={false}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim() || !errorMessage.trim()}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Analyze Error
                </>
              )}
            </button>
          </div>

          <div className="card min-h-[480px] p-4 xl:sticky xl:top-6 xl:self-start">
            {loading ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-sm">Running analysis engine...</p>
              </div>
            ) : result ? (
              <DebugResultsPanel result={result} />
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-700/60 bg-surface-900/40 px-6 text-center">
                <Bug className="mb-3 h-10 w-10 text-slate-600" />
                <p className="text-sm font-medium text-slate-400">
                  Analysis results will appear here
                </p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Load an example or paste your code and error, then click
                  Analyze Error
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
