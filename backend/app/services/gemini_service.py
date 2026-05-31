import json
import re
import time
from typing import Any

import google.generativeai as genai

from app.config import get_gemini_api_key, is_gemini_key_valid, settings
from app.models.schemas import DebugResponse, IssueItem, ReviewResponse

QUOTA_KEYWORDS = ("quota", "rate limit", "resource exhausted", "429", "too many requests")

_STATUS_CACHE_TTL_SEC = 300  # avoid hitting Gemini on every dashboard poll
_status_cache: tuple[str, str | None, float] | None = None  # (status, message, expires_at)


def _configure_client() -> bool:
    api_key = get_gemini_api_key()
    if not is_gemini_key_valid(api_key):
        return False
    genai.configure(api_key=api_key)
    return True


def is_gemini_configured() -> bool:
    return is_gemini_key_valid(get_gemini_api_key())


def _truncate_error(exc: Exception, max_len: int = 240) -> str:
    msg = str(exc).strip().replace("\n", " ")
    return msg[:max_len] + ("..." if len(msg) > max_len else "")


async def _probe_gemini() -> tuple[str, str | None]:
    if not is_gemini_configured():
        return "not_configured", "Add GEMINI_API_KEY to backend/.env"
    try:
        _configure_client()
        model = genai.GenerativeModel(settings.gemini_model)
        response = model.generate_content("Reply with exactly: OK")
        if response and response.text:
            return "connected", None
        return "degraded", "Gemini responded without text"
    except Exception as exc:
        detail = _truncate_error(exc)
        if _is_quota_error(exc):
            return (
                "quota_exceeded",
                "Google API quota limit reached for this account/key. "
                "A new key on the same Google account often still shows this until "
                "billing is enabled or limits reset. "
                f"Details: {detail}",
            )
        return "error", detail


async def check_gemini_status(force_refresh: bool = False) -> str:
    status, _ = await check_gemini_status_with_message(force_refresh=force_refresh)
    return status


async def check_gemini_status_with_message(
    force_refresh: bool = False,
) -> tuple[str, str | None]:
    global _status_cache
    now = time.time()
    if (
        not force_refresh
        and _status_cache is not None
        and _status_cache[2] > now
    ):
        return _status_cache[0], _status_cache[1]

    status, message = await _probe_gemini()
    _status_cache = (status, message, now + _STATUS_CACHE_TTL_SEC)
    return status, message


def _extract_json(text: str) -> dict[str, Any] | None:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                return None
    return None


def _parse_issues(items: list[Any] | None) -> list[IssueItem]:
    if not items:
        return []
    result: list[IssueItem] = []
    for item in items:
        if isinstance(item, dict):
            result.append(
                IssueItem(
                    title=str(item.get("title", "Issue")),
                    description=str(item.get("description", "")),
                    severity=str(item.get("severity", "medium")),
                    line=item.get("line"),
                )
            )
        elif isinstance(item, str):
            result.append(IssueItem(title=item, description=item, severity="medium"))
    return result


def _is_quota_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    exc_name = type(exc).__name__.lower()
    return any(k in msg for k in QUOTA_KEYWORDS) or "resourceexhausted" in exc_name


def _fallback_review(language: str, reason: str) -> ReviewResponse:
    return ReviewResponse(
        overall_score=0,
        bugs=[],
        security_issues=[],
        performance_issues=[],
        code_smells=[],
        best_practices=[
            IssueItem(
                title="Service unavailable",
                description=reason,
                severity="high",
            )
        ],
        refactored_code="",
        summary=f"Code review could not be completed: {reason}",
        fallback=True,
        message=reason,
    )


def _debug_from_ai_data(data: dict[str, Any]) -> DebugResponse:
    raw_practices = data.get("best_practices", [])
    practices: list[str] = []
    for item in raw_practices or []:
        if isinstance(item, dict):
            practices.append(str(item.get("title") or item.get("description", "")))
        else:
            practices.append(str(item))

    return DebugResponse(
        root_cause=str(data.get("root_cause", "")),
        explanation=str(data.get("explanation", "")),
        fix_recommendation=str(data.get("fix_recommendation", "")),
        corrected_code=str(data.get("corrected_code", "")),
        severity=str(data.get("severity", "medium")).lower(),
        confidence_score=min(100, max(0, int(data.get("confidence_score", 85)))),
        best_practices=practices,
        analysis_source="ai",
        fallback=False,
        message=None,
    )


async def review_code(language: str, code: str) -> ReviewResponse:
    if not is_gemini_configured():
        return _fallback_review(
            language,
            "Gemini API key is not configured. Add GEMINI_API_KEY to backend/.env",
        )

    prompt = f"""You are an expert code reviewer. Analyze this {language} code and respond ONLY with valid JSON (no markdown) in this exact structure:
{{
  "overall_score": <integer 0-100>,
  "bugs": [{{"title": "...", "description": "...", "severity": "low|medium|high|critical", "line": <number or null>}}],
  "security_issues": [{{"title": "...", "description": "...", "severity": "...", "line": null}}],
  "performance_issues": [{{"title": "...", "description": "...", "severity": "...", "line": null}}],
  "code_smells": [{{"title": "...", "description": "...", "severity": "...", "line": null}}],
  "best_practices": [{{"title": "...", "description": "...", "severity": "...", "line": null}}],
  "refactored_code": "<improved full source code as a string>",
  "summary": "<2-3 sentence executive summary>"
}}

Code to review:
```{language}
{code}
```"""

    try:
        _configure_client()
        model = genai.GenerativeModel(settings.gemini_model)
        response = model.generate_content(prompt)
        raw = response.text if response and response.text else ""
        data = _extract_json(raw)
        if not data:
            return _fallback_review(language, "Could not parse AI response. Please try again.")

        return ReviewResponse(
            overall_score=int(data.get("overall_score", 50)),
            bugs=_parse_issues(data.get("bugs")),
            security_issues=_parse_issues(data.get("security_issues")),
            performance_issues=_parse_issues(data.get("performance_issues")),
            code_smells=_parse_issues(data.get("code_smells")),
            best_practices=_parse_issues(data.get("best_practices")),
            refactored_code=str(data.get("refactored_code", "")),
            summary=str(data.get("summary", "")),
        )
    except Exception as exc:
        if _is_quota_error(exc):
            return _fallback_review(
                language,
                "Gemini API quota exceeded. Please try again later or upgrade your plan.",
            )
        return _fallback_review(
            language,
            f"AI service error: {str(exc)[:200]}",
        )


async def _debug_with_gemini(
    language: str, code: str, error_message: str
) -> DebugResponse | None:
    prompt = f"""You are an expert debugger. Analyze this {language} code and error. Respond ONLY with valid JSON (no markdown):
{{
  "root_cause": "<concise root cause>",
  "explanation": "<detailed explanation>",
  "fix_recommendation": "<step-by-step fix>",
  "corrected_code": "<full corrected source code>",
  "severity": "low|medium|high",
  "confidence_score": <integer 0-100>,
  "best_practices": ["<tip 1>", "<tip 2>", "<tip 3>"]
}}

Code:
```{language}
{code}
```

Error message:
{error_message}
"""
    _configure_client()
    model = genai.GenerativeModel(settings.gemini_model)
    response = model.generate_content(prompt)
    raw = response.text if response and response.text else ""
    data = _extract_json(raw)
    if not data or not data.get("root_cause"):
        return None
    return _debug_from_ai_data(data)


async def debug_code(language: str, code: str, error_message: str) -> DebugResponse:
    from app.services.local_debug_engine import analyze as local_analyze

    if is_gemini_configured():
        try:
            ai_result = await _debug_with_gemini(language, code, error_message)
            if ai_result is not None:
                return ai_result
        except Exception:
            pass

    return local_analyze(language, code, error_message)
