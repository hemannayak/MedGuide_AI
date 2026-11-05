import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, model_validator
from sqlalchemy.engine import URL

# Ensure .env is explicitly loaded into os.environ
backend_dir = Path(__file__).resolve().parent.parent.parent
for env_candidate in [backend_dir / ".env", Path(".env"), backend_dir.parent / ".env"]:
    if env_candidate.exists():
        load_dotenv(env_candidate, override=False)
        break


class Settings(BaseSettings):
    """Application settings loaded from environment variables or defaults."""

    APP_NAME: str = "MedGuide AI Backend"
    APP_ENV: str = "development"
    DEBUG: bool = True
    # Opt-in until live streaming, clinical safety and deployment acceptance gates pass.
    VOICE_STREAMING_ENABLED: bool = False
    VOICE_MAX_SESSIONS: int = Field(default=4, ge=1, le=32)
    # Server-only mail configuration. Never expose the credential to clients.
    SMTP_HOST: str = 'smtp.gmail.com'
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = 'viala.health@gmail.com'
    SMTP_SENDER: str = 'viala.health@gmail.com'
    SMTP_PASSWORD: str = Field(default='', repr=False)
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://192.168.1.15:8081",
        "http://192.168.1.15:3000",
    ]

    # Security Configuration
    SECRET_KEY: str = "change-this-in-production-super-secret-key-32bytes"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database Configuration
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "medguide_ai_dev"
    DATABASE_URL: Optional[str] = None

    # AI & Gateway Configuration
    AI_PROVIDER: str = "mock"
    AI_MODEL: str = ""
    GROQ_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    HF_TOKEN: Optional[str] = None
    TRANSLATION_PROVIDER: str = "mock"
    SARVAM_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_production(self):
        if "*" in self.CORS_ORIGINS:
            raise ValueError("CORS_ORIGINS must contain explicit frontend origins")
        if self.APP_ENV.lower() == "production":
            if self.DEBUG:
                raise ValueError("DEBUG must be false in production")
            if len(self.SECRET_KEY) < 32 or self.SECRET_KEY in {
                "change-this-in-production-super-secret-key-32bytes",
                "your-secret-key-at-least-32-bytes-long",
            }:
                raise ValueError("Set a strong, unique SECRET_KEY in production")
            if self.AI_PROVIDER == "mock" or self.TRANSLATION_PROVIDER == "mock":
                raise ValueError("Mock providers must not be used in production")
        return self

    @property
    def sqlalchemy_database_url(self) -> str:
        """Construct SQLAlchemy Database URL if not directly specified."""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return URL.create(
            "postgresql+psycopg", username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD, host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT, database=self.POSTGRES_DB,
        ).render_as_string(hide_password=False)


settings = Settings()
