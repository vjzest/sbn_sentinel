from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PatientInsuranceCreate(BaseModel):
    patient_name: str
    provider_name: str
    member_id: str
    group_number: Optional[str] = None
    payer_id: Optional[str] = None


class PatientInsuranceResponse(BaseModel):
    id: int
    patient_name: str
    provider_name: str
    member_id: str
    group_number: Optional[str] = None
    payer_id: Optional[str] = None
    eligibility_status: str
    copay_primary: float
    copay_specialist: float
    deductible: float
    ocr_raw_text: Optional[str] = None
    last_verified: datetime

    class Config:
        from_attributes = True


class OCRScanResponse(BaseModel):
    provider_name: str
    member_id: str
    group_number: Optional[str] = None
    payer_id: Optional[str] = None
    confidence_score: float
    ocr_raw_text: str
