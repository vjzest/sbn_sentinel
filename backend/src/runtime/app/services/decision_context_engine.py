from typing import Dict, Any, List
from app.services.base_service import BaseService

class DecisionContextEngine(BaseService):
    """
    MS-006 / SESR-001 Compliant Decision Context Engine (DCE).
    Consumes EOS-003 (EvidenceStatusPackage) from the Evidence Engine.
    Resolves evidence from the repository via evidence_references.
    No predictive AI or self-learning. No raw evidence access.
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
        SESR-001: Classifies operational context from EOS-003 EvidenceStatusPackage.
        Payload expects: {"eos_003_package": EvidenceStatusPackage, "event_type": str}
        Resolves EvidenceObjects from the EvidenceRepository using evidence_references.
        """
        from app.services.evidence_engine import evidence_repository

        eos_003 = payload.get("eos_003_package")
        event_type = payload.get("event_type", "Unknown")

        # Resolve evidence objects from the repository using EOS-003 references
        evidence_items = []
        if eos_003:
            refs = getattr(eos_003, "evidence_references", [])
            for ref_id in refs:
                ev = evidence_repository.retrieve(ref_id)
                if ev:
                    evidence_items.append(ev)

        # Backward compatibility: also check legacy evidence_package key
        evidence_package = payload.get("evidence_package", {})
        if not evidence_items:
            evidence_items = evidence_package.get("evidence_items", [])
            
        # Extract from evidence_references if it's a dict representing EvidenceStatusPackage
        if not evidence_items and evidence_package.get("evidence_references"):
            for ref_id in evidence_package.get("evidence_references", []):
                ev = evidence_repository.retrieve(ref_id)
                if ev:
                    evidence_items.append(ev)
        
        def get_fact_value(e):
            return getattr(e, 'fact_value', None) if not isinstance(e, dict) else e.get('fact_value')
            
        has_no_show = any(get_fact_value(e) == "NO_SHOW" for e in evidence_items)
        has_wait_time = any(get_fact_value(e) == "WAIT_TIME_EXCEEDED" for e in evidence_items)
        has_booked = any(get_fact_value(e) == "BOOKED" for e in evidence_items)
        has_missed_call = any(get_fact_value(e) == "MISSED_CALL" for e in evidence_items)
        has_pending_review = any(get_fact_value(e) == "PENDING_REVIEW" for e in evidence_items)
        
        # Default Context
        context = {
            "primary_context": "Context Unknown",
            "secondary_context": "Not Available",
            "reason": "Insufficient information to classify context.",
            "evidence_package": evidence_package,
            "event_type": event_type
        }
        
        if has_no_show:
            context = {
                "primary_context": "Operational",
                "secondary_context": "Provider Schedule Gap",
                "reason": "Appointment marked as No-Show creates immediate unused capacity in provider schedule.",
                "evidence_package": evidence_package,
                "event_type": event_type
            }
        elif has_wait_time:
            context = {
                "primary_context": "Operational",
                "secondary_context": "Queue Congestion",
                "reason": "Patient waiting >45 minutes indicates provider bottleneck or capacity surge.",
                "evidence_package": evidence_package,
                "event_type": event_type
            }
        elif has_booked:
            context = {
                "primary_context": "Administrative",
                "secondary_context": "Routine Booking",
                "reason": "Standard forward-looking schedule addition.",
                "evidence_package": evidence_package,
                "event_type": event_type
            }
        elif has_missed_call:
            context = {
                "primary_context": "Operational",
                "secondary_context": "Staff Overload",
                "reason": "Inbound communication failure indicates front-desk saturation or understaffing.",
                "evidence_package": evidence_package,
                "event_type": event_type
            }
        elif has_pending_review:
            context = {
                "primary_context": "Clinical Workflow",
                "secondary_context": "Documentation Dependency",
                "reason": "Lab report delivered but lacks provider signature for closure.",
                "evidence_package": evidence_package,
                "event_type": event_type
            }
            
        # AIS-002: Build New Decision Context Package
        from app.services.context_builder import ContextBuilder
        from app.services.context_validator import ContextValidator
        from app.services.context_serializer import ContextSerializer
        
        # We run this synchronously to avoid breaking the existing BaseService caller
        import asyncio
        builder = ContextBuilder(None)
        validator = ContextValidator(None)
        serializer = ContextSerializer()
        
        try:
            # Create a simple event loop to run the async stubs if necessary, 
            # or just call them if we make them synchronous. 
            # Since we made them async, we use asyncio.run
            new_package = asyncio.run(builder.build(event_type, evidence_items))
            new_package = asyncio.run(validator.validate(new_package))
            serialized_package = serializer.serialize(new_package)
        except Exception:
            serialized_package = {"error": "Failed to build AIS-002 context"}

        # Inject AIS-002 Package into the legacy response to avoid breaking downstream
        context["ais_002_decision_context_package"] = serialized_package
        
        return context

decision_context_engine = DecisionContextEngine()
