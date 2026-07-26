import logging
from typing import Dict, Any
from app.services.base_service import BaseService

logger = logging.getLogger(__name__)

class IntelligenceEngine(BaseService):
    """
    Operational Intelligence Engine (OIE).
    Receives objective findings and context.
    Calculates priority, estimates impact, and generates executive recommendations.
    """
    
    @property
    def service_name(self) -> str:
        return "IntelligenceEngine"

    @property
    def version(self) -> str:
        return "v1.0"

    def __init__(self):
        self.mode = "Deterministic Rules Engine via OIE"

    def _process(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes 'finding' and 'context' and generates recommendations.
        """
        finding = payload.get("finding", {})
        context = payload.get("context", {})
        
        risk_level = finding.get("severity", "Information")
        problem = finding.get("description", "Routine event.")
        reason = finding.get("trigger", "Routine system event.")
        
        business_impact = "None"
        action = "None required."
        expected_outcome = "Operations continue as expected."
        
        rule_id = finding.get("rule_id", "")
        
        if rule_id == "SCH-001":
            business_impact = "-$150.00 estimated revenue loss."
            action = "Auto-send SMS reschedule link and dispatch $25 fee claim."
            expected_outcome = "Recovery of $25 fee and rescheduled visit."
        elif rule_id == "SCH-002":
            business_impact = "High risk of patient satisfaction drop and negative reviews."
            action = "Re-route to Room 3. Notify Clinic Administrator immediately."
            expected_outcome = "Wait time mitigated, patient informed."
        elif rule_id == "SCH-003":
            business_impact = "Potential revenue increase."
            expected_outcome = "Appointment added to schedule."
        elif rule_id == "OPS-001":
            business_impact = "Potential patient dissatisfaction or lost booking."
            action = "Schedule Callback Task for front-desk within 15 minutes."
            expected_outcome = "Issue resolved, patient retained."
        elif rule_id == "CLIN-001":
            business_impact = "Delay in clinical decision if unread."
            action = "Mark for immediate doctor signature in Practice Fusion."
            expected_outcome = "Timely diagnosis and patient notification."
        result = {
            "risk_level": risk_level,
            "problem": problem,
            "reason": reason,
            "business_impact": business_impact,
            "action": action,
            "expected_outcome": expected_outcome,
            "primary_context": context.get("primary_context", "General"),
            "secondary_context": context.get("secondary_context", ""),
            "context_confidence": context.get("confidence", "High"),
            "context_reason": context.get("reason", "")
        }
        
        return result

intelligence_engine = IntelligenceEngine()
