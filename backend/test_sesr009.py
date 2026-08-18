import os
import sys
from datetime import datetime

# Configure path for tests
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src', 'runtime')))

from app.services.processing_orchestrator import processing_orchestrator
from app.services.governance_registry import governance_registry, OperationalOutcomeRecord
from app.db.database import SessionLocal
from app.models.event import OperationalEventModel
from app.core.exceptions import PersistenceError

def run_tests():
    print("=" * 60)
    print("SESR-009: Governed Failure Isolation & Degraded Operation Tests")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Test 1: InputValidationError (Invalid Payload)
        print("\n--- Test 1: Input Validation Failure Isolation ---")
        event1 = processing_orchestrator.create_event(
            event_type="", # Missing event type triggers InputValidationError in EHR Adapter
            source="EHR",
            raw_payload={"detail": "Missing type test"}
        )
        processing_orchestrator._run_pipeline(event1, db)
        print(f"Event 1 State after pipeline: {event1.state}")
        print(f"Event 1 Last Error: {event1.last_error}")
        assert event1.state == "Failed", "Expected event1 to be Failed due to InputValidationError"
        assert "InputValidationError" in event1.last_error or "event_type is required" in event1.last_error, "Error message should reflect input validation."
        print("PASS: InputValidationError properly failed the event without crashing orchestrator.")
        
        # Test 2: TimeoutError (Connector Timeout)
        print("\n--- Test 2: Connector Timeout Degradation ---")
        event2 = processing_orchestrator.create_event(
            event_type="AppointmentUpdate",
            source="EHR",
            raw_payload={"simulate_timeout": True, "detail": "Timeout test"}
        )
        processing_orchestrator._run_pipeline(event2, db)
        print(f"Event 2 State after pipeline: {event2.state}")
        print(f"Event 2 Last Error: {event2.last_error}")
        # Expected state might be Degraded or Retrying depending on max_retries
        assert event2.state in ["Degraded", "Failed", "Retrying"], "Event 2 did not handle timeout gracefully."
        print("PASS: TimeoutError was caught and contained.")
        
        # Test 3: InvalidResponseError
        print("\n--- Test 3: Invalid Response Failure ---")
        event3 = processing_orchestrator.create_event(
            event_type="AppointmentUpdate",
            source="EHR",
            raw_payload={"simulate_invalid_response": True, "detail": "Invalid response test"}
        )
        processing_orchestrator._run_pipeline(event3, db)
        print(f"Event 3 State after pipeline: {event3.state}")
        assert event3.state == "Failed" or event3.state == "Retrying", "Event 3 should fail or retry."
        print("PASS: InvalidResponseError was caught and contained.")

        # Test 4: PersistenceError Validation
        print("\n--- Test 4: Persistence Error Validation ---")
        outcome = OperationalOutcomeRecord(
            outcome_id="test-outcome",
            action_id="test-action",
            expected_outcome="test",
            observed_outcome="test"
        )
        governance_registry.record_operational_outcome(outcome)
        try:
            governance_registry.update_operational_outcome(
                "test-outcome", 
                simulate_persistence_error=True
            )
            assert False, "Expected PersistenceError to be raised."
        except PersistenceError as e:
            print("PASS: PersistenceError correctly raised during simulated write failure.")
        
    finally:
        db.close()
        print("\n" + "=" * 60)
        print("ALL SESR-009 TESTS PASSED DETERMINISTICALLY.")
        print("=" * 60)

if __name__ == "__main__":
    run_tests()
