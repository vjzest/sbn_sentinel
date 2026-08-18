from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator
from app.core.config import settings

# Temporarily using SQLite because PostgreSQL is not running on localhost
# Original config: SQLALCHEMY_DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI
SQLALCHEMY_DATABASE_URL = "sqlite:///./sentinel.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} # Required for SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator:
    """
    Dependency injector that provides a database session per request.
    Ensures the session is always closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
