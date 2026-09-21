import pytest
from fastapi.testclient import TestClient
import uuid
from app.main import app
from app.db.database import SessionLocal, Base
from app.models.governance_storage import (
    HumanDecisionModel,
    OperationalActionModel,
    ExecutionAttemptModel,
    OperationalOutcomeModel,
    RecommendationModel,
    RuleEvaluationModel
)
from app.models.organization import OrganizationClinicModel
from app.models.encounter import EncounterModel
from app.services.governance_registry import governance_registry, DecisionType, AuthorityConfiguration
from app.services.intelligence_engine import intelligence_engine
from app.api.deps import get_current_user

client = TestClient(app)


@pytest.fixture(scope="function")
def setup_db():
    Base.metadata.create_all(bind=SessionLocal().get_bind())
    yield
    db = SessionLocal()
    db.query(OperationalOutcomeModel).delete()
    db.query(ExecutionAttemptModel).delete()
    db.query(OperationalActionModel).delete()
    db.query(HumanDecisionModel).delete()
    db.query(RecommendationModel).delete()
    db.query(RuleEvaluationModel).delete()
    db.query(OrganizationClinicModel).delete()
    db.query(EncounterModel).delete()
    db.commit()
    db.close()


@pytest.fixture(scope="function")
def mock_admin():
    class MockAdmin:
        id = "admin123"
        role = "System Administrator"
        is_active = True
    app.dependency_overrides[get_current_user] = lambda: MockAdmin()

    governance_registry.register_authority_config(AuthorityConfiguration(
        role="System Administrator",
        allowed_decisions=[DecisionType.APPROVED, DecisionType.REJECTED],
        can_override=True,
        requires_reason_for=[DecisionType.REJECTED]
    ))

    yield
    app.dependency_overrides.clear()


def test_d6_e2e_pipeline(setup_db, mock_admin):
    db = SessionLocal()
    journey_id = f"J-{uuid.uuid4().hex[:6]}"
    clinic_id = "ORG-CLINIC-E2E"
    
    # 1. Setup minimal target references in DB so target validates
    db.add(OrganizationClinicModel(
        id=clinic_id,
        organization_id="org_123",
        name="E2E Clinic",
        is_active=True
    ))
    db.add(EncounterModel(
        id=journey_id,
        patient_id="pat_1",
        provider_id="prov_1",
        clinic_id=clinic_id,
        date="2026-09-01",
        type="Consultation",
        status="Completed"
    ))
    db.commit()
    db.close()

    # 2. Event -> Context -> Rule Evaluation
    # Using the canonical seeds: "RULE-SCH-001" and "CONDITION_MET" which maps to "REC-MAP-001"
    eval_id = f"EVAL-{uuid.uuid4().hex[:6]}"
    context = {
        "id": "CTX-123",
        "clinic_id": clinic_id,
        "primary_context": "NoShow",
        "secondary_context": "HighValue"
    }
    finding = {
        "evaluation_id": eval_id
    }
    payload = {
        "journey_id": journey_id,
        "evidence": "Patient did not show up",
        "context": context,
        "finding": finding
    }

    # 3. Intelligence Engine generates Recommendation
    # It should derive `intended_target_reference` from `context["clinic_id"]`
    # We supply finding with rule_id, so it fetches the mapping
    finding["rule_id"] = "RULE-SCH-001"
    result = intelligence_engine._process(payload=payload)
    print("OIE RESULT:", result)

    rec_id = result.get("decision_record", {}).get("recommendation_id")
    assert rec_id is not None, "Recommendation ID should be generated"
    
    rec_record = governance_registry.get_recommendation(rec_id)
    assert rec_record is not None
    assert rec_record.intended_target_reference == clinic_id

    # 4. Human Decision (simulate posting decision)
    decision_payload = {
        "recommendation_id": rec_id,
        "decision_type": "APPROVED",
        "reason": "Proceed with fee and reschedule"
    }
    decision_resp = client.post("/api/v1/decisions/", json=decision_payload)
    assert decision_resp.status_code == 200
    decision_data = decision_resp.json()
    decision_id = decision_data.get("decision_id")
    assert decision_id is not None

    # 5. D6 Lifecycle Verification
    lifecycle_resp = client.get(f"/api/v1/actions/lifecycle/{decision_id}")
    assert lifecycle_resp.status_code == 200
    lifecycle_data = lifecycle_resp.json()
    print("DECISION DATA:", decision_data)
    print("LIFECYCLE DATA:", lifecycle_data)
    
    assert lifecycle_data["can_create"] is True
    # Verify allowed_action_types were propagated from REC-MAP-001
    assert "RESCHEDULE_APPOINTMENT" in lifecycle_data["creation"]["allowed_action_types"]
    assert "SEND_NOTIFICATION" in lifecycle_data["creation"]["allowed_action_types"]
    
    # Verify intended target reference was propagated correctly
    permitted_targets = lifecycle_data["creation"]["permitted_targets"]
    assert any(t["target_id"] == clinic_id for t in permitted_targets), "Derived target must be in permitted_targets"
