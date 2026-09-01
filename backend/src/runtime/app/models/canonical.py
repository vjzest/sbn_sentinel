from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class CanonicalAppointment(BaseModel):
    appointment_id: str
    patient_id: str
    provider_id: str
    status: str
    scheduled_time: Optional[datetime] = None


class CanonicalPatient(BaseModel):
    patient_id: str
    name: str
    dob: Optional[str] = None


class CanonicalEvent(BaseModel):
    """
    Standardized operational event that Sentinel Core understands.
    Vendor-specific raw payloads MUST be converted to this canonical model
    before entering the Evidence Engine.
    """
    event_id: str
    event_type: str
    source_system: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Standardized metadata extracted from vendor payload
    canonical_metadata: Dict[str, Any] = Field(default_factory=dict)

    # Specific canonical entities if applicable
    appointment: Optional[CanonicalAppointment] = None
    patient: Optional[CanonicalPatient] = None
