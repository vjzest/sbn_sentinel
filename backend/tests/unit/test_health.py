import pytest
from fastapi.testclient import TestClient

# Import the FastAPI app instance
from app.main import app

client = TestClient(app)


@pytest.mark.unit
def test_read_main():
    """
    SES-011 Quality Gate: Basic Health Check Test
    Ensures the application starts and the root endpoint responds.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "message": "Welcome to SBN Sentinel Core Engine",
        "documentation": "/docs"
    }


@pytest.mark.unit
def test_health_endpoint():
    """
    SES-011 Quality Gate: API Health Endpoint Test
    """
    response = client.get("/api/v1/health")
    # Even if health endpoint returns 503 (due to no DB), we verify it doesn't crash 500.
    assert response.status_code in [200, 503]


@pytest.mark.unit
def test_jwks_public_url():
    """
    Verify that the JWKS endpoint is reachable at the public root URL:
      GET /.well-known/jwks.json

    It must NOT be at /api/v1/.well-known/jwks.json.
    A 503 is acceptable when JWT_PRIVATE_KEY is not configured in test env.
    A 404 means the route is missing or mis-mounted — test fails.
    """
    # Verify the correct public URL resolves
    response = client.get("/.well-known/jwks.json")
    assert response.status_code in [200, 503], (
        f"JWKS must be at /.well-known/jwks.json — got {response.status_code}. "
        "503 is acceptable (key not configured); 404 means route is mis-mounted."
    )

    # Verify the wrong URL (under /api/v1) does NOT resolve to JWKS
    wrong_response = client.get("/api/v1/.well-known/jwks.json")
    assert wrong_response.status_code == 404, (
        "JWKS must NOT be accessible under /api/v1/.well-known/jwks.json — "
        "it is a public root-level endpoint."
    )
