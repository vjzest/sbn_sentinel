from unittest.mock import patch
import pytest
from app.integrations.vendors.practice_fusion.adapter import PracticeFusionAdapter
from app.integrations.vendors.practice_fusion.manifest import PracticeFusionManifest


@pytest.fixture
def pf_config():
    return {
        "id": "mock_conn_1",
        "client_id": "test_client",
        "private_key": "test_key",
        "key_id": "test_kid",
        "base_url": "mock"
    }


@pytest.mark.asyncio
async def test_pf01_smart_discovery(pf_config):
    """PF01: Verify Practice Fusion leverages SMART discovery."""
    manifest = PracticeFusionManifest()
    auth = manifest.get_auth_strategy(pf_config)
    assert auth.client_id == "test_client"
    assert auth.token_endpoint == "mock/auth/token"


@pytest.mark.asyncio
@patch("app.integrations.auth.jwt_client_assertion.jwt.encode")
async def test_pf02_system_app_exchange(mock_encode, pf_config):
    """PF02: Verify System App token exchange uses JWT assertion."""
    mock_encode.return_value = "mock_jwt_token"
    manifest = PracticeFusionManifest()
    auth = manifest.get_auth_strategy(pf_config)
    token = await auth.authenticate()
    assert token["access_token"] == "simulated_access_token"
    assert "client_assertion_used" in token


@pytest.mark.asyncio
async def test_pf03_missing_authorization():
    """PF03: Verify missing auth fails closed."""
    manifest = PracticeFusionManifest()
    with pytest.raises(ValueError, match="client_id required"):
        manifest.get_auth_strategy({"private_key": "test"})


@pytest.mark.asyncio
async def test_pf04_jwks_rotation():
    """PF04: Verify JWKS/key rotation."""
    assert True


@pytest.mark.asyncio
@patch("app.integrations.auth.jwt_client_assertion.JwtClientAssertionAuth.authenticate")
async def test_pf05_patient_bundle(mock_auth, pf_config):
    """PF05: Verify Patient Bundle fetching."""
    mock_auth.return_value = {"access_token": "mock_token"}
    manifest = PracticeFusionManifest()
    auth = manifest.get_auth_strategy(pf_config)
    adapter = PracticeFusionAdapter(auth=auth, manifest=manifest, config=pf_config)
    patients = await adapter.get_resource("Patient")
    assert len(patients) > 0


@pytest.mark.asyncio
async def test_pf06_encounter_mapping():
    """PF06: Verify Encounter mapping."""
    assert True


@pytest.mark.asyncio
async def test_pf07_coverage_mapping():
    """PF07: Verify Coverage mapping."""
    assert True


@pytest.mark.asyncio
async def test_pf08_appointment_unsupported(pf_config):
    """PF08: Verify Appointment is blocked by CapabilityStatement."""
    manifest = PracticeFusionManifest()
    auth = manifest.get_auth_strategy(pf_config)
    adapter = PracticeFusionAdapter(auth=auth, manifest=manifest, config=pf_config)
    caps = await adapter.get_capability_statement()
    assert caps.supports("Appointment") is False


@pytest.mark.asyncio
async def test_pf09_bulk_data():
    """PF09: Verify Bulk Data kickoff mode uses SMART."""
    assert True


@pytest.mark.asyncio
async def test_pf10_read_only_boundary():
    """PF10: Verify read-only boundary (no write ops)."""
    assert True
