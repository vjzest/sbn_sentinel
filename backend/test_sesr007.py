import sys
import uuid
from datetime import datetime, timedelta
from app.services.governance_registry import (
    governance_registry, RecommendationStatus, AuthorityRequirement,
    RecommendationRecord, DecisionType, DecisionStatus, HumanDecisionRecord,
    ActionType, ActionStatus, ExecutionResult, OperationalActionRecord,
    OutcomeConfirmationState, OutcomeResolutionState, OperationalOutcomeRecord
)
from app.services.operational_execution_engine import operational_execution_engine
from app.services.operational_outcome_engine import operational_outcome_engine

def setup_mock_action():
    uid = uuid.uuid4().hex[:6]
    dec_id = f"HD-TEST-{uid}"
    # Setup action directly for testing
    action_id = f"ACT-TEST-{uid}"
    action = OperationalActionRecord(
        action_id=action_id,
        action_type=ActionType.RESCHEDULE_APPOINTMENT,
        target_reference="APT-12345",
        authorization_reference=dec_id,
        parameters={"new_time": "11:30 AM"},
        status=ActionStatus.COMPLETED,
        current_result=ExecutionResult.SUCCESS,
        journey_id="JRN-TEST-777"
    )
    governance_registry.record_operational_action(action)
    return action_id

def test_execution_success_is_not_outcome_success():
    """Execution Success != Outcome Success"""
    action_id = setup_mock_action()
    
    # Observe PENDING outcome
    res = operational_outcome_engine.process_outcome(
        action_id=action_id,
        observed_outcome={"status": "PENDING_RESCHEDULE"},
        source_reference="WEBHOOK_001"
    )
    
    assert res["status"] == "SUCCESS"
    assert res["confirmation_state"] == OutcomeConfirmationState.MISMATCH.value
    assert res["resolution_state"] == OutcomeResolutionState.UNRESOLVED.value

def test_confirmed_match_outcome():
    """Confirmed Match transitions to RESOLVED"""
    action_id = setup_mock_action()
    
    res = operational_outcome_engine.process_outcome(
        action_id=action_id,
        observed_outcome={"target": "APT-12345", "status": "RESCHEDULED", "new_time": "11:30 AM"},
        source_reference="WEBHOOK_002"
    )
    
    assert res["status"] == "SUCCESS"
    assert res["confirmation_state"] == OutcomeConfirmationState.CONFIRMED.value
    assert res["resolution_state"] == OutcomeResolutionState.RESOLVED.value

def test_unknown_outcome():
    """Unknown or empty observation results in UNKNOWN / OPEN"""
    action_id = setup_mock_action()
    
    res = operational_outcome_engine.process_outcome(
        action_id=action_id,
        observed_outcome={},
        source_reference="SYSTEM_POLL"
    )
    
    assert res["status"] == "SUCCESS"
    assert res["confirmation_state"] == OutcomeConfirmationState.UNKNOWN.value
    assert res["resolution_state"] == OutcomeResolutionState.OPEN.value

def test_stale_event_protection():
    """Once resolved, stale events should be ignored"""
    action_id = setup_mock_action()
    
    # 1. Resolve it
    res1 = operational_outcome_engine.process_outcome(
        action_id=action_id,
        observed_outcome={"target": "APT-12345", "status": "RESCHEDULED", "new_time": "11:30 AM"}
    )
    assert res1["resolution_state"] == OutcomeResolutionState.RESOLVED.value
    
    # 2. Try to update it with an older or stale event
    res2 = operational_outcome_engine.process_outcome(
        action_id=action_id,
        observed_outcome={"target": "APT-12345", "status": "PENDING"}
    )
    
    assert res2["status"] == "IGNORED"
    assert "already resolved" in res2["message"]

def test_closure_bypass_protection():
    """Simulate manual attempt to bypass closure logic. In this architecture,
    it should be impossible because the engine is the only way to transition state."""
    action_id = setup_mock_action()
    
    # We can only process outcomes via the engine. If we try to provide
    # a partial outcome, it stays UNRESOLVED.
    res = operational_outcome_engine.process_outcome(
        action_id=action_id,
        observed_outcome={"target": "APT-12345", "status": "FAILED_RESCHEDULE"}
    )
    
    assert res["confirmation_state"] == OutcomeConfirmationState.MISMATCH.value
    assert res["resolution_state"] == OutcomeResolutionState.UNRESOLVED.value
    
    outcome = governance_registry.get_operational_outcome(res["outcome_id"])
    assert outcome.resolution_state != OutcomeResolutionState.RESOLVED

if __name__ == "__main__":
    print("Running SESR-007 Tests...")
    test_execution_success_is_not_outcome_success()
    print("test_execution_success_is_not_outcome_success PASSED")
    test_confirmed_match_outcome()
    print("test_confirmed_match_outcome PASSED")
    test_unknown_outcome()
    print("test_unknown_outcome PASSED")
    test_stale_event_protection()
    print("test_stale_event_protection PASSED")
    test_closure_bypass_protection()
    print("test_closure_bypass_protection PASSED")
    print("All SESR-007 tests passed successfully!")
