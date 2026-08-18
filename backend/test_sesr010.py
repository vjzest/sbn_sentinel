import pytest
import sys
import os
import uuid
import time
from datetime import datetime, timedelta

# Add backend dir to sys.path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src/runtime")))

from app.db.database import Base, engine, SessionLocal
from app.services.processing_orchestrator import processing_orchestrator
from app.services.reconstruction_engine import reconstruction_engine
from app.services.governance_registry import governance_registry, PolicyVersion, RuleVersion, LifecycleState

@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
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
    result = reconstruction_engine.reproduce_decision(event.id)
    
    assert result.status == "MATCH", f"Expected MATCH, got {result.status}. Diff: {result.diff}"


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
        version="V2", # NEW VERSION
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
    result = reconstruction_engine.reproduce_decision(event.id)
    
    assert result.status == "MATCH", "Reconstruction failed historical isolation. It was influenced by the V2 rule change."

