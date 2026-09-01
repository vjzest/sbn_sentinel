"""
SES-002: Internal Data Flow & Event Processing Specification
Event ORM Model — The central state record for every event in the pipeline.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, JSON, Float, Text
from sqlalchemy.orm import relationship
from app.models.signal import Base


class OperationalEventModel(Base):
    """
    Represents a single Sentinel Event as it travels through the pipeline.
    Domain 2 - Operational Events
    """
    __tablename__ = "pipeline_events"

    # --- Identity ---
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    correlation_id = Column(String, index=True, nullable=True)  # Groups related events

    # --- Classification ---
    event_type = Column(String, nullable=False)        # e.g., EHR, Phone, Email, System
    source = Column(String, nullable=False)            # e.g., Practice Fusion, Twilio
    priority = Column(String, default="Normal")        # Critical, High, Normal, Low

    # --- Payload ---
    raw_payload = Column(JSON, nullable=True)          # Original data from connector

    # --- State Machine ---
    # Valid states: Idle, Waiting, Running, Completed, Failed, Retrying, Cancelled
    state = Column(String, default="Waiting")

    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    last_error = Column(Text, nullable=True)

    # --- Pipeline Layer Results (SES-004 Relational Links) ---
    rule_findings = relationship(
        "RuleFindingModel",
        back_populates="event",
        cascade="all, delete-orphan")
    decision_context = relationship(
        "DecisionContextModel",
        back_populates="event",
        uselist=False,
        cascade="all, delete-orphan")
    operational_intelligence = relationship(
        "OperationalIntelligenceModel",
        back_populates="event",
        uselist=False,
        cascade="all, delete-orphan")
    revenue_intelligence = relationship(
        "RevenueIntelligenceModel",
        back_populates="event",
        uselist=False,
        cascade="all, delete-orphan")

    layer7_storage_ref = Column(String, nullable=True)      # Reference to stored signal ID
    layer8_published = Column(String, nullable=True)        # "dashboard", "api", etc.

    # --- Observability ---
    received_at = Column(DateTime, default=datetime.utcnow)
    validated_at = Column(DateTime, nullable=True)
    processing_started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)

    # Per-layer timing (milliseconds)
    layer2_duration_ms = Column(Float, nullable=True)
    layer3_duration_ms = Column(Float, nullable=True)
    layer4_duration_ms = Column(Float, nullable=True)
    layer5_duration_ms = Column(Float, nullable=True)
    layer6_duration_ms = Column(Float, nullable=True)
    layer7_duration_ms = Column(Float, nullable=True)
    layer8_duration_ms = Column(Float, nullable=True)

    # --- Ownership ---
    initiated_by = Column(String, default="system")    # user email or "system"

    def total_duration_ms(self) -> float:
        """Total processing time from received to completed."""
        if self.received_at and self.completed_at:
            delta = self.completed_at - self.received_at
            return delta.total_seconds() * 1000
        return 0.0

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "correlation_id": self.correlation_id,
            "event_type": self.event_type,
            "source": self.source,
            "priority": self.priority,
            "state": self.state,
            "retry_count": self.retry_count,
            "last_error": self.last_error,
            "received_at": self.received_at.isoformat() if self.received_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "failed_at": self.failed_at.isoformat() if self.failed_at else None,
            "total_duration_ms": self.total_duration_ms(),

            # Reconstruct legacy output structure for API compatibility
            "layer3_rules_output": {
                "rule_id": rf.rule_id, "severity": rf.severity, "description": rf.description
            } if self.rule_findings and (rf := self.rule_findings[0]) else None,

            "layer4_context_output": {
                "primary_context": self.decision_context.primary_context,
                "secondary_context": self.decision_context.secondary_context,
                "confidence": self.decision_context.confidence,
                "reason": self.decision_context.reason
            } if self.decision_context else None,

            "layer5_intelligence_output": {
                "risk_level": self.operational_intelligence.priority,
                "business_impact": self.operational_intelligence.operational_impact,
                "action": self.operational_intelligence.recommendation,
                "status": self.operational_intelligence.status
            } if self.operational_intelligence else None,

            "layer6_revenue_output": {
                "estimated_financial_exposure": self.revenue_intelligence.estimated_exposure,
                "revenue_risk_category": self.revenue_intelligence.opportunity_category,
                "revenue_confidence": self.revenue_intelligence.financial_priority
            } if self.revenue_intelligence else None,

            "layer7_storage_ref": self.layer7_storage_ref,
            "layer8_published": self.layer8_published,
        }
