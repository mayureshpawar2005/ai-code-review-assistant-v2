from fastapi import APIRouter

from app.models.schemas import ReviewRequest, ReviewResponse
from app.services.gemini_service import review_code
from app.store import add_recent, increment_reviews

router = APIRouter(tags=["review"])


@router.post("/review", response_model=ReviewResponse)
async def review(request: ReviewRequest) -> ReviewResponse:
    result = await review_code(request.language, request.code)
    if not result.fallback:
        increment_reviews()
    add_recent(
        analysis_type="review",
        language=request.language,
        summary=result.summary,
        score=result.overall_score if not result.fallback else None,
    )
    return result
