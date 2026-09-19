import pytest
from fastapi.testclient import TestClient
import uuid
from app.main import app
from app.db.database import SessionLocal, Base
from app.models.signal import SignalModel
from app.models.decision_record import DecisionRecordModel
from app.models.governance_storage import RuleEvaluationModel
from app.services.governance_registry import governance_registry, DecisionType, HumanDecisionRecord, DecisionStatus

client = TestClient(app)

@pytest.fixture(scope="function")
def setup_db():
    Base.metadata.create_all(bind=SessionLocal().get_bind())
    yield
    # Clean up test data if necessary

@pytest.mark.governance
def test_d5_recommendation_review_endpoint(setup_db):
    db = SessionLocal()
    signal_id = str(uuid.uuid4())
    event_id = str(uuid.uuid4())
    correlation_id = str(uuid.uuid4())
    
    # 1. Setup Data
    sig = SignalModel(
        id=signal_id,
        type="test_signal",
        metadata_data={"pipeline_event_id": event_id, "correlation_id": correlation_id}
    )
    db.add(sig)
    
    rec_id = str(uuid.uuid4())
    import datetime
    rule_eval = RuleEvaluationModel(
        evaluation_id=str(uuid.uuid4()),
        decision_context_id="ctx-test",
        policy_id="pol-test",
        policy_version="1.0",
        rule_id="rule-test",
        rule_version="1.0",
        result="PASS",
        evaluation_timestamp=datetime.datetime.utcnow().isoformat(),
        journey_id=correlation_id
    )
    db.add(rule_eval)
    
    decision_record = DecisionRecordModel(
        id=str(uuid.uuid4()),
        event_id=event_id,
        recommendation={
            "id": rec_id,
            "description": "Test Recommendation Content",
            "status": "ACTIVE",
            "priority": "High"
        }
    )
    db.add(decision_record)
    db.commit()

    # Create dummy admin user dependency override and register authority config
    from app.api.deps import get_current_user
    from app.services.governance_registry import AuthorityConfiguration, DecisionType
    governance_registry.register_authority_config(AuthorityConfiguration(
        role="System Administrator",
        allowed_decisions=[DecisionType.APPROVED, DecisionType.REJECTED],
        can_override=True,
        requires_reason_for=[DecisionType.REJECTED]
    ))

    class MockAdmin:
        id = "admin123"
        role = "System Administrator"
        is_active = True
        
    app.dependency_overrides[get_current_user] = lambda: MockAdmin()

    # 2. Test the GET endpoint
    response = client.get(f"/api/v1/decisions/review/{signal_id}")
    assert response.status_code == 200, response.text
    data = response.json()
    
    assert data["technical_state"] == "ready"
    assert data["recommendation"]["recommendation_id"] == rec_id
    assert data["recommendation"]["content"] == "Test Recommendation Content"
    assert data["authority"]["state"] == "AUTHORIZED"
    assert data["current_decision"] is None

    # 3. Test POST Decision (Submit)
    # Add recommendation to registry so HDE can find it
    from app.services.governance_registry import RecommendationRecord, RecommendationStatus, AuthorityRequirement
    import datetime
    
    # Check if recommendation already exists to avoid dupes
    if not any(r.recommendation_id == rec_id for r in governance_registry._recommendations):
        governance_registry._recommendations.append(
            RecommendationRecord(
                recommendation_id=rec_id,
                mapping_id="map-1",
                mapping_version="1.0",
                decision_context_id="ctx-test",
                rule_evaluation_id=rule_eval.evaluation_id,
                recommendation_content="Test Recommendation Content",
                status=RecommendationStatus.ACTIVE,
                authority_requirement=AuthorityRequirement.INFORMATIONAL,
                priority="High",
                journey_id=correlation_id
            )
        )

    post_resp = client.post("/api/v1/decisions/", json={
        "recommendation_id": rec_id,
        "decision_type": "APPROVED",
        "reason": "Looking good"
    })
    
    assert post_resp.status_code == 200, post_resp.text
    
    # 4. Verify GET endpoint shows the current decision
    get_again = client.get(f"/api/v1/decisions/review/{signal_id}")
    data_again = get_again.json()
    assert data_again["current_decision"] is not None
    assert data_again["current_decision"]["decision_type"] == "APPROVED"
    assert data_again["current_decision"]["status"] == "RECORDED"
    
    # Clean up
    app.dependency_overrides.clear()
    db.close()
