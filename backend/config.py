import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "SAKTI - Ayurveda IPR & Regulatory Intelligence Agent"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CORPUS_DIR: Path = BASE_DIR / os.getenv("CORPUS_DIR", "data/corpus")

    ABSTENTION_THRESHOLD: float = float(os.getenv("ABSTENTION_THRESHOLD", "0.52"))
    GEMINI_MODELS: str = os.getenv("GEMINI_MODELS", "")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000,http://localhost:5173")
    ADMIN_TOKEN: str = os.getenv("ADMIN_TOKEN", "")
    AUDIT_DIR: Path = BASE_DIR / os.getenv("AUDIT_DIR", "data/audit")

settings = Settings()
