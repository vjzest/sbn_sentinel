from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from app.db.database import Base

class ConnectorModel(Base):
    __tablename__ = "connectors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # EHR System, Billing, Voice, Telehealth, etc.
    status = Column(String, default="Connected")  # Connected, Syncing, Needs attention, Offline
    latency_ms = Column(Integer, default=50)
    last_sync = Column(DateTime, default=datetime.utcnow)
    config = Column(JSON, nullable=True)  # To store client credentials, api keys, webhook endpoints
