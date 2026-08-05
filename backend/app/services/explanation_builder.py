import uuid
from datetime import datetime

class ExplanationBuilder:
    """
    AIS-005: Explanation Builder
    Assembles the final structured Explanation Package, translating technical identifiers
    into human-readable operational reasoning.
    """

    def __init__(self, db_session):
        self.db = db_session

    async def build(self, recommendation_package: dict, decision_trace: dict, 
                    evidence_trace: dict, rule_policy_trace: dict, 
                    alternative_analysis: list) -> dict:
        """
        Constructs the Explanation Package output for AIS-005.
        """
        
        # Build Human-Readable Reasoning string based on rule_policy_trace and evidence
        # In a real system, this would use templates based on the rule.
        human_reasoning = (
            f"Based on Policy {rule_policy_trace.get('policy_id')} and Rule "
            f"{rule_policy_trace.get('rule_id')}, the evidence satisfied the configured threshold, "
            f"resulting in a recommendation to proceed."
        )

        return {
            "identity": {
                "explanation_id": str(uuid.uuid4()),
                "recommendation_id": decision_trace.get("recommendation_id"),
                "timestamp": datetime.utcnow().isoformat()
            },
            "human_readable": {
                "reasoning": human_reasoning,
                "alternatives_rejected": alternative_analysis
            },
            "technical_trace": {
                "decision_trace": decision_trace,
                "evidence_trace": evidence_trace,
                "rule_policy_trace": rule_policy_trace
            },
            "status": "Complete"
        }
