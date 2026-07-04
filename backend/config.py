from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    SECRET_KEY: str = "burnoutai-secret-key-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./burnout.db"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8081", "*"]

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SECRET_KEY: str = ""

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Accept JSON array, comma-separated string, or a single string like '*'."""
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            # JSON array: ["*"] or ["http://a.com","http://b.com"]
            if v.startswith("["):
                import json
                return json.loads(v)
            # Comma-separated: http://a.com,http://b.com
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
