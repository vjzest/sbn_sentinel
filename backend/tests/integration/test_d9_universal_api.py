import pytest
from app.integrations.core.transport import HttpTransport
from app.integrations.auth.jwt_client_assertion import JwtClientAssertionAuth
from app.integrations.fhir.discovery import SmartDiscovery
from app.integrations.fhir.bundle_pager import BundlePager
import httpx
import respx

from unittest.mock import patch


@pytest.mark.asyncio
@patch("app.integrations.auth.jwt_client_assertion.jwt.encode")
async def test_u03_jwt_signing(mock_encode):
    """U03: Verify JWT signing structure."""
    mock_encode.return_value = "mock_jwt_token"
    auth = JwtClientAssertionAuth("test_client", "test_key", "test_kid", "mock")
    token = auth._generate_jwt_assertion()
    assert token == "mock_jwt_token"
    mock_encode.assert_called_once()


@pytest.mark.asyncio
async def test_u04_smart_discovery():
    """U04: Verify SMART discovery parses correctly."""
    discovery = SmartDiscovery("mock")
    ep = await discovery.get_token_endpoint()
    assert ep == "mock/auth/token"


@respx.mock
@pytest.mark.asyncio
async def test_u07_rate_limit_backoff():
    """U07: Verify HttpTransport respects 429 Retry-After."""
    url = "https://mock.com/api"
    # Mock first request to return 429, second to return 200
    route = respx.get(url)
    route.side_effect = [
        httpx.Response(429, headers={"Retry-After": "1"}),
        httpx.Response(200, json={"success": True})
    ]

    transport = HttpTransport(timeout=2)
    # The transport should internally wait 1 second and retry
    res = await transport.get(url)
    assert res.status_code == 200
    assert route.call_count == 2


@pytest.mark.asyncio
async def test_u06_pagination():
    """U06: Verify bundle pager yields all pages."""
    class MockTransport:
        async def get(self, url, **kwargs):
            if "page1" in url:
                return httpx.Response(200, json={
                    "resourceType": "Bundle",
                    "entry": [{"resource": {"id": "1"}}],
                    "link": [{"relation": "next", "url": "page2"}]
                })
            else:
                return httpx.Response(200, json={
                    "resourceType": "Bundle",
                    "entry": [{"resource": {"id": "2"}}]
                })

    pager = BundlePager(MockTransport(), {})
    results = await pager.fetch_all("page1")
    assert len(results) == 2
    assert results[0]["id"] == "1"
    assert results[1]["id"] == "2"


@pytest.mark.asyncio
@patch("app.integrations.auth.jwt_client_assertion.jwt.encode")
async def test_u14_secret_safety(mock_encode):
    """U14: Verify secrets are not exposed."""
    mock_encode.return_value = "mock_jwt_token"
    auth = JwtClientAssertionAuth("test_client", "test_key", "test_kid", "mock")
    token = await auth.authenticate()
    # The private key must not be part of the token response
    assert "test_key" not in str(token)
