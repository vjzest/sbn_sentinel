import pytest
from datetime import datetime
from typing import Dict, Any

from app.services.governance_registry import (
    governance_registry, RecommendationStatus, AuthorityRequirement,
    RecommendationMapping
)
from app.services.intelligence_engine import intelligence_engine

def test_sesr004_safe_non_generation():
    """
    RGV-031: Safe Non-Generation.
    If no governed mapping exists for a rule result, do not invent a recommendation.
    """
    payload = {
        "finding": {"rule_id": "UNKNOWN_RULE", "severity": "CONDITION_MET"},
        "context": {"primary_context": "Test"}
    }
    
    result = intelligence_engine._process(payload)
    
    # Should safely return NO_RECOMMENDATION
    assert result["action"] == "NO_RECOMMENDATION"
    assert result["recommendation"] == "NO_RECOMMENDATION"
    assert result["problem"] == "Unmapped Event"

def test_sesr004_deterministic_mapping():
    """
    RGV-005: Deterministic Mapping Resolution.
    Verify that mapped rules return the exact governed recommendation.
    """
    payload = {
        "finding": {"rule_id": "RULE-SCH-001", "severity": "CONDITION_MET"},
        "context": {"primary_context": "Test"}
    }
    
    result = intelligence_engine._process(payload)
    
    # Should resolve to REC-MAP-001
    assert "Auto-send SMS reschedule link" in result["action"]
    assert "Patient No-Show" in result["problem"]
    assert "Governed Mapping REC-MAP-001" in result["reason"]
    
def test_sesr004_not_evaluable_handling():
    """
    RGV-008: NOT_EVALUABLE Handling.
    Only generate recommendation if explicitly mapped.
    """
    payload = {
        "finding": {"rule_id": "RULE-SCH-001", "severity": "NOT_EVALUABLE"},
        "context": {"primary_context": "Test"}
    }
    
    result = intelligence_engine._process(payload)
    
    # Should resolve to REC-MAP-004
    assert "Request Human Review" in result["action"]
    assert "Unverifiable Schedule Context" in result["problem"]
    assert "Governed Mapping REC-MAP-004" in result["reason"]

def test_sesr004_persisted_record():
    """
    RCO-001: Recommendation Record identity & tracking.
    """
    initial_count = len(governance_registry._recommendations)
    
    payload = {
        "finding": {"rule_id": "RULE-SCH-002", "severity": "CONDITION_MET"},
        "context": {"id": "CTX-999", "primary_context": "Test"}
    }
    
    intelligence_engine._process(payload)
    
    final_count = len(governance_registry._recommendations)
    assert final_count == initial_count + 1
    
    latest_rec = governance_registry._recommendations[-1]
    assert latest_rec.mapping_id == "REC-MAP-002"
    assert latest_rec.decision_context_id == "CTX-999"
    assert latest_rec.status == RecommendationStatus.ACTIVE
    assert latest_rec.authority_requirement == AuthorityRequirement.REVIEW_REQUIRED

if __name__ == "__main__":
    pytest.main(["-v", "test_sesr004.py"])
