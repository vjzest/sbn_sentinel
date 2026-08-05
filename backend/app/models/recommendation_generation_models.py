import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.database import Base


class RgeRecommendationModel(Base):
    """
    AIS-004: Primary recommendation object representing operational guidance.
    """
    __tablename__ = "rge_recommendations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    context_id = Column(String, nullable=False, index=True)
    evaluation_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g. Operational, Administrative, Governance
    operational_objective = Column(String, nullable=False)


class RgeRecommendationPackageModel(Base):
    """
    AIS-004: The finalized Recommendation Package produced by RGE for downstream systems.
    """
    __tablename__ = "rge_recommendation_packages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    payload = Column(Text, nullable=False) # Stored as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)


class RgeRecommendationStatusModel(Base):
    """
    AIS-004: Tracks the lifecycle state of a recommendation.
    Generated -> Pending Review -> Approved -> Rejected -> Expired
    """
    __tablename__ = "rge_recommendation_status"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, default="Generated")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RgeRecommendationPriorityModel(Base):
    """
    AIS-004: Captures the operational urgency of the recommendation.
    """
    __tablename__ = "rge_recommendation_priority"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    priority_level = Column(String, nullable=False) # e.g. Critical, High, Medium, Low
    justification = Column(String, nullable=True)


class RgeRecommendationExpirationModel(Base):
    """
    AIS-004: Tracks when a recommendation is no longer valid.
    """
    __tablename__ = "rge_recommendation_expiration"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    is_expired = Column(Boolean, default=False)


class RgeRecommendationDependenciesModel(Base):
    """
    AIS-004: Tracks what rules and policies drove this recommendation.
    """
    __tablename__ = "rge_recommendation_dependencies"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    policy_id = Column(String, nullable=True)
    rule_id = Column(String, nullable=True)
    threshold_satisfied = Column(Boolean, default=True)


class RgeRecommendationHistoryModel(Base):
    """
    AIS-004: Tracks historical modifications to recommendations for auditability.
    """
    __tablename__ = "rge_recommendation_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
