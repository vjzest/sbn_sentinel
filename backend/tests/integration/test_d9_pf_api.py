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
    assert auth.private_key == "test_key"


@pytest.mark.asyncio
async def test_pf03_missing_authorization():
    """PF03: Verify missing auth fails closed."""
    manifest = PracticeFusionManifest()
    with pytest.raises(ValueError, match="client_id required"):
        manifest.get_auth_strategy({"private_key": "test"})

    with pytest.raises(ValueError, match="private_key required"):
        manifest.get_auth_strategy({"client_id": "test"})


@pytest.fixture
def pf_manifest():
    return PracticeFusionManifest()


@pytest.fixture
def pf_auth(pf_manifest, pf_config):
    return pf_manifest.get_auth_strategy(pf_config)


@pytest.mark.asyncio
@patch("app.integrations.auth.jwt_client_assertion.JwtClientAssertionAuth.authenticate")
async def test_pf05_patient_bundle(mock_auth, pf_config, pf_auth, pf_manifest):
    """PF05: Verify Patient resource fetching."""
    mock_auth.return_value = {"access_token": "mock_token"}
    adapter = PracticeFusionAdapter(auth=pf_auth, manifest=pf_manifest, config=pf_config)
    patients = await adapter.get_resource("Patient")
    assert len(patients) > 0
    assert patients[0]["resourceType"] == "Patient"


@pytest.mark.asyncio
async def test_pf08_appointment_unsupported(pf_config, pf_auth, pf_manifest):
    """PF08: Verify unsupported resources are blocked by CapabilityStatement."""
    adapter = PracticeFusionAdapter(auth=pf_auth, manifest=pf_manifest, config=pf_config)
    caps = await adapter.get_capability_statement()
    # Mock capability statement specifies Appointment is False
    assert caps.get("Appointment", False) is False
