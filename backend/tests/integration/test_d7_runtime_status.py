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
    assert unsupported_conn.failure_code == "UNSUPPORTED"


def test_d7_connector_structured_failures(db_session: Session):
    from app.services.connector_manager import connector_manager
    from app.integrations.vendors.practice_fusion.adapter import PracticeFusionAdapter
    from app.connectors.base_connector import ConnectorException
    import asyncio

    db_session.query(ConnectorModel).delete()
    conn = ConnectorModel(
        id="conn_pf_test_fail", name="Practice Fusion", type="EHR", status="Configured", access_token="mock"
    )
    db_session.add(conn)
    db_session.commit()

    original_sync = PracticeFusionAdapter.sync

    # Mock sync to raise AUTHENTICATION_FAILED
    async def mock_auth_fail(self):
        raise ConnectorException("Auth failed", "AUTHENTICATION_FAILED")

    PracticeFusionAdapter.sync = mock_auth_fail
    asyncio.run(connector_manager.sync_connector("conn_pf_test_fail"))
    db_session.refresh(conn)
    assert conn.failure_code == "AUTHENTICATION_FAILED"

    # Mock timeout
    async def mock_timeout(self):
        raise ConnectorException("Timeout", "TIMEOUT")
    PracticeFusionAdapter.sync = mock_timeout
    asyncio.run(connector_manager.sync_connector("conn_pf_test_fail"))
    db_session.refresh(conn)
    assert conn.failure_code == "TIMEOUT"

    # Mock network
    async def mock_network(self):
        raise ConnectorException("Network", "NETWORK_UNAVAILABLE")
    PracticeFusionAdapter.sync = mock_network
    asyncio.run(connector_manager.sync_connector("conn_pf_test_fail"))
    db_session.refresh(conn)
    assert conn.failure_code == "NETWORK_UNAVAILABLE"

    # Mock invalid
    async def mock_invalid(self):
        raise ConnectorException("Invalid", "RESPONSE_INVALID")
    PracticeFusionAdapter.sync = mock_invalid
    asyncio.run(connector_manager.sync_connector("conn_pf_test_fail"))
    db_session.refresh(conn)
    assert conn.failure_code == "RESPONSE_INVALID"

    # Mock partial (handled by returning a dict with failure_code in new model, or raising exception)
    async def mock_partial(self):
        return {"status": "Failed", "failure_code": "PARTIAL"}
    PracticeFusionAdapter.sync = mock_partial
    asyncio.run(connector_manager.sync_connector("conn_pf_test_fail"))
    db_session.refresh(conn)
    assert conn.failure_code == "PARTIAL"

    # Mock success clears failure_code
    async def mock_success(self):
        return {"status": "Success", "duration_ms": 100}
    PracticeFusionAdapter.sync = mock_success
    asyncio.run(connector_manager.sync_connector("conn_pf_test_fail"))
    db_session.refresh(conn)
    assert conn.failure_code is None
    assert conn.status == "Healthy"

    # Restore originals
    PracticeFusionAdapter.sync = original_sync


def test_d7_pf_failure_is_bounded(client, db_session: Session, override_deps):
    db_session.query(ConnectorModel).delete()
    db_session.commit()
    response = client.get("/api/v1/health/runtime")
    data = response.json()
    cap = next((c for c in data["capabilities"] if c["capability_id"] == "ehr_read"), None)
    assert cap["affected_scope"] == "EHR Data Retrieval / Practice Fusion"
    # Runtime READY does not imply operational health, it just means technical states are tracked
    assert data["technical_state"] == "ready"
