import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("app.config")

# Resolve backend/.env relative to this file (backend/app/config.py -> backend/)
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"

# Load .env into os.environ before Settings is instantiated
if ENV_FILE.exists():
    load_dotenv(ENV_FILE, override=True)
    logger.info("Loaded environment from %s", ENV_FILE)
else:
    logger.warning("No .env file at %s", ENV_FILE)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"


settings = Settings()

PLACEHOLDER_KEYS = frozenset(
    {"", "your_gemini_api_key_here", "your_key", "changeme"}
)


def is_gemini_key_valid(key: str | None) -> bool:
    if not key:
        return False
    return key.strip() not in PLACEHOLDER_KEYS


def get_gemini_api_key() -> str:
    """Prefer os.environ (dotenv) then pydantic settings."""
    return (
        os.environ.get("GEMINI_API_KEY", "").strip()
        or settings.gemini_api_key.strip()
    )


def log_gemini_startup_status() -> None:
    env_key = os.environ.get("GEMINI_API_KEY", "")
    settings_key = settings.gemini_api_key
    effective = get_gemini_api_key()
    configured = is_gemini_key_valid(effective)

    def mask(key: str) -> str:
        if not key:
            return "(empty)"
        if len(key) <= 8:
            return "***"
        return f"{key[:4]}...{key[-4:]}"

    print("--- Gemini environment ---")
    print(f"  .env file exists: {ENV_FILE.exists()} ({ENV_FILE})")
    print(f"  GEMINI_API_KEY in os.environ: {bool(env_key)} {mask(env_key)}")
    print(f"  GEMINI_API_KEY in settings: {bool(settings_key)} {mask(settings_key)}")
    print(f"  GEMINI_API_KEY loaded: {configured}")
    print("--------------------------")

    if not ENV_FILE.exists():
        logger.warning(
            "Create %s from .env.example and set GEMINI_API_KEY",
            ENV_FILE,
        )
    elif not configured:
        logger.warning("GEMINI_API_KEY is missing or still a placeholder in .env")
