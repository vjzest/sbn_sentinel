import pytest
from datetime import datetime
from app.services.governance_registry import (
    governance_registry, RecommendationStatus, AuthorityRequirement,
    RecommendationRecord, DecisionType, DecisionStatus
)
from app.services.human_decision_engine import human_decision_engine

def setup_mock_recommendation():
    # Insert a dummy recommendation for testing
    rec_id = "REC-TEST-999"
    rec = RecommendationRecord(
        recommendation_id=rec_id,
        mapping_id="MAP-TEST",
        mapping_version="V1",
        decision_context_id="CTX-TEST",
        rule_evaluation_id="EVAL-TEST",
        recommendation_content="Review this",
        status=RecommendationStatus.ACTIVE,
        authority_requirement=AuthorityRequirement.APPROVAL_REQUIRED,
        priority="High",
        journey_id="JRN-TEST-555"
    )
    governance_registry.record_recommendation(rec)
    return rec_id

def test_sesr005_authorized_approval():
    rec_id = setup_mock_recommendation()
    
    # Clinic Manager has APPROVE permission
    payload = {
        "actor_id": "USER-CM",
        "actor_role": "Clinic Manager",
        "recommendation_id": rec_id,
        "decision_type": "APPROVED",
        "journey_id": "JRN-TEST-555"
    }
    
    result = human_decision_engine._process(payload)
    
    assert result["status"] == "SUCCESS"
    assert result.get("decision_id") is not None

def test_sesr005_unauthorized_override():
    rec_id = setup_mock_recommendation()
    
    # Front Desk does NOT have override permission
    payload = {
        "actor_id": "USER-FD",
        "actor_role": "Front Desk",
        "recommendation_id": rec_id,
        "decision_type": "OVERRIDDEN"
    }
    
    result = human_decision_engine._process(payload)
    
    assert result["status"] == "ERROR"
    assert "NOT AUTHORIZED" in result["message"] or "OVERRIDE PERMISSION" in result["message"]

def test_sesr005_missing_reason_rejection():
    rec_id = setup_mock_recommendation()
    
    # Clinic Manager has REJECT permission, but reason is required
    payload = {
        "actor_id": "USER-CM",
        "actor_role": "Clinic Manager",
        "recommendation_id": rec_id,
        "decision_type": "REJECTED"
        # missing reason
    }
    
    result = human_decision_engine._process(payload)
    
    assert result["status"] == "ERROR"
    assert "reason is required" in result["message"]

def test_sesr005_idempotent_duplicate():
    rec_id = setup_mock_recommendation()
    
    payload = {
        "actor_id": "USER-CM",
        "actor_role": "Clinic Manager",
        "recommendation_id": rec_id,
        "decision_type": "APPROVED",
        "journey_id": "JRN-TEST-555"
    }
    
    # First attempt
    res1 = human_decision_engine._process(payload)
    assert res1["status"] == "SUCCESS"
    
    # Duplicate attempt
    res2 = human_decision_engine._process(payload)
    assert res2["status"] == "SUCCESS"
    assert res2["decision_id"] == res1["decision_id"]
    assert "already recorded" in res2["message"]

def test_sesr005_invalid_recommendation():
    # Insert expired recommendation
    rec_id = "REC-TEST-EXPIRED"
    rec = RecommendationRecord(
        recommendation_id=rec_id,
        mapping_id="MAP-TEST",
        mapping_version="V1",
        decision_context_id="CTX-TEST",
        rule_evaluation_id="EVAL-TEST",
        recommendation_content="Expired Action",
        status=RecommendationStatus.EXPIRED,
        authority_requirement=AuthorityRequirement.APPROVAL_REQUIRED,
        priority="High",
        journey_id="JRN-TEST-555"
    )
    governance_registry.record_recommendation(rec)
    
    payload = {
        "actor_id": "USER-CM",
        "actor_role": "Clinic Manager",
        "recommendation_id": rec_id,
        "decision_type": "APPROVED",
        "journey_id": "JRN-TEST-555"
    }
    
    result = human_decision_engine._process(payload)
    
    assert result["status"] == "ERROR"
    assert "not decision-eligible" in result["message"]

if __name__ == "__main__":
    pytest.main(["-v", "test_sesr005.py"])
