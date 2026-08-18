import uuid
from sqlalchemy import Column, String, DateTime, Integer
from datetime import datetime
from app.db.database import Base

class AuditLogModel(Base):
    """
    SES-004: Domain 6 - Audit
    Stores complete platform history. Records are append-only.
    """
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_system = Column(String, index=True, nullable=False) # Maps to User/System
    action = Column(String, index=True, nullable=False)
    module = Column(String, nullable=True)
    correlation_id = Column(String, index=True, nullable=True)

    # SES-007: Failure Telemetry
    error_category = Column(String, nullable=True)
    severity = Column(String, nullable=True)
    retry_attempts = Column(Integer, nullable=True)
    recovery_outcome = Column(String, nullable=True)
    resolution_status = Column(String, nullable=True)
