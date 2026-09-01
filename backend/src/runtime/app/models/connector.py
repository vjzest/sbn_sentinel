from sqlalchemy import Column, Integer, String, DateTime  # type: ignore
from sqlalchemy.types import JSON  # type: ignore
from datetime import datetime
from app.db.database import Base


class ConnectorModel(Base):
    __tablename__ = "connectors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)

    # SES-005 Lifecycle States:
    # Configured, Authenticated, Connected, Synchronizing, Healthy, Warning, Retrying, Disconnected, Recovered
    status = Column(String, default="Configured")

    latency_ms = Column(Integer, default=50)
    last_sync = Column(DateTime, default=datetime.utcnow)
    config = Column(JSON, nullable=True)
    access_token = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
