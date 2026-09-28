import sys
import os
from pathlib import Path

# Ensure backend root directory is in sys.path for foolproof imports
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from backend directory or project root
backend_env = Path(__file__).resolve().parent.parent / ".env"
root_env = Path(__file__).resolve().parent.parent.parent / ".env"
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
elif root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "Incident Memory"
    PROJECT_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Database (PostgreSQL with SQLite fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./incident_memory.db")
    
    # Memory Provider (Hindsight or Demo)
    MEMORY_PROVIDER: str = os.getenv("MEMORY_PROVIDER", "demo")
    HINDSIGHT_API_KEY: str = os.getenv("HINDSIGHT_API_KEY", "")
    HINDSIGHT_ENDPOINT: str = os.getenv("HINDSIGHT_ENDPOINT", "https://api.hindsight.dev")
    HINDSIGHT_TENANT_ID: str = os.getenv("HINDSIGHT_TENANT_ID", "enterprise-sre")
    
    # LLM Providers (OpenAI / ChatGPT, Google Gemini, Anthropic, or Demo)
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "demo")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "")

    @property
    def is_hindsight_live(self) -> bool:
        return bool(self.HINDSIGHT_API_KEY and self.MEMORY_PROVIDER in ["hindsight", "live"])

    @property
    def active_llm_provider(self) -> str:
        if self.OPENAI_API_KEY:
            return "openai"
        if self.GEMINI_API_KEY:
            return "gemini"
        if self.LLM_API_KEY:
            return self.LLM_PROVIDER if self.LLM_PROVIDER != "demo" else "openai"
        return self.LLM_PROVIDER

    @property
    def active_llm_key(self) -> str:
        if self.OPENAI_API_KEY:
            return self.OPENAI_API_KEY
        if self.GEMINI_API_KEY:
            return self.GEMINI_API_KEY
        return self.LLM_API_KEY

    @property
    def active_llm_model(self) -> str:
        if self.LLM_MODEL:
            return self.LLM_MODEL
        if self.active_llm_provider == "openai":
            return "gpt-4o"
        if self.active_llm_provider == "gemini":
            return "gemini-1.5-pro"
        return "demo-sre-investigator"

    @property
    def is_llm_live(self) -> bool:
        return bool(self.OPENAI_API_KEY or self.GEMINI_API_KEY or (self.LLM_API_KEY and self.LLM_PROVIDER != "demo"))

settings = Settings()
