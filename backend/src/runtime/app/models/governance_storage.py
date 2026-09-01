from sqlalchemy import Column, String, Text
from app.db.database import Base

class GovernanceStorageModel(Base):
    """Fallback storage for GovernanceRegistry to migrate away from pickle."""
    __tablename__ = "governance_storage"
    id = Column(String, primary_key=True)
    state_json = Column(Text, nullable=False)

class RecommendationModel(Base):
    __tablename__ = "governed_recommendations"
    recommendation_id = Column(String, primary_key=True)
    decision_context_id = Column(String, nullable=False)
    rule_evaluation_id = Column(String, nullable=False)
    journey_id = Column(String, nullable=False, index=True)
    mapping_id = Column(String, nullable=False)
    mapping_version = Column(String, nullable=False)
    content = Column(Text)
    status = Column(String)
    priority = Column(String)
    generated_at = Column(String)
    
class HumanDecisionModel(Base):
    __tablename__ = "governed_decisions"
    decision_id = Column(String, primary_key=True)
    recommendation_id = Column(String, nullable=False, index=True)
    journey_id = Column(String, nullable=False, index=True)
    actor_id = Column(String)
    decision_type = Column(String)
    status = Column(String)
    decision_timestamp = Column(String)
    
class OperationalActionModel(Base):
    __tablename__ = "governed_actions"
    action_id = Column(String, primary_key=True)
    authorization_reference = Column(String, nullable=False) # foreign key to decision
    journey_id = Column(String, nullable=False, index=True)
    action_type = Column(String)
    target_reference = Column(String)
    status = Column(String)
    created_at = Column(String)

class ExecutionAttemptModel(Base):
    __tablename__ = "governed_execution_attempts"
    attempt_id = Column(String, primary_key=True)
    action_id = Column(String, nullable=False)
    journey_id = Column(String, nullable=False, index=True)
    result = Column(String)
    attempt_timestamp = Column(String)
    
class OperationalOutcomeModel(Base):
    __tablename__ = "governed_outcomes"
    outcome_id = Column(String, primary_key=True)
    attempt_id = Column(String, nullable=False)
    journey_id = Column(String, nullable=False, index=True)
    operational_status = Column(String)
    closure_status = Column(String)
    timestamp = Column(String)
