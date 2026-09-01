import uuid
from datetime import datetime
from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from app.db.database import Base


class DecisionRecordModel(Base):
    __tablename__ = "decision_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("pipeline_events.id"), index=True, nullable=False)

    # Audit Trail Information
    evidence = Column(JSON, nullable=True)         # Facts from Evidence Engine
    rule_id = Column(String(50), nullable=True)    # Rule matched
    policy_status = Column(String(50), nullable=True)  # E.g., PERMITTED, BLOCKED
    # Final recommendation from OIE (as JSON so we can store full payload if needed, or dict)
    recommendation = Column(JSON, nullable=True)

    # SESR-010 Historical Context Bindings
    policy_version = Column(String(50), nullable=True)
    rule_version = Column(String(50), nullable=True)
    mapping_version = Column(String(50), nullable=True)
    # The exact time the decision was originally evaluated
    evaluation_timestamp = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
