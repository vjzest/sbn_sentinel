from app.services.evidence_engine import evidence_repository
from app.services.governance_registry import governance_registry
from app.models.decision_record import DecisionRecordModel
from app.services.processing_orchestrator import processing_orchestrator
from app.db.database import Base, engine, SessionLocal
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src/runtime")))

Base.metadata.create_all(bind=engine)
raw_payload = {
    "event_type": "EHR",
    "detail": "no-show",
    "primary_context": "Operational",
    "secondary_context": "Provider Schedule Gap"
}
event = processing_orchestrator.create_event(event_type="EHR", source="EHR_SYSTEM", raw_payload=raw_payload, priority="High")
processing_orchestrator.process_event_background(event.id)

items = list(evidence_repository._storage.values())
for e in items:
    print(e.fact_value)
