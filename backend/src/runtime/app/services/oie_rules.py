from typing import List, Optional
from app.schemas.oie import OperationalSignal, Recommendation, RiskLevel, SignalCategory
import uuid

class BaseRule:
    def evaluate(self, signal: OperationalSignal) -> Optional[Recommendation]:
        raise NotImplementedError("Each rule must implement the evaluate method.")

class MissingInsuranceRule(BaseRule):
    """
    MS-004 Revenue Rule: Insurance missing AND Appointment today AND Provider scheduled
    """
    def evaluate(self, signal: OperationalSignal) -> Optional[Recommendation]:
        if signal.category != SignalCategory.REVENUE:
            return None
            
        data = signal.data
        if data.get("insurance_status") == "missing" and data.get("appointment_today") and data.get("provider_scheduled"):
            return Recommendation(
                id=str(uuid.uuid4()),
                problem="Insurance inactive / missing",
                reason="Eligibility check failed or missing from demographics.",
                business_impact="Claim denial likely; Potential Revenue Impact: $250",
                action="Verify insurance before check-in.",
                expected_outcome="Reduced denial probability.",
                risk_level=RiskLevel.HIGH,
                priority_score=85,
                explainability_log="Because: Insurance missing AND Appointment today AND Provider scheduled."
            )
        return None

class PatientWaitRule(BaseRule):
    """
    MS-004 Patient Flow Rule: Wait time > 30 mins AND Room congested
    """
    def evaluate(self, signal: OperationalSignal) -> Optional[Recommendation]:
        if signal.category != SignalCategory.PATIENT_FLOW:
            return None
            
        data = signal.data
        if data.get("wait_time_mins", 0) > 30 and data.get("room_congested"):
            return Recommendation(
                id=str(uuid.uuid4()),
                problem="Extended Patient Wait Time",
                reason="Wait time exceeded 30 minutes in congested waiting room.",
                business_impact="High risk of patient dissatisfaction and negative reviews.",
                action="Re-route to next available room and notify Clinic Administrator.",
                expected_outcome="Wait time mitigated, patient informed and retained.",
                risk_level=RiskLevel.HIGH,
                priority_score=80,
                explainability_log="Because: Wait time > 30 mins AND Waiting room congested."
            )
        return None

class MissingDocumentationRule(BaseRule):
    """
    MS-004 Clinical Workflow Rule: Provider note delayed AND Encounter incomplete
    """
    def evaluate(self, signal: OperationalSignal) -> Optional[Recommendation]:
        if signal.category != SignalCategory.CLINICAL_WORKFLOW:
            return None
            
        data = signal.data
        if data.get("note_status") == "delayed" and data.get("encounter_status") == "incomplete":
            return Recommendation(
                id=str(uuid.uuid4()),
                problem="Missing Clinical Documentation",
                reason="Provider note is delayed leaving encounter incomplete.",
                business_impact="Delay in clinical decision, billing hold-up.",
                action="Mark for immediate doctor signature in EHR.",
                expected_outcome="Timely diagnosis and billing cycle unblocked.",
                risk_level=RiskLevel.MODERATE,
                priority_score=65,
                explainability_log="Because: Provider note delayed AND Encounter incomplete."
            )
        return None

class ProviderOverloadRule(BaseRule):
    """
    MS-004 Operational Capacity Rule: Provider overbooked AND Staff shortage
    """
    def evaluate(self, signal: OperationalSignal) -> Optional[Recommendation]:
        if signal.category != SignalCategory.OPERATIONAL_CAPACITY:
            return None
            
        data = signal.data
        if data.get("provider_capacity") == "overbooked" and data.get("staff_shortage"):
            return Recommendation(
                id=str(uuid.uuid4()),
                problem="Provider Overload",
                reason="Provider schedule is overbooked during a staff shortage.",
                business_impact="Potential patient walk-outs and staff burnout.",
                action="Schedule Callback Task for front-desk to reschedule non-urgent visits.",
                expected_outcome="Schedule balanced, staff burden reduced.",
                risk_level=RiskLevel.CRITICAL,
                priority_score=95,
                explainability_log="Because: Provider overbooked AND Staff shortage."
            )
        return None

class ConnectorHealthRule(BaseRule):
    """
    MS-004 Connector Health Rule: Practice Fusion unavailable
    """
    def evaluate(self, signal: OperationalSignal) -> Optional[Recommendation]:
        if signal.category != SignalCategory.CONNECTOR_HEALTH:
            return None
            
        data = signal.data
        if data.get("connector_status") == "unavailable" and data.get("connector_name") == "Practice Fusion":
            return Recommendation(
                id=str(uuid.uuid4()),
                problem="EHR Connector Offline",
                reason="Practice Fusion API is unresponsive.",
                business_impact="Live schedule updates and clinical syncing halted.",
                action="Switch to offline/read-only mode. Reconnection attempts pending.",
                expected_outcome="System stability maintained during outage.",
                risk_level=RiskLevel.CRITICAL,
                priority_score=100,
                explainability_log="Because: Practice Fusion unavailable."
            )
        return None

class OIERulesEngine:
    def __init__(self):
        # Register deterministic rules
        self.rules: List[BaseRule] = [
            MissingInsuranceRule(),
            PatientWaitRule(),
            MissingDocumentationRule(),
            ProviderOverloadRule(),
            ConnectorHealthRule()
        ]
        
    def evaluate_signal(self, signal: OperationalSignal) -> List[Recommendation]:
        recommendations = []
        for rule in self.rules:
            rec = rule.evaluate(signal)
            if rec:
                recommendations.append(rec)
        return recommendations
