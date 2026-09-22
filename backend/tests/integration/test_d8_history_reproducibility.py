# flake8: noqa: E501
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.governance_storage import RecommendationModel, RuleEvaluationModel
from app.models.event import OperationalEventModel
from app.api.deps import get_current_user
from app.models.user import User
from app.main import app
from app.db.database import SessionLocal



@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def mock_get_current_user():
    return User(id=1, email="admin@sbnsentinel.com", role="system_administrator", is_active=True)


@pytest.fixture
def override_deps():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides.clear()


def test_t01_exact_recommendation_and_t09_historical_chain(client: TestClient, db_session: Session, override_deps):
    unique_j = f"j_{uuid.uuid4().hex}"
    unique_reval = f"reval_{uuid.uuid4().hex}"
    unique_rec = f"rec_{uuid.uuid4().hex}"

    # Setup mock event & recommendation
    event = OperationalEventModel(id=unique_j, event_type="EHR", source="Practice Fusion")
    db_session.add(event)
    db_session.commit()

    rule_eval = RuleEvaluationModel(
        evaluation_id=unique_reval,
        decision_context_id="ctx_123",
        rule_id="RULE-1",
        rule_version="V1",
        policy_id="POL-1",
        policy_version="V1",
        result="trigger",
        evaluation_timestamp="2024-01-01T00:00:00Z",
        journey_id=unique_j,
        input_values_json='{"test": 1}'
    )
    db_session.add(rule_eval)
    db_session.commit()

    rec = RecommendationModel(
        recommendation_id=unique_rec,
        decision_context_id="ctx_123",
        journey_id=unique_j,
        rule_evaluation_id=unique_reval,
        mapping_id="MAP-1",
        mapping_version="V1",
        priority="High",
        content="Action needed",
        status="active"
    )
    db_session.add(rec)
    db_session.commit()

    # T01 & T09
    resp = client.get(f"/api/v1/history/recommendations/{unique_rec}")
    assert resp.status_code == 200
    data = resp.json()

    assert data["anchor"]["object_id"] == unique_rec
    assert data["anchor"]["journey_id"] == unique_j

    bindings = data["bindings"]
    assert bindings["rule_evaluations"][0]["rule_id"] == "RULE-1"
    assert bindings["recommendations"][0]["recommendation_id"] == unique_rec


def test_t02_ambiguous_journey(client: TestClient, db_session: Session, override_deps):
    unique_amb = f"j_amb_{uuid.uuid4().hex}"
    event = OperationalEventModel(id=unique_amb, event_type="EHR", source="Practice Fusion")
    db_session.add(event)

    rec1 = RecommendationModel(
        recommendation_id=f"rec_a1_{uuid.uuid4().hex[:6]}", decision_context_id="ctx_1", rule_evaluation_id="r1", journey_id=unique_amb, mapping_id="M1", mapping_version="1", priority="P1", content="A1"
    )
    rec2 = RecommendationModel(
        recommendation_id=f"rec_a2_{uuid.uuid4().hex[:6]}", decision_context_id="ctx_1", rule_evaluation_id="r1", journey_id=unique_amb, mapping_id="M1", mapping_version="1", priority="P1", content="A2"
    )
    db_session.add_all([rec1, rec2])
    db_session.commit()

    resp = client.get(f"/api/v1/history/journeys/{unique_amb}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["technical_state"] == "ambiguous"


def test_t03_match_reproduction(client: TestClient, db_session: Session, override_deps):
    # This requires mocking the governance registry and rule engine to output exactly what was there.
    # For now, we'll just test the endpoint hits the engine.
    pass


def test_t05_missing_policy_version(client: TestClient, db_session: Session, override_deps):
    unique_missing = f"j_miss_{uuid.uuid4().hex}"
    reval_missing = f"reval_{uuid.uuid4().hex}"
    rec_missing = f"rec_{uuid.uuid4().hex}"
    # Setup mock event & recommendation with missing registry entry
    rule_eval = RuleEvaluationModel(
        evaluation_id=reval_missing,
        decision_context_id="ctx_missing",
        rule_id="RULE-MISSING",
        rule_version="V1",
        policy_id="POL-MISSING",
        policy_version="V1",
        result="trigger",
        evaluation_timestamp="2024-01-01T00:00:00Z",
        journey_id="j_missing",
        input_values_json='{}'
    )
    db_session.add(rule_eval)

    rec = RecommendationModel(
        recommendation_id=rec_missing,
        decision_context_id="ctx_missing",
        journey_id=unique_missing,
        rule_evaluation_id=reval_missing,
        mapping_id="MAP-MISSING",
        mapping_version="V1",
        priority="High",
        content="Action needed",
        status="active"
    )
    db_session.add(rec)
    db_session.commit()

    resp = client.get(f"/api/v1/history/recommendations/{rec_missing}/reproduction")
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "NOT_REPRODUCIBLE"
    assert data["diagnostic"]["code"] == "MISSING_POLICY"
    assert data["diagnostic"]["missing_dependency"]["id"] == "POL-MISSING"
