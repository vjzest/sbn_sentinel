import pytest
from datetime import datetime
import uuid
from app.services.governance_registry import (
    governance_registry,
    RuleEvaluationRecord, RecommendationRecord, HumanDecisionRecord,
    OperationalActionRecord, ExecutionAttemptRecord, OperationalOutcomeRecord,
    RecommendationStatus, AuthorityRequirement, DecisionType, DecisionStatus,
    ActionType, ActionStatus, ExecutionResult, OutcomeConfirmationState, OutcomeResolutionState,
    ContinuityViolationError
)
from app.services.human_decision_engine import human_decision_engine
from app.services.operational_execution_engine import operational_execution_engine
from app.services.operational_outcome_engine import operational_outcome_engine

@pytest.fixture(autouse=True)
def clean_registry():
    """Reset the registry before each test."""
    governance_registry._evaluations = []
    governance_registry._recommendations = []
    governance_registry._human_decisions = []
    governance_registry._operational_actions = []
    governance_registry._execution_attempts = []
    governance_registry._operational_outcomes = []
    yield

def test_continuity_success():
    """SESR-008: Validates a full successful continuity chain where all journey_ids match."""
    journey_id = "JOURNEY-123"
    
    # 1. Manually insert evaluation
    eval_record = RuleEvaluationRecord(
        evaluation_id="EVAL-1",
        decision_context_id="CTX-1",
        policy_id="POL-1",
        policy_version="V1",
        rule_id="RULE-1",
        rule_version="V1",
        result="CONDITION_MET",
        journey_id=journey_id
    )
    governance_registry.record_evaluation(eval_record)
    
    # 2. Manually insert recommendation linked to evaluation
    rec_record = RecommendationRecord(
        recommendation_id="REC-1",
        mapping_id="MAP-1",
        mapping_version="V1",
        decision_context_id="CTX-1",
        rule_evaluation_id="EVAL-1",
        recommendation_content="Do something",
        status=RecommendationStatus.ACTIVE,
        authority_requirement=AuthorityRequirement.APPROVAL_REQUIRED,
        priority="High",
        journey_id=journey_id
    )
    governance_registry.record_recommendation(rec_record)
    
    # 3. Test HumanDecisionEngine continuity validation
    decision_payload = {
        "actor_id": "Dr. Smith",
        "actor_role": "Clinic Manager",
        "recommendation_id": "REC-1",
        "decision_type": "APPROVED",
        "reason": "Looks good",
        "journey_id": journey_id  # Matching journey
    }
    dec_result = human_decision_engine._process(decision_payload)
    assert dec_result["status"] == "SUCCESS", "Decision should succeed with valid continuity"
    decision_id = dec_result["decision_id"]
    
    # 4. Test OperationalExecutionEngine continuity validation
    action_result = operational_execution_engine.create_action(
        decision_id=decision_id,
        action_type_str="RESCHEDULE_APPOINTMENT",
        target_reference="APPT-1",
        parameters={"new_time": "2026-10-10"}
    )
    assert action_result["status"] == "SUCCESS", "Action should succeed inheriting journey_id"
    action_id = action_result["action_id"]
    
    # 5. Execute action to generate attempt (which inherits journey_id)
    exec_result = operational_execution_engine.execute_action(action_id)
    assert exec_result["status"] == "COMPLETED"
    
    # 6. Test Outcome Engine continuity validation
    outcome_result = operational_outcome_engine.process_outcome(
        action_id=action_id,
        observed_outcome={"target": "APPT-1", "status": "RESCHEDULED", "new_time": "2026-10-10"}
    )
    assert outcome_result["status"] == "SUCCESS"
    
    # Verify all records have the same journey_id
    assert governance_registry.get_human_decision(decision_id).journey_id == journey_id
    assert governance_registry.get_operational_action(action_id).journey_id == journey_id
    attempts = governance_registry.get_execution_attempts(action_id)
    assert attempts[0].journey_id == journey_id
    outcome = governance_registry.get_operational_outcome_by_action(action_id)
    assert outcome.journey_id == journey_id


def test_continuity_missing_parent():
    """SESR-008 CVC-031: Rejects child record if parent does not exist."""
    journey_id = "JOURNEY-123"
    
    with pytest.raises(ContinuityViolationError, match="does not exist in the registry"):
        governance_registry.validate_upstream_continuity(
            child_journey_id=journey_id,
            parent_id="FAKE-REC",
            parent_type="recommendation"
        )


def test_continuity_journey_mismatch():
    """SESR-008 CVC-031: Rejects child record if its journey_id differs from parent's journey_id."""
    parent_journey = "JOURNEY-A"
    child_journey = "JOURNEY-B"
    
    # Insert parent with Journey A
    rec_record = RecommendationRecord(
        recommendation_id="REC-A",
        mapping_id="MAP-1",
        mapping_version="V1",
        decision_context_id="CTX-1",
        rule_evaluation_id="EVAL-1",
        recommendation_content="Do something",
        status=RecommendationStatus.ACTIVE,
        authority_requirement=AuthorityRequirement.APPROVAL_REQUIRED,
        priority="High",
        journey_id=parent_journey
    )
    governance_registry.record_recommendation(rec_record)
    
    # Attempt to attach child with Journey B via Decision Engine
    decision_payload = {
        "actor_id": "Dr. Smith",
        "actor_role": "Clinic Manager",
        "recommendation_id": "REC-A",
        "decision_type": "APPROVED",
        "reason": "Approved",
        "journey_id": child_journey  # Mismatched journey
    }
    
    dec_result = human_decision_engine._process(decision_payload)
    assert dec_result["status"] == "ERROR"
    assert "CONTINUITY_VIOLATION" in dec_result["message"]
    assert "Journey identity mismatch" in dec_result["message"]


def test_continuity_no_ai_guessing():
    """
    SESR-008: Verifies that without a deterministic parent ID, the system
    does not attempt to guess or use a default parent.
    (If parent_id is missing, it explicitly raises an exception).
    """
    with pytest.raises(ContinuityViolationError, match="does not exist in the registry"):
        governance_registry.validate_upstream_continuity(
            child_journey_id="JOURNEY-X",
            parent_id=None,  # Invalid parent
            parent_type="decision"
        )
