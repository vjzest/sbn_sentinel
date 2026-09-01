import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.database import Base


class PolicyModel(Base):
    """
    AIS-001: Represents an overarching intelligence policy.
    """
    __tablename__ = "policies"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    versions = relationship("PolicyVersionModel", back_populates="policy")


class PolicyVersionModel(Base):
    """
    AIS-001: Historical versions of a policy for reproducibility.
    """
    __tablename__ = "policy_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    policy_id = Column(String, ForeignKey("policies.id"), nullable=False)
    version = Column(String, nullable=False)
    content_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    policy = relationship("PolicyModel", back_populates="versions")


class RuleModel(Base):
    """
    AIS-001: Represents specific deterministic evaluation rules.
    """
    __tablename__ = "rules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    policy_id = Column(String, ForeignKey("policies.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    versions = relationship("RuleVersionModel", back_populates="rule")


class RuleVersionModel(Base):
    """
    AIS-001: Historical versions of a rule for reproducibility.
    """
    __tablename__ = "rule_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_id = Column(String, ForeignKey("rules.id"), nullable=False)
    version = Column(String, nullable=False)
    logic_definition = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    rule = relationship("RuleModel", back_populates="versions")


class GovernanceStatusModel(Base):
    """
    AIS-001: Records if an event passed or failed Governance boundaries.
    """
    __tablename__ = "governance_status"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False)  # e.g. Pass, Fail, Needs Human
    reason = Column(String, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow)


class RecommendationModel(Base):
    """
    AIS-001: Final output of intelligence meant for human review.
    """
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    status = Column(String, default="Pending Human Review")
    generated_at = Column(DateTime, default=datetime.utcnow)


class DecisionTraceModel(Base):
    """
    AIS-001: Complete trace of pipeline execution for explainability.
    """
    __tablename__ = "decision_trace"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, nullable=False, index=True)
    stage = Column(String, nullable=False)  # e.g. Validate, Governance, Rule Eval
    result = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class AuthorityLevelModel(Base):
    """
    AIS-001: Defines human authority requirements for actions.
    """
    __tablename__ = "authority_levels"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    level_name = Column(String, nullable=False, unique=True)  # e.g. Observation, Human Approval
    requires_override = Column(Boolean, default=False)
