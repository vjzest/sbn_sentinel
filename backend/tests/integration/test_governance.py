
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
    A-023: Test that cross-scope access is rejected (both API routes and create_action target resolution).
    """
    from app.db.database import SessionLocal
    from app.models.user import User, UserRole
    from app.models.organization import OrganizationClinicModel
    from app.models.encounter import EncounterModel
    from app.services.governance_registry import (
        governance_registry, DecisionType, DecisionStatus, HumanDecisionRecord
    )
    from app.services.operational_execution_engine import operational_execution_engine
    from app.core.security import get_password_hash
    import uuid

    db = SessionLocal()
    uid = uuid.uuid4().hex[:6]
    test_email = f"e2e_{uid}@sbnsentinel.com"
    user = User(
        email=test_email,
        hashed_password=get_password_hash("Test@123"),
        full_name="Scope Test",
        role=UserRole.CLINIC_MANAGER.value,
        org_id="ORG-A",
        is_active=True
    )
    clinic_a1 = OrganizationClinicModel(
        id=f"CLN-A1-{uid}", organization_id="ORG-A", name="Clinic A1", is_active=True)
    clinic_a2 = OrganizationClinicModel(
        id=f"CLN-A2-{uid}", organization_id="ORG-A", name="Clinic A2", is_active=True)
    clinic_b = OrganizationClinicModel(
        id=f"CLN-B-{uid}", organization_id="ORG-B", name="Clinic B", is_active=True)
    enc_a1 = EncounterModel(
        id=f"ENC-A1-{uid}",
        clinic_id=clinic_a1.id,
        patient_id=f"PAT-{uid}",
        provider_id="PROV-1",
        date="2026-09-05",
        type="Consultation",
        status="SCHEDULED"
    )

    db.add_all([user, clinic_a1, clinic_a2, clinic_b, enc_a1])
    db.commit()

    dec_id = f"DEC-{uid}"
    governance_registry.record_human_decision(HumanDecisionRecord(
        decision_id=dec_id,
        recommendation_id=f"REC-{uid}",
        actor_id=f"ACT-{uid}",
        decision_type=DecisionType.APPROVED,
        authority_basis="Valid",
        status=DecisionStatus.RECORDED,
        journey_id=f"JNY-{uid}"
    ))

    try:
        # 1. Login & API route test
        res = client.post("/api/v1/auth/login", json={"email": test_email, "password": "Test@123"})
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/api/v1/clinics?org_id=ORG-B", headers=headers)
        assert response.status_code in [401, 403], "Should reject cross-scope access"

        # 2. Target Resolution & Scope Enforcement (Item 1 Frozen Criteria)
        # Positive case: Same-org, same-clinic -> PASS
        res_pass = operational_execution_engine.create_action(
            decision_id=dec_id,
            action_type_str="SEND_NOTIFICATION",
            target_reference=enc_a1.id,
            parameters={},
            initiator_scope={"org_id": "ORG-A", "clinic_id": clinic_a1.id}
        )
        assert res_pass["status"] == "SUCCESS"

        # Negative case: Cross-org -> FAIL
        res_cross_org = operational_execution_engine.create_action(
            decision_id=dec_id,
            action_type_str="SEND_NOTIFICATION",
            target_reference=clinic_b.id,
            parameters={},
            initiator_scope={"org_id": "ORG-A", "clinic_id": clinic_a1.id}
        )
        assert res_cross_org["status"] == "ERROR"
        assert "CROSS_ORG" in res_cross_org["message"]

        # Negative case: Cross-clinic -> FAIL
        res_cross_clinic = operational_execution_engine.create_action(
            decision_id=dec_id,
            action_type_str="SEND_NOTIFICATION",
            target_reference=clinic_a2.id,
            parameters={},
            initiator_scope={"org_id": "ORG-A", "clinic_id": clinic_a1.id}
        )
        assert res_cross_clinic["status"] == "ERROR"
        assert "CROSS_CLINIC" in res_cross_clinic["message"]

        # Negative case: Unknown / unresolvable target -> FAIL
        res_unknown = operational_execution_engine.create_action(
            decision_id=dec_id,
            action_type_str="SEND_NOTIFICATION",
            target_reference="UNKNOWN-TARGET-XYZ",
            parameters={},
            initiator_scope={"org_id": "ORG-A", "clinic_id": clinic_a1.id}
        )
        assert res_unknown["status"] == "ERROR"
        assert "TARGET_NOT_FOUND_OR_UNSUPPORTED" in res_unknown["message"]

    finally:
        db.delete(enc_a1)
        db.delete(clinic_a1)
        db.delete(clinic_a2)
        db.delete(clinic_b)
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
    Proves determinism: reconstructs original V1 accurately even after a distinct V2 is active.
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
    rule_id = f"RULE-SCH-{uid}"
    journey_id = f"JNY-{uid}"
    eval_id = f"EVAL-{uid}"
    rec_id = f"REC-{uid}"
    mapping_id = f"MAP-{uid}"

    # 1. Register historical V1 logic
    policy_v1 = PolicyVersion(
        policy_id=policy_id, version="V1", content="V1 Policy", lifecycle_state=LifecycleState.ACTIVE)
    rule_v1 = RuleVersion(
        rule_id=rule_id, version="V1", logic_description="", lifecycle_state=LifecycleState.ACTIVE,
        inputs=[], allowed_outputs=[], governing_policy_id=policy_id, governing_policy_version="V1")
    mapping_v1 = RecommendationMapping(
        mapping_id=mapping_id,
        version="V1",
        applicable_rule_id=rule_id,
        eligible_result="CONDITION_MET",
        recommendation_template="Test Action V1",
        authority_requirement=AuthorityRequirement.INFORMATIONAL,
        priority="High",
        lifecycle_state=LifecycleState.ACTIVE,
        business_impact_template="V1 Impact",
        expected_outcome_template="V1 Expected")

    governance_registry.register_policy(policy_v1)
    governance_registry.register_rule(rule_v1)
    governance_registry.register_recommendation_mapping(mapping_v1)

    # 2. Register materially different V2 logic
    policy_v2 = PolicyVersion(
        policy_id=policy_id, version="V2", content="V2 Policy", lifecycle_state=LifecycleState.ACTIVE)
    rule_v2 = RuleVersion(
        rule_id=rule_id, version="V2", logic_description="", lifecycle_state=LifecycleState.ACTIVE,
        inputs=[], allowed_outputs=[], governing_policy_id=policy_id, governing_policy_version="V2")
    mapping_v2 = RecommendationMapping(
        mapping_id=mapping_id,
        version="V2",
        applicable_rule_id=rule_id,
        eligible_result="CONDITION_MET",
        recommendation_template="Materially Different V2 Action",
        authority_requirement=AuthorityRequirement.APPROVAL_REQUIRED,
        priority="Critical",
        lifecycle_state=LifecycleState.ACTIVE,
        business_impact_template="V2 Impact",
        expected_outcome_template="V2 Expected")

    governance_registry.register_policy(policy_v2)
    governance_registry.register_rule(rule_v2)
    governance_registry.register_recommendation_mapping(mapping_v2)

    db = SessionLocal()
    try:
        # Inject historical state explicitly bound to V1
        db.add(RuleEvaluationModel(
            evaluation_id=eval_id, decision_context_id="CTX-1", policy_id=policy_id, policy_version="V1",
            rule_id=rule_id, rule_version="V1", result="CONDITION_MET",
            evaluation_timestamp=datetime.utcnow().isoformat(),
            input_values_json=json.dumps({"primary_context": "Operational"}), journey_id=journey_id
        ))
        db.add(RecommendationModel(
            recommendation_id=rec_id, decision_context_id="CTX-1", rule_evaluation_id=eval_id,
            journey_id=journey_id, mapping_id=mapping_id, mapping_version="V1", content="Test Action V1",
            status="ACTIVE", priority="High", generated_at=datetime.utcnow().isoformat()
        ))
        db.commit()

        # Invoke Reconstruction Engine: must strictly resolve and match V1
        result = reconstruction_engine.reproduce_decision(journey_id)
        assert result.status == "MATCH", f"Reconstruction failed: {result.diff}"
        assert result.reproduced_recommendation["action"] == "Test Action V1"

        # Query unknown journey: must return NOT_REPRODUCIBLE
        unrec = reconstruction_engine.reproduce_decision("NONEXISTENT-JOURNEY-XYZ")
        assert unrec.status == "NOT_REPRODUCIBLE"
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
    ready_res = client.get("/api/v1/health/ready", headers=headers)
    assert ready_res.status_code == 200, f"Readiness gate failed: {ready_res.text}"

    # 3. Access Protected Route
    clinics_res = client.get("/api/v1/clinics", headers=headers)
    assert clinics_res.status_code == 200, "Protected route access failed"

    db.delete(user)
    db.commit()
    db.close()


@pytest.mark.governance
def test_a025_restart_safe_persistence_and_continuity():
    """
    Audit 4 Item 2: Test that relational persistence survives simulated restart,
    authoritative SQL getters restore records, and continuity validation succeeds
    without relying on in-memory caches.
    """
    from app.services.governance_registry import (
        governance_registry, RecommendationRecord, RecommendationStatus,
        AuthorityRequirement, HumanDecisionRecord, DecisionType, DecisionStatus,
        OperationalActionRecord, ActionType, ActionStatus, ExecutionResult,
        OperationalOutcomeRecord, OutcomeConfirmationState, OutcomeResolutionState,
        RuleEvaluationRecord
    )
    from app.db.database import SessionLocal
    from app.models.governance_storage import (
        RecommendationModel, HumanDecisionModel, OperationalActionModel,
        OperationalOutcomeModel, RuleEvaluationModel
    )
    import uuid
    from datetime import datetime

    uid = uuid.uuid4().hex[:6]
    jny_id = f"JNY-PERSIST-{uid}"
    eval_id = f"EVAL-{uid}"
    rec_id = f"REC-{uid}"
    dec_id = f"DEC-{uid}"
    act_id = f"ACT-{uid}"
    out_id = f"OUT-{uid}"

    # Record full governed chain into DB
    governance_registry.record_evaluation(RuleEvaluationRecord(
        evaluation_id=eval_id,
        decision_context_id="CTX-1",
        policy_id="POL-1",
        policy_version="V1",
        rule_id="RULE-1",
        rule_version="V1",
        result="CONDITION_MET",
        evaluation_timestamp=datetime.utcnow(),
        input_values={"test": 1},
        journey_id=jny_id
    ))
    governance_registry.record_recommendation(RecommendationRecord(
        recommendation_id=rec_id,
        mapping_id="MAP-1",
        mapping_version="V1",
        decision_context_id="CTX-1",
        rule_evaluation_id=eval_id,
        recommendation_content="Persisted Rec Content",
        status=RecommendationStatus.ACTIVE,
        authority_requirement=AuthorityRequirement.INFORMATIONAL,
        priority="High",
        journey_id=jny_id
    ))
    governance_registry.record_human_decision(HumanDecisionRecord(
        decision_id=dec_id,
        recommendation_id=rec_id,
        actor_id="ACT-PERSIST",
        decision_type=DecisionType.APPROVED,
        authority_basis="Valid",
        status=DecisionStatus.RECORDED,
        journey_id=jny_id
    ))
    governance_registry.record_operational_action(OperationalActionRecord(
        action_id=act_id,
        action_type=ActionType.SEND_NOTIFICATION,
        target_reference="TGT-1",
        authorization_reference=dec_id,
        parameters={"foo": "bar"},
        status=ActionStatus.COMPLETED,
        current_result=ExecutionResult.SUCCESS,
        journey_id=jny_id
    ))
    governance_registry.record_operational_outcome(OperationalOutcomeRecord(
        outcome_id=out_id,
        action_id=act_id,
        expected_outcome={"delivered": True},
        observed_outcome={"delivered": True},
        confirmation_state=OutcomeConfirmationState.CONFIRMED,
        resolution_state=OutcomeResolutionState.RESOLVED,
        journey_id=jny_id
    ))

    # Simulate process restart by completely clearing in-memory caches
    governance_registry._evaluations.clear()
    governance_registry._recommendations.clear()
    governance_registry._human_decisions.clear()
    governance_registry._operational_actions.clear()
    governance_registry._operational_outcomes.clear()

    try:
        # 1. Authoritative DB getters must successfully retrieve records after restart
        db_rec = governance_registry.get_recommendation(rec_id)
        assert db_rec is not None and db_rec.recommendation_id == rec_id
        assert db_rec.journey_id == jny_id
        assert db_rec.recommendation_content == "Persisted Rec Content"

        db_dec = governance_registry.get_human_decision(dec_id)
        assert db_dec is not None and db_dec.decision_id == dec_id

        db_act = governance_registry.get_operational_action(act_id)
        assert db_act is not None and db_act.action_id == act_id
        assert db_act.parameters.get("foo") == "bar"

        db_out = governance_registry.get_operational_outcome(out_id)
        assert db_out is not None and db_out.outcome_id == out_id
        assert db_out.expected_outcome == {"delivered": True}

        # 2. Continuity validation must succeed through DB queries even with empty in-memory caches
        governance_registry.validate_upstream_continuity(
            child_journey_id=jny_id,
            parent_id=dec_id,
            parent_type="decision"
        )
        governance_registry.validate_upstream_continuity(
            child_journey_id=jny_id,
            parent_id=act_id,
            parent_type="action"
        )
    finally:
        db = SessionLocal()
        db.query(OperationalOutcomeModel).filter(OperationalOutcomeModel.outcome_id == out_id).delete()
        db.query(OperationalActionModel).filter(OperationalActionModel.action_id == act_id).delete()
        db.query(HumanDecisionModel).filter(HumanDecisionModel.decision_id == dec_id).delete()
        db.query(RecommendationModel).filter(RecommendationModel.recommendation_id == rec_id).delete()
        db.query(RuleEvaluationModel).filter(RuleEvaluationModel.evaluation_id == eval_id).delete()
        db.commit()
        db.close()


@pytest.mark.governance
def test_a026_readiness_gate_positive_and_negative():
    """
    Audit 4 Item 7: Test readiness gate positive case (200 OK with valid user, role, scope)
    and negative case (503 Service Unavailable when user lacks assigned operational role).
    """
    from app.db.database import SessionLocal
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    import uuid

    db = SessionLocal()
    uid = uuid.uuid4().hex[:6]
    active_email = f"ready_active_{uid}@sbnsentinel.com"
    unassigned_email = f"ready_unassigned_{uid}@sbnsentinel.com"

    u_active = User(
        email=active_email,
        hashed_password=get_password_hash("Test@123"),
        full_name="Active Admin",
        role=UserRole.SYSTEM_ADMINISTRATOR.value,
        is_active=True
    )
    u_unassigned = User(
        email=unassigned_email,
        hashed_password=get_password_hash("Test@123"),
        full_name="Unassigned User",
        role=UserRole.UNASSIGNED.value,
        is_active=True
    )
    db.add_all([u_active, u_unassigned])
    db.commit()

    try:
        # Positive case: valid active operational role -> 200
        res = client.post("/api/v1/auth/login", json={"email": active_email, "password": "Test@123"})
        token = res.json()["access_token"]
        ready_res = client.get("/api/v1/health/ready", headers={"Authorization": f"Bearer {token}"})
        assert ready_res.status_code == 200
        assert ready_res.json()["ready"] is True

        # Negative case: unassigned role user -> 503
        res_un = client.post("/api/v1/auth/login", json={"email": unassigned_email, "password": "Test@123"})
        token_un = res_un.json()["access_token"]
        ready_un = client.get("/api/v1/health/ready", headers={"Authorization": f"Bearer {token_un}"})
        assert ready_un.status_code == 503
        assert ready_un.json()["detail"]["checks"]["role"] is False

        # Negative case: unauthenticated request -> 401
        ready_no_auth = client.get("/api/v1/health/ready")
        assert ready_no_auth.status_code in [401, 403]
    finally:
        db.delete(u_active)
        db.delete(u_unassigned)
        db.commit()
        db.close()
