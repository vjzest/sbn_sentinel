from typing import Dict, Any
from app.services.base_service import BaseService

class DecisionContextEngine(BaseService):
    """
    MS-006 Compliant Decision Context Engine (DCE).
    Identifies the likely operational context behind events deterministically.
    No predictive AI or self-learning.
    """
    
    @property
    def service_name(self) -> str:
        return "DecisionContextEngine"

    @property
    def version(self) -> str:
        return "v1.0"

    def __init__(self):
        pass

    def _process(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classifies operational context based on the EvidencePackage.
        Payload expects: {"evidence_package": Dict, "event_type": str}
        """
        evidence_package = payload.get("evidence_package", {})
        evidence_items = evidence_package.get("evidence_items", [])
        event_type = payload.get("event_type", "Unknown")
        
        # We look at the evidence facts to determine context.
        has_no_show = any(e.get("fact_value") == "NO_SHOW" for e in evidence_items)
        has_wait_time = any(e.get("fact_value") == "WAIT_TIME_EXCEEDED" for e in evidence_items)
        has_booked = any(e.get("fact_value") == "BOOKED" for e in evidence_items)
        has_missed_call = any(e.get("fact_value") == "MISSED_CALL" for e in evidence_items)
        has_pending_review = any(e.get("fact_value") == "PENDING_REVIEW" for e in evidence_items)
        
        # Default Context
        context = {
            "primary_context": "Context Unknown",
            "secondary_context": "Not Available",
            "confidence": "Low",
            "reason": "Insufficient information to classify context."
        }
        
        if has_no_show:
            context = {
                "primary_context": "Operational",
                "secondary_context": "Provider Schedule Gap",
                "confidence": "High",
                "reason": "Appointment marked as No-Show creates immediate unused capacity in provider schedule.",
                "evidence_package": evidence_package,
                "event_type": event_type
            }
        elif has_wait_time:
            context = {
                "primary_context": "Operational",
                "secondary_context": "Queue Congestion",
                "confidence": "High",
                "reason": "Patient waiting >45 minutes indicates provider bottleneck or capacity surge.",
                "evidence_package": evidence_package,
                "event_type": event_type
            }
        elif has_booked:
            context = {
                "primary_context": "Administrative",
                "secondary_context": "Routine Booking",
                "confidence": "Moderate",
                "reason": "Standard forward-looking schedule addition.",
                "evidence_package": evidence_package,
                "event_type": event_type
            }
        elif has_missed_call:
            context = {
                "primary_context": "Operational",
                "secondary_context": "Staff Overload",
                "confidence": "Moderate",
                "reason": "Inbound communication failure indicates front-desk saturation or understaffing.",
                "evidence_package": evidence_package,
                "event_type": event_type
            }
        elif has_pending_review:
            context = {
                "primary_context": "Clinical Workflow",
                "secondary_context": "Documentation Dependency",
                "confidence": "High",
                "reason": "Lab report delivered but lacks provider signature for closure.",
                "evidence_package": evidence_package,
                "event_type": event_type
            }
            
        return context

decision_context_engine = DecisionContextEngine()
