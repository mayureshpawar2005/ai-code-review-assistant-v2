from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    language: str = Field(..., min_length=1, max_length=50)
    code: str = Field(..., min_length=1, max_length=100_000)


class IssueItem(BaseModel):
    title: str
    description: str
    severity: str = "medium"
    line: int | None = None


class ReviewResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    bugs: list[IssueItem] = Field(default_factory=list)
    security_issues: list[IssueItem] = Field(default_factory=list)
    performance_issues: list[IssueItem] = Field(default_factory=list)
    code_smells: list[IssueItem] = Field(default_factory=list)
    best_practices: list[IssueItem] = Field(default_factory=list)
    refactored_code: str = ""
    summary: str = ""
    fallback: bool = False
    message: str | None = None


class DebugRequest(BaseModel):
    language: str = Field(..., min_length=1, max_length=50)
    code: str = Field(..., min_length=1, max_length=100_000)
    error_message: str = Field(..., min_length=1, max_length=10_000)


class DebugResponse(BaseModel):
    root_cause: str = ""
    explanation: str = ""
    fix_recommendation: str = ""
    corrected_code: str = ""
    severity: str = "medium"
    confidence_score: int = Field(default=75, ge=0, le=100)
    best_practices: list[str] = Field(default_factory=list)
    analysis_source: str = "local"
    fallback: bool = False
    message: str | None = None


class RecentAnalysis(BaseModel):
    id: str
    type: str
    language: str
    timestamp: datetime
    score: int | None = None
    summary: str = ""


class HealthResponse(BaseModel):
    status: str
    api: str
    gemini: str
    gemini_configured: bool
    gemini_message: str | None = None
    reviews_completed: int
    recent_analyses: list[RecentAnalysis]
