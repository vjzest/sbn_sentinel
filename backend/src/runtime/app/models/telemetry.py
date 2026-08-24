import uuid
from sqlalchemy import Column, String, DateTime, Integer
from datetime import datetime
from app.db.database import Base

class TelemetryLogModel(Base):
    """
    Operational Telemetry Logs (separated from governed Audit Logs).
    Stores system metrics, failures, and operational events.
    """
    __tablename__ = "telemetry_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_system = Column(String, index=True, nullable=True)
    module = Column(String, nullable=True)
    correlation_id = Column(String, index=True, nullable=True)
    
    error_category = Column(String, nullable=True)
    severity = Column(String, nullable=True)
    retry_attempts = Column(Integer, nullable=True)
    recovery_outcome = Column(String, nullable=True)
    resolution_status = Column(String, nullable=True)
