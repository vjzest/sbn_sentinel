import pytest
from fastapi.testclient import TestClient
import uuid
import datetime
import json
from app.main import app
from app.db.database import SessionLocal, Base
from app.models.governance_storage import (
    HumanDecisionModel,
    OperationalActionModel,
    ExecutionAttemptModel,
    OperationalOutcomeModel
)
from app.models.organization import OrganizationClinicModel
from app.services.governance_registry import governance_registry, DecisionType, DecisionStatus

client = TestClient(app)

@pytest.fixture(scope="function")
def setup_db():
    Base.metadata.create_all(bind=SessionLocal().get_bind())
    yield
    # Clean up
    db = SessionLocal()
    db.query(OperationalOutcomeModel).delete()
    db.query(ExecutionAttemptModel).delete()
    db.query(OperationalActionModel).delete()
    db.query(HumanDecisionModel).delete()
    db.commit()
    db.close()
    governance_registry._human_decisions.clear()
    governance_registry._operational_actions.clear()
    governance_registry._execution_attempts.clear()
    governance_registry._operational_outcomes.clear()

@pytest.fixture(scope="function")
def mock_admin():
    from app.api.deps import get_current_user
    class MockAdmin:
        id = "admin123"
        role = "System Administrator"
        is_active = True
    app.dependency_overrides[get_current_user] = lambda: MockAdmin()
    yield
    app.dependency_overrides.clear()

def test_action_lifecycle_empty_decision(setup_db, mock_admin):
    decision_id = f"dec_{uuid.uuid4().hex[:8]}"
    
    # Not yet created decision, should return unavailable
    response = client.get(f"/api/v1/actions/lifecycle/{decision_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["technical_state"] == "unavailable"
    assert data["can_create"] is False

def test_action_lifecycle_with_decision(setup_db, mock_admin):
    decision_id = f"dec_{uuid.uuid4().hex[:8]}"
    journey_id = f"journey_{uuid.uuid4().hex[:8]}"
    
    db = SessionLocal()
    db.add(HumanDecisionModel(
        decision_id=decision_id,
        recommendation_id="rec_123",
        actor_id="admin123",
        decision_type=DecisionType.APPROVED.value,
        status=DecisionStatus.RECORDED.value,
        journey_id=journey_id,
        decision_timestamp=datetime.datetime.utcnow().isoformat()
    ))
    db.commit()
    db.close()
    
    # Now query lifecycle
    response = client.get(f"/api/v1/actions/lifecycle/{decision_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["technical_state"] == "ready"
    assert data["journey_id"] == journey_id
    assert data["decision"]["decision_id"] == decision_id
    assert data["decision"]["decision_type"] == DecisionType.APPROVED.value
    assert data["can_create"] is True
    assert data["creation"]["state"] == "ELIGIBLE"
    assert len(data["actions"]) == 0

def test_idempotency_create_action(setup_db, mock_admin):
    decision_id = f"dec_{uuid.uuid4().hex[:8]}"
    journey_id = f"journey_{uuid.uuid4().hex[:8]}"
    
    db = SessionLocal()
    db.add(HumanDecisionModel(
        decision_id=decision_id,
        recommendation_id="rec_123",
        actor_id="admin123",
        decision_type=DecisionType.APPROVED.value,
        status=DecisionStatus.RECORDED.value,
        journey_id=journey_id,
        decision_timestamp=datetime.datetime.utcnow().isoformat()
    ))
    db.add(OrganizationClinicModel(
        id="target_123",
        organization_id="org_123",
        name="Test Clinic",
        is_active=True
    ))
    db.commit()
    db.close()
    
    # Create action
    payload = {
        "decision_id": decision_id,
        "action_type": "SEND_NOTIFICATION",
        "target_reference": "target_123",
        "parameters": {}
    }
    
    response = client.post("/api/v1/actions/", json=payload)
    if response.status_code != 200:
        print("ERROR RESPONSE:", response.text)
    assert response.status_code == 200
    data1 = response.json()
    action_id = data1["action_id"]
    assert action_id is not None
    assert data1["status"] != "IDEMPOTENT"
    
    # Create again with same payload (idempotency check)
    response2 = client.post("/api/v1/actions/", json=payload)
    assert response2.status_code == 200
    data2 = response2.json()
    assert data2["action_id"] == action_id
    assert data2["status"] == "IDEMPOTENT"
    
    # Verify in lifecycle
    response3 = client.get(f"/api/v1/actions/lifecycle/{decision_id}")
    data3 = response3.json()
    assert len(data3["actions"]) == 1
    assert data3["actions"][0]["action_id"] == action_id
