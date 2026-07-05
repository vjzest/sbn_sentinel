import asyncio
import random
import uuid
from datetime import datetime, timezone
from app.schemas.signal import SignalEvent
from app.db.database import SessionLocal
from app.models.signal import SignalModel

from app.services.intelligence_engine import intelligence_engine

class SimulationEngine:
    def __init__(self):
        self.running = False
        self.clients = []
        
        self.patients = ["John Doe", "Jane Smith", "Michael Johnson", "Emily Davis", "Robert Brown"]
        self.events = [
            {"source": "Practice Fusion", "type": "EHR", "msg_template": "Patient {patient} appointment marked as No-Show."},
            {"source": "Practice Fusion", "type": "EHR", "msg_template": "New appointment booked by {patient}."},
            {"source": "Twilio", "type": "Phone", "msg_template": "Missed call from {patient} (+1-555-0198)."},
            {"source": "Outlook", "type": "Email", "msg_template": "Email received from Lab Corp regarding {patient} results."},
            {"source": "Practice Fusion", "type": "EHR", "msg_template": "Patient {patient} wait time has reached 45 minutes."}
        ]

    async def generate_realistic_data(self):
        while self.running:
            await asyncio.sleep(random.uniform(3, 8)) # Generate an event every 3 to 8 seconds
            
            patient = random.choice(self.patients)
            event_template = random.choice(self.events)
            message_str = event_template["msg_template"].format(patient=patient)
            
            # --- INTELLIGENCE PIPELINE (Teacher-Student Strategy) ---
            # This handles HIPAA masking, OpenAI evaluation, and Local ML fallback automatically
            ai_result = intelligence_engine.evaluate(
                event_type=event_template["type"],
                metadata={"patient_name": patient, "detail": message_str}
            )
            
            # Create the final event
            event = SignalEvent(
                id=str(uuid.uuid4())[:8],
                source=event_template["source"],
                type=event_template["type"],
                message=message_str,
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata={"patient_name": patient, "priority": ai_result.get("priority", "Medium")},
                ai_insight=ai_result.get("ai_insight", ""),
                recommended_action=ai_result.get("recommended_action", "")
            )
            
            # Save to PostgreSQL database
            try:
                db = SessionLocal()
                db_signal = SignalModel(
                    id=event.id,
                    source=event.source,
                    type=event.type,
                    message=event.message,
                    timestamp=datetime.fromisoformat(event.timestamp),
                    metadata_data=event.metadata,
                    ai_insight=event.ai_insight,
                    recommended_action=event.recommended_action
                )
                db.add(db_signal)
                db.commit()
            except Exception as e:
                print(f"Failed to save signal to database: {e}")
            finally:
                if 'db' in locals():
                    db.close()
            
            await self.broadcast(event)

    async def broadcast(self, event: SignalEvent):
        # We will push to all connected WebSocket clients
        for q in self.clients:
            await q.put(event.model_dump_json())

    def start(self):
        if not self.running:
            self.running = True
            asyncio.create_task(self.generate_realistic_data())

    def stop(self):
        self.running = False

    def add_client(self, queue: asyncio.Queue):
        self.clients.append(queue)
        
    def remove_client(self, queue: asyncio.Queue):
        if queue in self.clients:
            self.clients.remove(queue)

simulation_engine = SimulationEngine()
