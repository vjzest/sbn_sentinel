import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

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


def test_t01_pf_absent_readiness_false(client, db_session: Session, override_deps):
    # Ensure no connectors exist
    db_session.query(ConnectorModel).delete()
    db_session.commit()

    response = client.get("/api/v1/health/runtime")
    assert response.status_code == 200
    data = response.json()
    
    # Overall state should be DEGRADED/BLOCKED since a core capability is unavailable
    assert data["overall"]["state"] in ["DEGRADED", "BLOCKED"]
    
    # PF should be absent, ehr_read capability UNAVAILABLE
    ehr_cap = next((c for c in data["capabilities"] if c["capability_id"] == "ehr_read"), None)
    assert ehr_cap is not None
    assert ehr_cap["state"] == "UNAVAILABLE"


def test_t02_t03_pf_unhealthy_or_missing_token(client, db_session: Session, override_deps):
    db_session.query(ConnectorModel).delete()
    
    pf_connector = ConnectorModel(
        id="conn_pf_123",
        name="Practice Fusion",
        type="EHR",
        status="Error",  # Unhealthy
        access_token=None  # Missing token
    )
    db_session.add(pf_connector)
    db_session.commit()

    response = client.get("/api/v1/health/runtime")
    assert response.status_code == 200
    data = response.json()
    
    ehr_cap = next((c for c in data["capabilities"] if c["capability_id"] == "ehr_read"), None)
    assert ehr_cap is not None
    assert ehr_cap["state"] == "UNAVAILABLE"  # Missing token -> UNAVAILABLE


def test_t06_timeout_distinct(client, db_session: Session, override_deps):
    db_session.query(ConnectorModel).delete()
    
    # Mock a connector that is in Error state, mapped to TIMEOUT
    timeout_conn = ConnectorModel(
        id="conn_twilio_123",
        name="Twilio",
        type="Communication",
        status="Error",
        last_sync=datetime.utcnow()
    )
    db_session.add(timeout_conn)
    db_session.commit()
    
    response = client.get("/api/v1/health/runtime")
    assert response.status_code == 200
    data = response.json()
    
    conn = next((c for c in data["connectors"] if c["connector_id"] == "conn_twilio_123"), None)
    assert conn is not None
    # Assuming "Error" maps to "TIMEOUT" failure_code
    assert conn["failure_code"] == "TIMEOUT"


def test_t15_no_fake_connector_state(client, db_session: Session, override_deps):
    # Clear connectors
    db_session.query(ConnectorModel).delete()
    db_session.commit()
    
    # Calling settings integrations MUST NOT auto-create records anymore
    response = client.get("/api/v1/settings/integrations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0  # Should be empty, no default seeding
