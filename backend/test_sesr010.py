import app.models.canonical
import app.models.intelligence
import app.models.decision_record
import app.models.event
import app.models.governance_storage
import app.models.decision_context_models
import app.main  # Ensure all models are loaded for create_all
from app.services.governance_registry import governance_registry, PolicyVersion, RuleVersion, LifecycleState
from app.services.reconstruction_engine import reconstruction_engine
from app.services.processing_orchestrator import processing_orchestrator
from app.db.database import Base, engine, SessionLocal
import pytest
import sys
import os
import uuid
import time
from datetime import datetime, timedelta

# Add backend dir to sys.path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src/runtime")))


@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # Clear registry for testing isolation
    governance_registry._policies = []
    governance_registry._rules = []
    governance_registry._recommendation_mappings = []

    from app.services.governance_registry import initialize_registry_seeds
    initialize_registry_seeds()

    yield
    Base.metadata.drop_all(bind=engine)


def test_sesr010_deterministic_reconstruction_match(setup_db):
    """
    Scenario 1: Generate a normal decision, run reconstruction, assert MATCH.
    """
    # 1. Trigger normal event
    raw_payload = {
        "event_type": "EHR",
        "detail": "no-show",
        "primary_context": "Operational",
        "secondary_context": "Provider Schedule Gap"
    }

    event = processing_orchestrator.create_event(
        event_type="EHR",
        source="EHR_SYSTEM",
        raw_payload=raw_payload,
        priority="High"
    )

    # 2. Process it
    processing_orchestrator.process_event_background(event.id)

    # 3. Reconstruct
    db = SessionLocal()
    from app.models.governance_storage import RecommendationModel
    rec = db.query(RecommendationModel).filter(RecommendationModel.journey_id == event.correlation_id).first()
    db.close()
    assert rec is not None, "No recommendation generated for journey"

    result = reconstruction_engine.reproduce_decision(rec.recommendation_id)

    assert result.status == "MATCH", f"Expected MATCH, got {result.status}. Diff: {result.differences}"


def test_sesr010_historical_isolation_after_logic_change(setup_db):
    """
    Scenario 2: Generate a decision, then CHANGE the active rule in the registry.
    Reconstruction MUST still return MATCH because it binds to the historical rule version.
    """
    # 1. Trigger event
    raw_payload = {
        "event_type": "EHR",
        "detail": "no-show",
        "primary_context": "Operational",
        "secondary_context": "Provider Schedule Gap"
    }

    event = processing_orchestrator.create_event(
        event_type="EHR",
        source="EHR_SYSTEM",
        raw_payload=raw_payload,
        priority="High"
    )

    processing_orchestrator.process_event_background(event.id)

    # 2. Modify the Governance Registry by superseding the rule with a new V2
    # The active V1 is now V2
    new_rule = RuleVersion(
        rule_id="RULE-SCH-001",
        version="V2",  # NEW VERSION
        logic_description="Flag patient no-show gaps in schedule - V2 MODIFIED",
        lifecycle_state=LifecycleState.ACTIVE,
        governing_policy_id="POL-001",
        governing_policy_version="V1",
        inputs=[],
        allowed_outputs=[],
        effective_from=datetime.utcnow()
    )
    governance_registry.register_rule(new_rule)

    # 3. Reconstruct the historical decision
    # It must bind to V1, not V2, and therefore still MATCH
    db = SessionLocal()
    from app.models.governance_storage import RecommendationModel
    rec = db.query(RecommendationModel).filter(RecommendationModel.journey_id == event.correlation_id).first()
    db.close()
    assert rec is not None, "No recommendation generated for journey"

    result = reconstruction_engine.reproduce_decision(rec.recommendation_id)

    assert result.status == "MATCH", "Reconstruction failed historical isolation. It was influenced by the V2 rule change."
