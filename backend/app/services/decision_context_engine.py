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
        Classifies operational context based on the rule finding and metadata.
        Payload expects: {"finding": Dict, "metadata": Dict}
        """
        rule_finding = payload.get("finding", {})
        metadata = payload.get("metadata", {})
        
        rule_id = rule_finding.get("rule_id", "")
        detail = metadata.get("detail", "").lower()
        
        # Default Context
        context = {
            "primary_context": "Context Unknown",
            "secondary_context": "Not Available",
            "confidence": "Low",
            "reason": "Insufficient information to classify context."
        }
        
        if rule_id == "SCH-001":  # No-show
            context = {
                "primary_context": "Operational",
                "secondary_context": "Provider Schedule Gap",
                "confidence": "High",
                "reason": "Appointment marked as No-Show creates immediate unused capacity in provider schedule."
            }
        elif rule_id == "SCH-002":  # Wait time exceeded
            context = {
                "primary_context": "Operational",
                "secondary_context": "Queue Congestion",
                "confidence": "High",
                "reason": "Patient waiting >45 minutes indicates provider bottleneck or capacity surge."
            }
        elif rule_id == "SCH-003":  # New appointment
            if "walk-in" in detail or "same-day" in detail:
                context = {
                    "primary_context": "Access",
                    "secondary_context": "Same-Day Convenience",
                    "confidence": "High",
                    "reason": "Walk-in patient + No scheduled PCP visit + Same-day arrival."
                }
            else:
                context = {
                    "primary_context": "Administrative",
                    "secondary_context": "Routine Booking",
                    "confidence": "Moderate",
                    "reason": "Standard forward-looking schedule addition."
                }
        elif rule_id == "OPS-001":  # Missed call
            context = {
                "primary_context": "Operational",
                "secondary_context": "Staff Overload",
                "confidence": "Moderate",
                "reason": "Inbound communication failure indicates front-desk saturation or understaffing."
            }
        elif rule_id == "CLIN-001":  # Pending lab review
            context = {
                "primary_context": "Clinical Workflow",
                "secondary_context": "Documentation Dependency",
                "confidence": "High",
                "reason": "Lab report delivered but lacks provider signature for closure."
            }
            
        return context

decision_context_engine = DecisionContextEngine()
