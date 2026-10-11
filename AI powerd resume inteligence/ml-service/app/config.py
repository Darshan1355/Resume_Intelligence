from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "CareerMind ML / NLP Service"
    app_version: str = "1.0.0"
    model_name: str = "all-MiniLM-L6-v2"
    spacy_model: str = "en_core_web_sm"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
