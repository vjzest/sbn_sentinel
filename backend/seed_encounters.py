from app.db.database import engine, SessionLocal
from app.models.encounter import EncounterModel
from app.db.database import Base
from datetime import datetime

print("Creating tables...")
Base.metadata.create_all(bind=engine)

db = SessionLocal()
if db.query(EncounterModel).count() == 0:
    print("Seeding encounters...")
    encounters = [
        EncounterModel(id="ENC-001", patient_name="John Doe", provider_name="Dr. Smith", date=datetime.utcnow().isoformat(), type="Consultation", status="Completed", billing_status="Paid", copay=250.0, priority="Normal"),
        EncounterModel(id="ENC-002", patient_name="Jane Roe", provider_name="Dr. Smith", date=datetime.utcnow().isoformat(), type="Checkup", status="Completed", billing_status="Paid", copay=150.0, priority="Normal"),
        EncounterModel(id="ENC-003", patient_name="Sam Smith", provider_name="Dr. Allen", date=datetime.utcnow().isoformat(), type="Urgent Care", status="Waiting", billing_status="Pending", copay=300.0, priority="High"),
        EncounterModel(id="ENC-004", patient_name="Emily Davis", provider_name="Dr. Allen", date=datetime.utcnow().isoformat(), type="Consultation", status="Completed", billing_status="Claim Denied", copay=0.0, priority="Normal"),
        EncounterModel(id="ENC-005", patient_name="Michael Brown", provider_name="Dr. Johnson", date=datetime.utcnow().isoformat(), type="Follow-up", status="Completed", billing_status="Paid", copay=100.0, priority="Normal"),
    ]
    db.add_all(encounters)
    db.commit()
    print("Encounters seeded.")
else:
    print("Encounters already seeded.")
db.close()
