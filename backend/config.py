"""
Configuration loader for backend.
Loads environment variables and provides settings.
"""

import os
from dotenv import load_dotenv

# Load .env file if present
load_dotenv()


class Settings:
    """Application settings loaded from environment."""

    # OpenRouter API configuration
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS configuration
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8081")

    # Model configuration
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "qwen/qwen3-coder:free")

    def validate(self) -> None:
        """Validate required settings are present."""
        if not self.OPENROUTER_API_KEY:
            raise ValueError(
                "OPENROUTER_API_KEY is required. Set it in .env or environment."
            )


# Global settings instance
settings = Settings()

# Validate on import (fail fast if misconfigured)
try:
    settings.validate()
except ValueError as e:
    print(f"Warning: {e}")
    # Don't crash - allow running without API key for testing
