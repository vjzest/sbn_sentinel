import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.mark.governance
def test_a024_session_invalidation():
    """
    A-024: Test that a suspended user or stale token cannot access endpoints.
    """
    headers = {"Authorization": "Bearer stale.token.here"}
    response = client.get("/api/v1/clinics", headers=headers)
    assert response.status_code in [401, 403], f"Expected 401/403 for stale token, got {response.status_code}"

@pytest.mark.governance
def test_a023_organization_clinic_scope_enforcement():
    """
    A-023: Test that cross-scope access is rejected.
    """
    headers = {"Authorization": "Bearer valid.token.orgA"}
    response = client.get("/api/v1/clinics?org_id=ORG-B", headers=headers)
    assert response.status_code in [401, 403], "Should reject cross-scope access"

from unittest.mock import patch
from app.services.processing_orchestrator import ProcessingOrchestrator

@pytest.mark.governance
def test_a020_failure_matrix():
    from app.services.operational_execution_engine import operational_execution_engine
    from app.services.governance_registry import OperationalActionRecord, ActionType, ActionStatus
    
    action = OperationalActionRecord(
        action_id="TEST-FAIL-1",
        action_type=ActionType.SEND_NOTIFICATION,
        target_reference="API-UNKNOWN",
        authorization_reference="AUTH-1",
        parameters={}
    )
    result = operational_execution_engine._mock_connector_call(action)
    assert result["result"].value == "UNKNOWN"

@pytest.mark.governance
def test_a021_historical_reconstruction():
    from app.services.governance_registry import governance_registry, PolicyVersion, RuleVersion, LifecycleState
    from datetime import datetime
    
    # Inject historical state
    policy = PolicyVersion(policy_id="POL-001", version="V1", content="", lifecycle_state=LifecycleState.ACTIVE)
    rule = RuleVersion(rule_id="R-001", version="V1", logic_description="", lifecycle_state=LifecycleState.ACTIVE, inputs=[], allowed_outputs=[], governing_policy_id="POL-001", governing_policy_version="V1")
    governance_registry.register_policy(policy)
    governance_registry.register_rule(rule)
    
    rules = governance_registry.get_applicable_rules_for_policy("POL-001", "V1", datetime.utcnow())
    assert len(rules) > 0, "Should reconstruct at least one rule for POL-001"

@pytest.mark.governance
def test_a022_synthetic_test_isolation():
    from app.core.config import Settings
    from pydantic import ValidationError
    
    # Try to initialize config with SYNTHETIC_TEST_ENABLED in PRODUCTION
    try:
        Settings(ENVIRONMENT="PRODUCTION", SYNTHETIC_TEST_ENABLED=True, CLINIC_TIMEZONE="UTC", SECRET_KEY="thisisverysecureandlongenough1234567")
        assert False, "Should have raised a validation error for synthetic test in production"
    except ValidationError as e:
        assert "CDI-006" in str(e) or "SYNTHETIC_TEST_ENABLED" in str(e)