import pytest
from fastapi.testclient import TestClient
import uuid
import datetime
from app.main import app
from app.db.database import SessionLocal, Base
from app.models.signal import SignalModel
from app.models.governance_storage import RuleEvaluationModel, RecommendationModel, HumanDecisionModel
from app.services.governance_registry import governance_registry, AuthorityConfiguration, DecisionType, RecommendationRecord, RecommendationStatus, AuthorityRequirement

client = TestClient(app)


@pytest.fixture(scope="function")
def setup_db():
    Base.metadata.create_all(bind=SessionLocal().get_bind())
    yield
    # Clean up
    db = SessionLocal()
    db.query(SignalModel).delete()
    db.query(RuleEvaluationModel).delete()
    db.query(RecommendationModel).delete()
    db.query(HumanDecisionModel).delete()
    db.commit()
    db.close()
    governance_registry._recommendations.clear()
    governance_registry._human_decisions.clear()


@pytest.fixture(scope="function")
def mock_admin():
    from app.api.deps import get_current_user

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


@pytest.mark.governance
def test_d5_recommendation_review_endpoint_exact_match(setup_db, mock_admin):
    db = SessionLocal()
    signal_id = str(uuid.uuid4())
    event_id = str(uuid.uuid4())
    correlation_id = str(uuid.uuid4())

    # 1. Setup Signal
    sig = SignalModel(
        id=signal_id,
        type="test_signal",
        metadata_data={"pipeline_event_id": event_id, "correlation_id": correlation_id}
    )
    db.add(sig)

    rec_id = str(uuid.uuid4())
    eval_id = str(uuid.uuid4())
    context_id = "ctx-test"

    # 2. Setup RuleEvaluation
    rule_eval = RuleEvaluationModel(
        evaluation_id=eval_id,
        decision_context_id=context_id,
        policy_id="pol-test",
        policy_version="1.0",
        rule_id="rule-test",
        rule_version="1.0",
        result="PASS",
        evaluation_timestamp=datetime.datetime.utcnow().isoformat(),
        journey_id=correlation_id
    )
    db.add(rule_eval)

    # 3. Setup Persisted Recommendation
    rec = RecommendationModel(
        recommendation_id=rec_id,
        decision_context_id=context_id,
        rule_evaluation_id=eval_id,
        journey_id=correlation_id,
        mapping_id="map-1",
        mapping_version="1.0",
        content="Test Recommendation Content",
        status="ACTIVE",
        priority="High",
        generated_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(rec)
    db.commit()

    # 4. Test the GET endpoint
    response = client.get(f"/api/v1/decisions/review/{signal_id}")
    assert response.status_code == 200, response.text
    data = response.json()

    assert data["technical_state"] == "ready"
    assert data["recommendation"]["recommendation_id"] == rec_id
    assert data["recommendation"]["content"] == "Test Recommendation Content"
    assert data["authority"]["state"] == "AUTHORIZED"
    assert data["current_decision"] is None

    # 5. (Removed manual registry append; get_recommendation reads from DB now)
    # 6. Test POST Decision (Submit)
    post_resp = client.post("/api/v1/decisions/", json={
        "recommendation_id": rec_id,
        "decision_type": "APPROVED",
        "reason": "Looking good"
    })

    assert post_resp.status_code == 200, post_resp.text

    # 7. Clear session/registry to prove we read from DB
    db.close()
    governance_registry._human_decisions.clear()

    # 8. Verify GET endpoint shows the current decision exactly from DB
    get_again = client.get(f"/api/v1/decisions/review/{signal_id}")
    data_again = get_again.json()
    assert data_again["current_decision"] is not None
    assert data_again["current_decision"]["decision_type"] == "APPROVED"
    assert data_again["current_decision"]["status"] == "RECORDED"


@pytest.mark.governance
def test_d5_recommendation_ambiguity(setup_db, mock_admin):
    db = SessionLocal()
    signal_id = str(uuid.uuid4())
    correlation_id = str(uuid.uuid4())

    sig = SignalModel(id=signal_id, type="test_signal", metadata_data={"correlation_id": correlation_id})
    db.add(sig)

    # Add two rule evaluations and two recommendations for the same journey
    for i in range(2):
        eval_id = str(uuid.uuid4())
        db.add(RuleEvaluationModel(
            evaluation_id=eval_id,
            decision_context_id=f"ctx-{i}",
            policy_id="pol-test", policy_version="1.0", rule_id="rule-test", rule_version="1.0",
            result="PASS", evaluation_timestamp=datetime.datetime.utcnow().isoformat(),
            journey_id=correlation_id
        ))
        db.add(RecommendationModel(
            recommendation_id=str(uuid.uuid4()),
            decision_context_id=f"ctx-{i}",
            rule_evaluation_id=eval_id,
            journey_id=correlation_id,
            mapping_id="map-1", mapping_version="1.0", content="Content",
            status="ACTIVE", priority="High", generated_at=datetime.datetime.utcnow().isoformat()
        ))
    db.commit()

    # Ambiguity check
    response = client.get(f"/api/v1/decisions/review/{signal_id}")
    assert response.status_code == 200
    assert response.json()["technical_state"] == "ambiguous"


@pytest.mark.governance
def test_d5_recommendation_lifecycle_expired(setup_db, mock_admin):
    db = SessionLocal()
    signal_id = str(uuid.uuid4())
    correlation_id = str(uuid.uuid4())

    db.add(SignalModel(id=signal_id, type="test_signal", metadata_data={"correlation_id": correlation_id}))

    eval_id = str(uuid.uuid4())
    db.add(RuleEvaluationModel(
        evaluation_id=eval_id, decision_context_id="ctx-test",
        policy_id="pol-test", policy_version="1.0", rule_id="rule-test", rule_version="1.0",
        result="PASS", evaluation_timestamp=datetime.datetime.utcnow().isoformat(),
        journey_id=correlation_id
    ))

    # Add EXPIRED recommendation
    db.add(RecommendationModel(
        recommendation_id=str(uuid.uuid4()),
        decision_context_id="ctx-test",
        rule_evaluation_id=eval_id,
        journey_id=correlation_id,
        mapping_id="map-1", mapping_version="1.0", content="Content",
        status="EXPIRED", priority="High", generated_at=datetime.datetime.utcnow().isoformat()
    ))
    db.commit()

    response = client.get(f"/api/v1/decisions/review/{signal_id}")
    data = response.json()
    assert data["authority"]["state"] == "AUTHORIZED"
    assert data["authority"]["eligibility"] == "EXPIRED"
    assert len(data["authority"]["allowed_decisions"]) == 0
