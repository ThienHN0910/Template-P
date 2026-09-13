from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Modular Backend"
    API_V1_STR: str = "/api"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001"
    ]
    DATABASE_PROVIDER: str = "__DB_PROVIDER__"
    DATABASE_URL: str = "__DB_CONNECTION__"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
