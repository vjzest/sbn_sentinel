from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime
from app.db.database import Base

class EncounterModel(Base):
    __tablename__ = "encounters"

    id = Column(String, primary_key=True, index=True)
    patient_name = Column(String, index=True, nullable=False)
    provider_name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    diagnosis = Column(String, nullable=True)
    type = Column(String, nullable=False)  # Consultation, Urgent Care, Checkup, etc.
    status = Column(String, default="Completed")  # Waiting, In Room, Completed, Delayed
    billing_status = Column(String, default="Pending")  # Pending, Billed, Paid, Claim Denied
    copay = Column(Float, default=245.0)
    priority = Column(String, default="Normal")  # High, Normal, Urgent
    wait_time = Column(String, nullable=True)
    department = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    clinical_notes = Column(String, nullable=True)
    medications = Column(String, nullable=True)
    payer_network = Column(String, default="Uninsured")
    cpt_code = Column(String, default="99213")
    billing_amount = Column(Float, default=95.0)
