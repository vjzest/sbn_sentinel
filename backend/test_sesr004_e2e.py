import sys
import asyncio
from datetime import datetime

# Setup event loop for Windows
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from app.services.processing_orchestrator import processing_orchestrator
from app.db.database import SessionLocal
from app.models.event import OperationalEventModel

def run_test():
    
    # 1. Create Event
    event = processing_orchestrator.create_event(
        event_type="Appointment",
        source="EHR",
        raw_payload={"patient": "John Doe", "status": "No-Show"},
        initiated_by="TestScript"
    )
    
    # 2. Process in "background"
    processing_orchestrator.process_event_background(event.id)
    
    # 3. Check Trace
    trace = processing_orchestrator.get_event_trace(event.id)
    
    if not trace:
        print("ERROR: Trace not found.")
        sys.exit(1)
        
    print(f"Status: {trace.get('state')}")
    print(f"Intelligence: {trace.get('operational_intelligence')}")
    print(f"Revenue Intel: {trace.get('revenue_intelligence')}")
    
    assert trace.get("state") == "Completed"
    print("SUCCESS: SESR-004 E2E Governance Processing Completed!")

if __name__ == "__main__":
    run_test()
