import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.connector import ConnectorModel
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


def test_d7_overall_degraded_aggregation(client, db_session: Session, override_deps):
    db_session.query(ConnectorModel).delete()
    pf_connector = ConnectorModel(
        id="conn_pf_123", name="Practice Fusion", type="EHR", status="Error", access_token="mock_token", failure_code="PARTIAL"
    )
    db_session.add(pf_connector)
    db_session.commit()
    response = client.get("/api/v1/health/runtime")
    data = response.json()
    assert data["overall"]["state"] == "DEGRADED"


def test_d7_missing_token_retry_false(client, db_session: Session, override_deps):
    db_session.query(ConnectorModel).delete()
    pf_connector = ConnectorModel(
        id="conn_pf_123", name="Practice Fusion", type="EHR", status="Healthy", access_token=None
    )
    db_session.add(pf_connector)
    db_session.commit()
    response = client.get("/api/v1/health/runtime")
    data = response.json()
    cap = next((c for c in data["capabilities"] if c["capability_id"] == "ehr_read"), None)
    assert cap["retry_supported"] is False
    assert cap["state"] == "UNAVAILABLE"


def test_d7_real_timeout_classification(client, db_session: Session, override_deps):
    db_session.query(ConnectorModel).delete()
    timeout_conn = ConnectorModel(
        id="conn_twilio_123", name="Twilio", type="Communication", status="Error", failure_code="TIMEOUT"
    )
    db_session.add(timeout_conn)
    db_session.commit()
    response = client.get("/api/v1/health/runtime")
    data = response.json()
    conn = next((c for c in data["connectors"] if c["connector_id"] == "conn_twilio_123"), None)
    assert conn["failure_code"] == "TIMEOUT"


def test_d7_invalid_response_vs_unavailable(client, db_session: Session, override_deps):
    db_session.query(ConnectorModel).delete()
    conn1 = ConnectorModel(id="conn_1", name="Connector 1", type="API", status="Error", failure_code="RESPONSE_INVALID")
    conn2 = ConnectorModel(id="conn_2", name="Connector 2", type="API", status="Error", failure_code="NETWORK_UNAVAILABLE")
    db_session.add_all([conn1, conn2])
    db_session.commit()
    response = client.get("/api/v1/health/runtime")
    data = response.json()
    c1 = next((c for c in data["connectors"] if c["connector_id"] == "conn_1"))
    c2 = next((c for c in data["connectors"] if c["connector_id"] == "conn_2"))
    assert c1["failure_code"] == "RESPONSE_INVALID"
    assert c2["failure_code"] == "NETWORK_UNAVAILABLE"


def test_d7_truthful_last_confirmed(client, db_session: Session, override_deps):
    db_session.query(ConnectorModel).delete()
    pf_connector = ConnectorModel(
        id="conn_pf_123", name="Practice Fusion", type="EHR", status="Configured", access_token="token", last_sync=None
    )
    db_session.add(pf_connector)
    db_session.commit()
    response = client.get("/api/v1/health/runtime")
    data = response.json()
    cap = next((c for c in data["capabilities"] if c["capability_id"] == "ehr_read"), None)
    assert cap["last_confirmed_at"] is None


def test_d7_unsupported_connector_cannot_simulate_success(client, db_session: Session, override_deps):
    from app.services.connector_manager import connector_manager
    import asyncio
    
    db_session.query(ConnectorModel).delete()
    unsupported_conn = ConnectorModel(
        id="conn_unsupported_123", name="Unsupported Legacy EHR", type="EHR", status="Configured", access_token="mock"
    )
    db_session.add(unsupported_conn)
    db_session.commit()
    
    result = asyncio.run(connector_manager.sync_connector("conn_unsupported_123"))
    
    assert result["status"] == "Failed"
    assert result["code"] == "UNAVAILABLE"
    
    db_session.refresh(unsupported_conn)
    assert unsupported_conn.status == "Warning"
    assert unsupported_conn.failure_code == "unsupported"
