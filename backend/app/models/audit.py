from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.database import Base

class AuditLogModel(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_email = Column(String, index=True)
    action = Column(String, index=True)
    resource = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, default="127.0.0.1")
