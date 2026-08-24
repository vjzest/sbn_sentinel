import uuid
from sqlalchemy import Column, String, DateTime, Integer, event
from sqlalchemy.exc import InvalidRequestError
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



@event.listens_for(AuditLogModel, 'before_update')
def receive_before_update(mapper, connection, target):
    raise InvalidRequestError("AuditLogModel records are append-only and cannot be updated.")

@event.listens_for(AuditLogModel, 'before_delete')
def receive_before_delete(mapper, connection, target):
    raise InvalidRequestError("AuditLogModel records are append-only and cannot be deleted.")
