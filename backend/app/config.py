"""
Configuration settings for PDF Mini API
"""

import json
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, EnvSettingsSource
from pydantic import field_validator


class _FlexEnvSource(EnvSettingsSource):
    """Accept comma-separated strings in addition to JSON arrays for list fields."""
    def decode_complex_value(self, field_name, field_type, value):
        try:
            return super().decode_complex_value(field_name, field_type, value)
        except Exception:
            if isinstance(value, str):
                return [v.strip() for v in value.split(',') if v.strip()]
            raise


class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    APP_NAME: str = "PDF Mini"
    DEBUG: bool = False
    API_VERSION: str = "1.0.0"
    
    # File upload settings
    UPLOAD_DIR: Path = Path("uploads")
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB in bytes
    ALLOWED_MIME_TYPES: List[str] = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    
    # File retention settings (in seconds)
    FILE_RETENTION_TIME: int = 3600  # 1 hour
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def normalize_cors_origins(cls, v):
        # Render's fromService gives bare hostnames (no scheme); prepend https://
        if isinstance(v, list):
            return [
                f"https://{o}" if o and not o.startswith("http") else o
                for o in v
            ]
        return v

    # Rate limiting
    RATE_LIMIT: str = "10/minute"  # 10 requests per minute per IP
    
    # PDF compression quality presets
    COMPRESSION_PRESETS: dict = {
        "screen": {
            "dpi": 72,
            "quality": "screen",
            "description": "Low quality, smallest size (72 dpi)"
        },
        "ebook": {
            "dpi": 150,
            "quality": "ebook",
            "description": "Medium quality, medium size (150 dpi)"
        },
        "printer": {
            "dpi": 300,
            "quality": "printer",
            "description": "High quality, larger size (300 dpi)"
        }
    }
    
    # LibreOffice settings
    LIBREOFFICE_PATH: str = "/usr/bin/libreoffice"
    
    # Ghostscript settings
    GHOSTSCRIPT_PATH: str = "/usr/bin/gs"
    
    # Security settings
    SANITIZE_FILENAMES: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @classmethod
    def settings_customise_sources(cls, settings_cls, init_settings, env_settings, dotenv_settings, **kwargs):
        return (init_settings, _FlexEnvSource(settings_cls), dotenv_settings)


# Create global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get settings instance"""
    return settings
