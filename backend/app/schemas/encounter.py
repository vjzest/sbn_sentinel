from pydantic import BaseModel
from typing import Optional

class EncounterCreate(BaseModel):
    id: str
    patient_name: str
    provider_name: str
    date: str
    diagnosis: Optional[str] = None
    type: str
    status: Optional[str] = "Waiting"
    billing_status: Optional[str] = "Pending"
    copay: Optional[float] = 245.0
    priority: Optional[str] = "Normal"
    wait_time: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    clinical_notes: Optional[str] = None
    medications: Optional[str] = None
    payer_network: Optional[str] = "Uninsured"
    cpt_code: Optional[str] = "99213"
    billing_amount: Optional[float] = 95.0

class EncounterUpdate(BaseModel):
    status: Optional[str] = None
    billing_status: Optional[str] = None
    diagnosis: Optional[str] = None
    wait_time: Optional[str] = None
    priority: Optional[str] = None
    clinical_notes: Optional[str] = None
    medications: Optional[str] = None
    payer_network: Optional[str] = None
    cpt_code: Optional[str] = None
    billing_amount: Optional[float] = None

class EncounterResponse(BaseModel):
    id: str
    patient_name: str
    provider_name: str
    date: str
    diagnosis: Optional[str] = None
    type: str
    status: str
    billing_status: str
    copay: float
    priority: str
    wait_time: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    clinical_notes: Optional[str] = None
    medications: Optional[str] = None
    payer_network: str
    cpt_code: str
    billing_amount: float

    class Config:
        from_attributes = True
