import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.database import Base


class ContextEvidenceModel(Base):
    """
    AIS-002: Stores the evidence items forming a specific context.
    """
    __tablename__ = "dce_context_evidence"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    context_id = Column(String, nullable=False, index=True)
    evidence_type = Column(String, nullable=False)
    evidence_value = Column(String, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)


class ContextRelationshipsModel(Base):
    """
    AIS-002: Maps relationships between evidence points.
    """
    __tablename__ = "dce_context_relationships"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    context_id = Column(String, nullable=False, index=True)
    source_evidence_id = Column(String, nullable=False)
    target_evidence_id = Column(String, nullable=False)
    relationship_type = Column(String, nullable=False) # e.g. "Causes", "Depends On"


class ContextConflictsModel(Base):
    """
    AIS-002: Tracks conflicting evidence points discovered during context building.
    """
    __tablename__ = "dce_context_conflicts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    context_id = Column(String, nullable=False, index=True)
    evidence_a_id = Column(String, nullable=False)
    evidence_b_id = Column(String, nullable=False)
    conflict_description = Column(String, nullable=False)
    resolution_status = Column(String, default="Unresolved")


class ContextMissingEvidenceModel(Base):
    """
    AIS-002: Tracks identified gaps in evidence.
    """
    __tablename__ = "dce_context_missing_evidence"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    context_id = Column(String, nullable=False, index=True)
    expected_evidence_type = Column(String, nullable=False)
    impact_level = Column(String, default="Low")


class ContextFreshnessModel(Base):
    """
    AIS-002: Stores evaluation of how stale/fresh the evidence is.
    """
    __tablename__ = "dce_context_freshness"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    context_id = Column(String, nullable=False, index=True)
    evidence_id = Column(String, nullable=False)
    age_seconds = Column(String, nullable=False)
    is_stale = Column(Boolean, default=False)


class ContextProvenanceModel(Base):
    """
    AIS-002: Tracks the origin/source of the evidence.
    """
    __tablename__ = "dce_context_provenance"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    context_id = Column(String, nullable=False, index=True)
    evidence_id = Column(String, nullable=False)
    source_system = Column(String, nullable=False) # e.g. "Practice Fusion", "Manual Input"
    ingestion_timestamp = Column(DateTime, default=datetime.utcnow)
