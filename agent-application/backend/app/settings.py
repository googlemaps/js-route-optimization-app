from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Use top level .env file (one level above ./backend/)
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    AGENT_URL: str
    AGENT_STREAM_URL: str
    PROJECT_ID: str
    API_URL: str
    MAPS_API_KEY: str
    MAP_ID: str

settings = Settings()