import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.database import Base


class EvidenceEvaluationModel(Base):
    """
    AIS-003: Stores the result of an evaluation run on a specific Decision Context Package.
    """
    __tablename__ = "eere_evidence_evaluations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    context_id = Column(String, nullable=False, index=True)
    overall_status = Column(String, nullable=False) # e.g. Sufficient, Insufficient
    evaluated_at = Column(DateTime, default=datetime.utcnow)


class EvaluationPackageModel(Base):
    """
    AIS-003: The final serialized Evaluation Package sent downstream.
    """
    __tablename__ = "eere_evaluation_packages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String, nullable=False, index=True)
    context_id = Column(String, nullable=False)
    payload = Column(Text, nullable=False) # Stored as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)


class EvaluationStatusModel(Base):
    """
    AIS-003: Tracks individual stages of the evaluation (e.g. Completeness, Freshness).
    """
    __tablename__ = "eere_evaluation_status"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String, nullable=False, index=True)
    stage_name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    details = Column(String, nullable=True)


class GovernanceResultsModel(Base):
    """
    AIS-003: Governance outcome for an evaluation package.
    """
    __tablename__ = "eere_governance_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String, nullable=False, index=True)
    passed = Column(Boolean, default=False)
    block_reason = Column(String, nullable=True)


class DependencyAnalysisModel(Base):
    """
    AIS-003: Tracks if upstream evidence supports downstream conclusions.
    """
    __tablename__ = "eere_dependency_analysis"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String, nullable=False, index=True)
    is_valid = Column(Boolean, default=True)
    invalid_dependency_details = Column(String, nullable=True)


class EvaluationHistoryModel(Base):
    """
    AIS-003: Tracks historical evaluation runs for auditability.
    """
    __tablename__ = "eere_evaluation_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
