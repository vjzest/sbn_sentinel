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
