from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime
from app.db.database import Base

class PatientInsuranceModel(Base):
    __tablename__ = "patient_insurances"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_name = Column(String, index=True, nullable=False)
    provider_name = Column(String, nullable=False)  # e.g., Blue Cross Blue Shield, Aetna, Cigna
    member_id = Column(String, nullable=False)      # Policy ID
    group_number = Column(String, nullable=True)
    payer_id = Column(String, nullable=True)        # Clearinghouse Payer ID
    eligibility_status = Column(String, default="Unverified")  # Active, Inactive, Unverified
    copay_primary = Column(Float, default=0.0)
    copay_specialist = Column(Float, default=0.0)
    deductible = Column(Float, default=0.0)
    ocr_raw_text = Column(String, nullable=True)    # Raw text extracted from OCR scanning
    last_verified = Column(DateTime, default=datetime.utcnow)
