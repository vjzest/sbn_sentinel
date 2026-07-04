from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    PROJECT_NAME: str = "SBN Sentinel API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "sentinel_db"
    OPENAI_API_KEY: str = ""
    LEARNING_ENGINE_ENABLED: bool = True
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
    class Config:
        env_file = ".env"
settings = Settings()
