"""
SES-004: Database & Domain Model Architecture
Domain 3 - Intelligence
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class RuleFindingModel(Base):
    """
    Stores the output of the Rules Engine.
    One OperationalEvent -> Many RuleFindings
    """
    __tablename__ = "intel_rule_findings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("pipeline_events.id"), nullable=False, index=True)
    rule_id = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    description = Column(String, nullable=False)
    evaluation_id = Column(String, nullable=True)
    evaluation_timestamp = Column(DateTime, default=datetime.utcnow)

    event = relationship("OperationalEventModel", back_populates="rule_findings")


class DecisionContextModel(Base):
    """
    Captures why an operational condition exists.
    One OperationalEvent -> One DecisionContext
    """
    __tablename__ = "intel_decision_contexts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("pipeline_events.id"), nullable=False, unique=True)
    primary_context = Column(String, nullable=False)
    secondary_context = Column(String, nullable=True)
    evidence_state = Column(String, nullable=True)  # JSON serialized evidence
    reason = Column(String, nullable=True)
    generated_timestamp = Column(DateTime, default=datetime.utcnow)

    event = relationship("OperationalEventModel", back_populates="decision_context")


class OperationalIntelligenceModel(Base):
    """
    Stores actionable operational insights.
    One OperationalEvent -> One OperationalIntelligence
    """
    __tablename__ = "intel_operational"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("pipeline_events.id"), nullable=False, unique=True)
    priority = Column(String, nullable=False)  # e.g. High, Medium, Low
    operational_impact = Column(String, nullable=True)
    recommendation = Column(String, nullable=True)
    status = Column(String, default="Generated")  # Generated, Acknowledged, Dismissed

    event = relationship("OperationalEventModel", back_populates="operational_intelligence")


class RevenueIntelligenceModel(Base):
    """
    Represents financial implications of operational conditions.
    One OperationalEvent -> One RevenueIntelligence
    """
    __tablename__ = "intel_revenue"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("pipeline_events.id"), nullable=False, unique=True)
    estimated_exposure = Column(String, nullable=True)  # E.g., "$150.00"
    opportunity_category = Column(String, nullable=True)  # e.g., "Revenue Loss"
    financial_priority = Column(String, nullable=True)

    event = relationship("OperationalEventModel", back_populates="revenue_intelligence")
