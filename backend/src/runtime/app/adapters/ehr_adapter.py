from typing import Dict, Any
from app.adapters.base_adapter import BaseEHRAdapter
from app.models.canonical import CanonicalEvent, CanonicalAppointment, CanonicalPatient
from app.core.exceptions import TimeoutError, InvalidResponseError, InputValidationError
from datetime import datetime

class DefaultEHRAdapter(BaseEHRAdapter):
    """
    A default implementation of an EHR adapter to map generic payloads to Sentinel's Canonical Model.
    """
    
    def to_canonical(self, raw_payload: Dict[str, Any], event_id: str, event_type: str, source: str) -> CanonicalEvent:
        # SES-009 Validation & Failure Isolation
        if raw_payload.get("simulate_timeout"):
            raise TimeoutError("Practice Fusion API Connection Timed Out.")
            
        if raw_payload.get("simulate_invalid_response"):
            raise InvalidResponseError("Practice Fusion returned malformed JSON or partial payload.")
            
        if not event_type:
            raise InputValidationError("event_type is required for CanonicalEvent mapping.")
            
        canonical_metadata = {}
        
        # Vendor-specific fields should be handled here.
        # For this default adapter, we just extract common properties.
        detail = raw_payload.get("detail", raw_payload.get("message", raw_payload.get("content", "")))
        canonical_metadata["detail"] = detail
        
        appointment = None
        patient = None
        
        # If payload contains vendor appointment fields, map them to CanonicalAppointment
        if "appointment_id" in raw_payload or "pf_appt_id" in raw_payload:
            appointment = CanonicalAppointment(
                appointment_id=str(raw_payload.get("appointment_id", raw_payload.get("pf_appt_id", "unknown"))),
                patient_id=str(raw_payload.get("patient_id", "unknown")),
                provider_id=str(raw_payload.get("provider_id", "unknown")),
                status=str(raw_payload.get("status", raw_payload.get("pf_status", "PENDING")))
            )
            
        if "patient_name" in raw_payload:
            patient = CanonicalPatient(
                patient_id=str(raw_payload.get("patient_id", "unknown")),
                name=str(raw_payload.get("patient_name", "Unknown Patient"))
            )
            
        return CanonicalEvent(
            event_id=event_id,
            event_type=event_type,
            source_system=source,
            timestamp=datetime.utcnow(),
            canonical_metadata=canonical_metadata,
            appointment=appointment,
            patient=patient
        )

# Instantiate a default adapter for use
default_ehr_adapter = DefaultEHRAdapter()
