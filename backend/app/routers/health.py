from fastapi import APIRouter

from app.models.schemas import HealthResponse
from app.services.gemini_service import (
    check_gemini_status_with_message,
    is_gemini_configured,
)
from app.store import get_recent_analyses, get_reviews_completed

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    gemini_status, gemini_message = await check_gemini_status_with_message()
    return HealthResponse(
        status="ok",
        api="running",
        gemini=gemini_status,
        gemini_configured=is_gemini_configured(),
        gemini_message=gemini_message,
        reviews_completed=get_reviews_completed(),
        recent_analyses=get_recent_analyses(),
    )
