"""Configuration settings for the FORGE Sovereign AI Control Plane."""

from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Sovereign backend settings loaded from environment or defaults."""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "FORGE Sovereign Industrial AI Control Plane"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Network
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Model Provider Configuration
    # Strictly sovereign: "ollama", "vllm", or "mock"
    MODEL_PROVIDER: str = Field(default="ollama", description="Local model provider backend")
    DEFAULT_MODEL: str = Field(default="qwen3:8b", description="Default local reasoning model tag")
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", description="Ollama API base URL")
    OLLAMA_TIMEOUT_SECONDS: float = Field(default=120.0, description="Inference timeout in seconds")

    # Knowledge Layer Configuration
    KNOWLEDGE_BASE_DIR: str = Field(default="data/demo/knowledge", description="Allowed root path for local document ingestion")
    EMBEDDING_PROVIDER: str = Field(default="mock", description="Local embedding provider: mock or local")
    EMBEDDING_MODEL: str = Field(default="BAAI/bge-m3", description="Local sovereign embedding model")
    CHUNK_SIZE: int = Field(default=500, description="Default document chunk character size")
    CHUNK_OVERLAP: int = Field(default=50, description="Default document chunk character overlap")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
