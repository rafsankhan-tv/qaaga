from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "QAAGA AI Microservice"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ALLOWED_ORIGINS: List[str] = ["*"]
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Internal Security Secret (Protects endpoints from unauthorized callers)
    AI_SERVICE_SECRET_KEY: str = ""
    INTERNAL_API_KEY_HEADER: str = "X-Internal-Service-Key"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
