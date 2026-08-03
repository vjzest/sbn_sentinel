import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def print_step(msg):
    print(f"\n[QA TEST] {msg}")

def test_api():
    print("=== STARTING END-TO-END QA AUTOMATION ===")
    
    # 1. Test Backend Health
    print_step("Testing Backend Health /ping")
    try:
        req = urllib.request.Request(f"{BASE_URL}/ping", method="GET")
        response = urllib.request.urlopen(req)
        print("✅ Backend is UP and running. Status:", response.status)
    except Exception as e:
        print("❌ Backend Health check failed:", e)

    # 2. Test Forgot Password / OTP Flow (Simulating Login)
    print_step("Testing Auth Flow (Forgot Password OTP generation)")
    try:
        data = json.dumps({"email": "doctor@clinic.com"}).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}/auth/forgot-password", data=data, method="POST")
        req.add_header('Content-Type', 'application/json')
        response = urllib.request.urlopen(req)
        print("✅ Auth endpoint responded successfully. Status:", response.status)
    except Exception as e:
        print("❌ Auth endpoint failed:", e)

    # 3. Frontend Reachability
    print_step("Testing Frontend Server Reachability (Next.js)")
    try:
        req = urllib.request.Request("http://localhost:3000", method="GET")
        response = urllib.request.urlopen(req)
        print("✅ Frontend is responding. Status:", response.status)
    except Exception as e:
        print("❌ Frontend reachability failed:", e)
        
    print("\n=== QA AUTOMATION COMPLETE ===")

if __name__ == "__main__":
    test_api()
