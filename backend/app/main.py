from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import log_gemini_startup_status, settings
from app.routers import debug, health, review


@asynccontextmanager
async def lifespan(app: FastAPI):
    log_gemini_startup_status()
    yield


app = FastAPI(
    title="AI Code Review & Debugging Assistant",
    description="AI-powered code review and debugging using Google Gemini",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(review.router)
app.include_router(debug.router)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "AI Code Review & Debugging Assistant API",
        "docs": "/docs",
        "health": "/health",
    }
