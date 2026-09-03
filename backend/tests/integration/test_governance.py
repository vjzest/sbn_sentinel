
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.mark.governance
def test_a024_session_invalidation():
    """
    A-024: Test that a suspended user or stale token cannot access endpoints.
    """
    from app.db.database import SessionLocal
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    import uuid

    db = SessionLocal()
    test_email = f"e2e_{uuid.uuid4().hex[:6]}@sbnsentinel.com"
    user = User(
        email=test_email,
        hashed_password=get_password_hash("Test@123"),
        full_name="Suspension Test",
        role=UserRole.SYSTEM_ADMINISTRATOR.value,
        is_active=True
    )
    db.add(user)
    db.commit()

    try:
        # 1. Login
        res = client.post("/api/v1/auth/login", json={"email": test_email, "password": "Test@123"})
        assert res.status_code == 200, "Login failed"
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Access Protected Route (Should Succeed)
        clinics_res = client.get("/api/v1/clinics", headers=headers)
        assert clinics_res.status_code == 200, "Protected route access failed"

        # 3. Suspend User
        user.is_active = False
        db.commit()

        # 4. Access Protected Route Again (Should Fail)
        clinics_res_fail = client.get("/api/v1/clinics", headers=headers)
        assert clinics_res_fail.status_code in [400, 401, 403], f"Expected 400/401/403 for suspended user, got {clinics_res_fail.status_code}"

    finally:
        db.delete(user)
        db.commit()
        db.close()


@pytest.mark.governance
def test_a023_organization_clinic_scope_enforcement():
    """
    A-023: Test that cross-scope access is rejected (using real login/RBAC).
    """
    from app.db.database import SessionLocal
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    import uuid

    db = SessionLocal()
    test_email = f"e2e_{uuid.uuid4().hex[:6]}@sbnsentinel.com"
    user = User(
        email=test_email,
        hashed_password=get_password_hash("Test@123"),
        full_name="Scope Test",
        role=UserRole.CLINIC_MANAGER.value,
        org_id="ORG-A",
        is_active=True
    )
    db.add(user)
    db.commit()

    try:
        # Login
        res = client.post("/api/v1/auth/login", json={"email": test_email, "password": "Test@123"})
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Attempt cross-scope access
        response = client.get("/api/v1/clinics?org_id=ORG-B", headers=headers)
        assert response.status_code in [401, 403], "Should reject cross-scope access"
    finally:
        db.delete(user)
        db.commit()
        db.close()


@pytest.mark.governance
def test_a020_failure_matrix():
    from app.services.operational_execution_engine import operational_execution_engine
    from app.services.governance_registry import OperationalActionRecord, ActionType

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
    """
    A-021: Test historical reconstruction via ReconstructionEngine.
    """
    from app.services.reconstruction_engine import reconstruction_engine
    from app.services.governance_registry import (
        governance_registry, PolicyVersion, RuleVersion, LifecycleState,
        RecommendationMapping, AuthorityRequirement
    )
    from app.db.database import SessionLocal
    from app.models.governance_storage import RecommendationModel, RuleEvaluationModel
    import json
    import uuid
    from datetime import datetime

    uid = uuid.uuid4().hex[:6]
    policy_id = f"POL-TEST-{uid}"
    rule_id = "RULE-SCH-003"
    journey_id = f"JNY-{uid}"
    eval_id = f"EVAL-{uid}"
    rec_id = f"REC-{uid}"
    mapping_id = f"MAP-{uid}"

    # Inject historical logic
    policy = PolicyVersion(policy_id=policy_id, version="V1", content="", lifecycle_state=LifecycleState.ACTIVE)
    rule = RuleVersion(rule_id=rule_id, version="V1", logic_description="", lifecycle_state=LifecycleState.ACTIVE, inputs=[], allowed_outputs=[], governing_policy_id=policy_id, governing_policy_version="V1")
    mapping = RecommendationMapping(
        mapping_id=mapping_id, version="V1", applicable_rule_id=rule_id, eligible_result="CONDITION_MET",
        recommendation_template="Test Action", authority_requirement=AuthorityRequirement.INFORMATIONAL, priority="High", lifecycle_state=LifecycleState.ACTIVE,
        business_impact_template=None, expected_outcome_template=None
    )
    
    governance_registry.register_policy(policy)
    governance_registry.register_rule(rule)
    governance_registry.register_recommendation_mapping(mapping)

    db = SessionLocal()
    try:
        # Inject historical state
        db.add(RuleEvaluationModel(
            evaluation_id=eval_id, decision_context_id="CTX-1", policy_id=policy_id, policy_version="V1",
            rule_id=rule_id, rule_version="V1", result="CONDITION_MET", evaluation_timestamp=datetime.utcnow().isoformat(),
            input_values_json=json.dumps({"primary_context": "Operational"}), journey_id=journey_id
        ))
        db.add(RecommendationModel(
            recommendation_id=rec_id, decision_context_id="CTX-1", rule_evaluation_id=eval_id,
            journey_id=journey_id, mapping_id=mapping_id, mapping_version="V1", content="Test Action",
            status="ACTIVE", priority="High", generated_at=datetime.utcnow().isoformat()
        ))
        db.commit()

        # Invoke Reconstruction Engine
        result = reconstruction_engine.reproduce_decision(journey_id)
        assert result.status == "MATCH", f"Reconstruction failed: {result.diff}"
    finally:
        db.query(RecommendationModel).filter(RecommendationModel.recommendation_id == rec_id).delete()
        db.query(RuleEvaluationModel).filter(RuleEvaluationModel.evaluation_id == eval_id).delete()
        db.commit()
        db.close()


@pytest.mark.governance
def test_a022_synthetic_test_isolation():
    from app.core.config import Settings
    from pydantic import ValidationError

    # Try to initialize config with SYNTHETIC_TEST_ENABLED in PRODUCTION
    try:
        Settings(
            ENVIRONMENT="PRODUCTION",
            SYNTHETIC_TEST_ENABLED=True,
            CLINIC_TIMEZONE="UTC",
            SECRET_KEY="thisisverysecureandlongenough1234567")
        assert False, "Should have raised a validation error for synthetic test in production"
    except ValidationError as e:
        assert "CDI-006" in str(e) or "SYNTHETIC_TEST_ENABLED" in str(e)


@pytest.mark.governance
def test_e2e_authentic_journey():
    """
    Audit 3 Item 20: Authentic, authenticated E2E journey test.
    """
    from app.db.database import SessionLocal
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    import uuid

    db = SessionLocal()
    test_email = f"e2e_{uuid.uuid4().hex[:6]}@sbnsentinel.com"
    user = User(
        email=test_email,
        hashed_password=get_password_hash("Test@123"),
        full_name="E2E Test",
        role=UserRole.SYSTEM_ADMINISTRATOR.value,
        is_active=True
    )
    db.add(user)
    db.commit()

    # 1. Login
    res = client.post("/api/v1/auth/login", json={"email": test_email, "password": "Test@123"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check Readiness Gate
    ready_res = client.get("/api/v1/health/ready")
    assert ready_res.status_code == 200, f"Readiness gate failed: {ready_res.text}"

    # 3. Access Protected Route
    clinics_res = client.get("/api/v1/clinics", headers=headers)
    assert clinics_res.status_code == 200, "Protected route access failed"

    db.delete(user)
    db.commit()
    db.close()
