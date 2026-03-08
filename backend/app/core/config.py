from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


_ASYNC_URL_PREFIXES = (
    "postgresql+asyncpg://",
    "mysql+aiomysql://",
    "sqlite+aiosqlite://",
)


def validate_database_url_prefix(url: str) -> None:
    """Raise a clear error early if DATABASE_URL uses a synchronous DB driver."""
    if not any(url.startswith(prefix) for prefix in _ASYNC_URL_PREFIXES):
        accepted = ", ".join(_ASYNC_URL_PREFIXES)
        raise ValueError(
            f"DATABASE_URL must use an async driver. "
            f"Accepted prefixes: {accepted}. "
            f"Got: {url!r}"
        )


class Settings(BaseSettings):
    PROJECT_NAME: str = "Meeting Vibe Checker API"
    DATABASE_URL: str
    CORS_ORIGINS: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def model_post_init(self, __context: object) -> None:
        validate_database_url_prefix(self.DATABASE_URL)

    @property
    def cors_origins_list(self) -> List[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        # Guard against wildcard + credentials — Starlette forbids this combination
        if origins == ["*"]:
            raise ValueError(
                "CORS_ORIGINS='*' is not allowed when allow_credentials=True. "
                "Specify explicit origins instead (e.g., http://localhost:3000)."
            )
        return origins


settings = Settings()
