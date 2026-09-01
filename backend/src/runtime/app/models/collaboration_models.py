import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from app.db.database import Base

"""
SESR-012C / CCA-003: Collaboration Engine Legacy Reference
The Collaboration Engine is NOT required for the approved deterministic V1 lifecycle.
This file (collaboration_models.py) is retained solely for legacy context and as
Future Scope for V2. It does not establish a V1 Collaboration Engine.
"""


class CollabApprovalsModel(Base):
    """
    AIS-006: Core table tracking the human approval state of a recommendation.
    """
    __tablename__ = "collab_approvals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, default="Awaiting Review")
    required_authority_level = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class CollabApprovalHistoryModel(Base):
    """
    AIS-006: Tracks the chronological history of approval state changes.
    """
    __tablename__ = "collab_approval_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    approval_id = Column(String, nullable=False, index=True)
    previous_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    actor_id = Column(String, nullable=True)  # ID of user taking action
    timestamp = Column(DateTime, default=datetime.utcnow)


class CollabOverridesModel(Base):
    """
    AIS-006: Human Override Intelligence. Records when a human overrides the standard
    authority matrix or recommendation.
    """
    __tablename__ = "collab_overrides"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    actor_id = Column(String, nullable=False)
    authority_level = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class CollabOverrideReasonsModel(Base):
    """
    AIS-006: Captures the operational reason/justification for an override.
    """
    __tablename__ = "collab_override_reasons"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    override_id = Column(String, nullable=False, index=True)
    reason_code = Column(String, nullable=False)
    justification_text = Column(Text, nullable=True)


class CollabTimelineModel(Base):
    """
    AIS-006: Collaboration Timeline. A unified chronological record of all events
    for complete auditability.
    """
    __tablename__ = "collab_timeline"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)  # e.g. "Review Started", "Override Recorded"
    actor_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class CollabHumanDecisionsModel(Base):
    """
    AIS-006: The final explicit decision made by the authorized human.
    """
    __tablename__ = "collab_human_decisions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(String, nullable=False, index=True)
    decision = Column(String, nullable=False)  # e.g. "Approved", "Rejected", "Deferred"
    actor_id = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class CollabAuthorityAssignmentsModel(Base):
    """
    AIS-006: Matrix mapping of roles/users to their respective authority levels.
    """
    __tablename__ = "collab_authority_assignments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_id = Column(String, nullable=False)  # User ID or Role ID
    authority_level = Column(String, nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)


class CollabDelegationRecordsModel(Base):
    """
    AIS-006: Tracks temporary or permanent delegation of decision authority.
    """
    __tablename__ = "collab_delegation_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    delegator_id = Column(String, nullable=False)
    delegatee_id = Column(String, nullable=False)
    authority_level = Column(String, nullable=False)
    active_until = Column(DateTime, nullable=True)
