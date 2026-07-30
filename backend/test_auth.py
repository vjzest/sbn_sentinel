import sys
from fastapi.testclient import TestClient

try:
    from app.main import app
    client = TestClient(app)
    
    response = client.post("/api/v1/auth/login", json={"email": "superadmin@sbnsentinel.com", "password": "wrong"})
    print("STATUS:", response.status_code)
    print("BODY:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
