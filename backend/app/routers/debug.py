from fastapi import APIRouter

from app.models.schemas import DebugRequest, DebugResponse
from app.services.gemini_service import debug_code
from app.store import add_recent, increment_reviews

router = APIRouter(tags=["debug"])


@router.post("/debug", response_model=DebugResponse)
async def debug(request: DebugRequest) -> DebugResponse:
    result = await debug_code(
        request.language, request.code, request.error_message
    )
    increment_reviews()
    add_recent(
        analysis_type="debug",
        language=request.language,
        summary=result.root_cause,
    )
    return result
