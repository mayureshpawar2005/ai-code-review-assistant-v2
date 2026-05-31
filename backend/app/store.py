import uuid
from datetime import datetime, timezone

from app.models.schemas import RecentAnalysis

_reviews_completed = 0
_recent: list[RecentAnalysis] = []
_MAX_RECENT = 20


def increment_reviews() -> int:
    global _reviews_completed
    _reviews_completed += 1
    return _reviews_completed


def get_reviews_completed() -> int:
    return _reviews_completed


def add_recent(
    analysis_type: str,
    language: str,
    summary: str,
    score: int | None = None,
) -> RecentAnalysis:
    entry = RecentAnalysis(
        id=str(uuid.uuid4())[:8],
        type=analysis_type,
        language=language,
        timestamp=datetime.now(timezone.utc),
        score=score,
        summary=summary[:200] if summary else "",
    )
    _recent.insert(0, entry)
    while len(_recent) > _MAX_RECENT:
        _recent.pop()
    return entry


def get_recent_analyses() -> list[RecentAnalysis]:
    return list(_recent)
