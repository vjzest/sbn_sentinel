from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from app.db.database import Base


class RuleModel(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String(50), unique=True, index=True)  # e.g. INS-001
    name = Column(String(200))
    category = Column(String(100))  # e.g. Insurance, Scheduling
    description = Column(Text)
    trigger_condition = Column(Text)
    severity = Column(String(50))  # Information, Low, Moderate, High, Critical
    business_impact = Column(Text)
    recommended_owner = Column(String(100))
    is_active = Column(Boolean, default=True)
    version = Column(String(20), default="1.0")
    created_at = Column(DateTime, default=datetime.utcnow)
    modified_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RuleExecutionLog(Base):
    __tablename__ = "rule_execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    rule_id = Column(String(50), index=True)
    input_source = Column(String(100))
    evaluation_result = Column(String(50))  # e.g. "Violation Detected"
    severity = Column(String(50))
    processing_duration_ms = Column(Integer)
    user_acknowledged = Column(Boolean, default=False)
