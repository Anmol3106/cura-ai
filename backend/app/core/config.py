from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Cura AI API"
    environment: str = "development"
    # Frontend addresses allowed to call this API
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    # Required: no default, so the app fails loudly if they are missing
    database_url: str
    secret_key: str

    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Google AI Studio (Gemini). The key stays in .env and never goes to the frontend.
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash"
    # Used automatically when the main model is busy or unavailable
    gemini_fallback_model: str = "gemini-3.5-flash-lite"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()