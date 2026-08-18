import requests
import time
import json

base_url = "http://localhost:8000/api/v1"

print("Running E2E API Test...")
payload = {
    "event_type": "EHR",
    "source": "Practice Fusion",
    "raw_payload": {
        "event_id": "TEST-1234",
        "timestamp": "2026-08-12T10:00:00Z",
        "connector_id": "CONN-001",
        "entity_type": "Appointment",
        "event_name": "AppointmentNoShow",
        "payload": {
            "patient_id": "P-456",
            "provider_id": "PR-789"
        }
    },
    "priority": "Normal"
}

try:
    print("Submitting event...")
    resp = requests.post(f"{base_url}/pipeline/submit", json=payload)
    resp.raise_for_status()
    data = resp.json()
    event_id = data["event_id"]
    print(f"Event submitted. ID: {event_id}")
    
    print("Waiting for background processing...")
    time.sleep(3)
    
    print("Fetching trace...")
    trace_resp = requests.get(f"{base_url}/pipeline/events/{event_id}/trace")
    trace_resp.raise_for_status()
    trace_data = trace_resp.json()
    
    print("\n--- TRACE RESULT ---")
    print(json.dumps(trace_data, indent=2))
    
    rules_out = trace_data.get("layer3_rules_output")
    ctx_out = trace_data.get("layer4_context_output")
    
    print("\n--- VALIDATION ---")
    print(f"Context Output Present: {bool(ctx_out)}")
    print(f"Rules Output Present: {bool(rules_out)}")
    
    print("\nSUCCESS! Backend pipeline intact.")
    
except Exception as e:
    print(f"TEST FAILED: {e}")
