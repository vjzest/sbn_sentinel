from pydantic_settings import BaseSettings
from pydantic import model_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "SBN Sentinel API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecret_sentinel_key_2026_dev"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    OTP_EXPIRE_MINUTES: int = 15
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "sentinel_db"
    OPENAI_API_KEY: str = ""
    LEARNING_ENGINE_ENABLED: bool = True

    # Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # SMTP
    SMTP_SERVER: str = ""
    SMTP_PORT: str = ""
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # EHR
    EHR_CLIENT_ID: str = ""
    EHR_CLIENT_SECRET: str = ""

    # SESR-012 Configuration Integrity
    ENVIRONMENT: str = "DEVELOPMENT"
    CLINIC_TIMEZONE: str = "UTC"
    SYNTHETIC_TEST_ENABLED: bool = False
    BUILD_ID: str = "unknown"
    BOOTSTRAP_ADMIN_PASSWORD: str = "SBNAdmin@2024"  # Default for dev

    @model_validator(mode='after')
    def validate_sesr012_config(self) -> 'Settings':
        if self.ENVIRONMENT == "PRODUCTION":
            if self.SYNTHETIC_TEST_ENABLED:
                raise ValueError(
                    "SESR-012 CDI-006 Violation: SYNTHETIC_TEST_ENABLED must be disabled in PRODUCTION")
            if self.SECRET_KEY == "supersecret_sentinel_key_2026_dev" or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "SESR-012 CDI-007 Violation: SECRET_KEY must be a secure, non-default string of at least 32 characters in PRODUCTION")
            # Audit 3 Item 6: Secret Bootstrap
            if self.BOOTSTRAP_ADMIN_PASSWORD == "SBNAdmin@2024" or not self.BOOTSTRAP_ADMIN_PASSWORD:
                raise ValueError(
                    "PRODUCTION_BOOTSTRAP_ERROR: BOOTSTRAP_ADMIN_PASSWORD must be explicitly provided in production and cannot be the default.")
        if not self.CLINIC_TIMEZONE:
            raise ValueError("SESR-012 CDI-014 Violation: CLINIC_TIMEZONE is required")
        return self

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
