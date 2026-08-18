import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.database import Base


class ExplanationPackageModel(Base):
    """
    AIS-005: The final structural package representing a complete, transparent explanation.
    """
    __tablename__ = "exp_explanation_packages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    payload = Column(Text, nullable=False) # Stored as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)


class DecisionTraceModel(Base):
    """
    AIS-005: High level mapping connecting a Recommendation back to its Context and Evaluation.
    """
    __tablename__ = "exp_decision_trace"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    evaluation_id = Column(String, nullable=False)
    context_id = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class EvidenceTraceModel(Base):
    """
    AIS-005: Traces the specific pieces of evidence that influenced the recommendation.
    """
    __tablename__ = "exp_evidence_trace"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String, nullable=False, index=True) # Links to DecisionTraceModel
    evidence_id = Column(String, nullable=False)
    influence_type = Column(String, nullable=False) # e.g. "Primary Driver", "Supporting Fact"


class PolicyTraceModel(Base):
    """
    AIS-005: Traces the organizational policy applied to the decision.
    """
    __tablename__ = "exp_policy_trace"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String, nullable=False, index=True)
    policy_id = Column(String, nullable=False)
    policy_version = Column(String, nullable=False)


class RuleTraceModel(Base):
    """
    AIS-005: Traces the specific rule and threshold triggered.
    """
    __tablename__ = "exp_rule_trace"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String, nullable=False, index=True)
    rule_id = Column(String, nullable=False)
    rule_version = Column(String, nullable=False)
    threshold_evaluated = Column(String, nullable=True)
    threshold_result = Column(String, nullable=True)


class AuthorityTraceModel(Base):
    """
    AIS-005: Documents the authority constraints under which the decision was made.
    """
    __tablename__ = "exp_authority_trace"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String, nullable=False, index=True)
    authority_level = Column(String, nullable=False)
    human_approval_requirement = Column(Boolean, default=True)


class RecommendationExplanationModel(Base):
    """
    AIS-005: Translates technical rule mappings into human-readable operational reasoning.
    """
    __tablename__ = "exp_recommendation_explanations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    human_readable_reasoning = Column(Text, nullable=False)
    alternatives_considered = Column(Text, nullable=True) # JSON list
