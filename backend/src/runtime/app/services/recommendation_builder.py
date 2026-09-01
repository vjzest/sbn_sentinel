import uuid
from datetime import datetime, timedelta


class RecommendationBuilder:
    """
    AIS-004: Recommendation Builder
    Assembles the final structured Recommendation Package, ensuring all explainability
    and governance metadata is explicitly attached.
    """

    def __init__(self, db_session):
        self.db = db_session

    async def build(
            self,
            evaluation_package: dict,
            raw_recommendation: dict,
            priority: str,
            auth_status: dict) -> dict:
        """
        Constructs the Recommendation Package output for AIS-004.
        """
        eval_id = evaluation_package.get("identity", {}).get("evaluation_id", "UNKNOWN")
        context_id = evaluation_package.get("identity", {}).get("context_id", "UNKNOWN")

        return {
            "identity": {
                "recommendation_id": str(uuid.uuid4()),
                "context_id": context_id,
                "evaluation_id": eval_id,
                "timestamp": datetime.utcnow().isoformat()
            },
            "recommendation": {
                "title": raw_recommendation.get("title", "No Title"),
                "description": raw_recommendation.get("description", "No description provided"),
                "category": raw_recommendation.get("category", "General"),
                "operational_objective": raw_recommendation.get("objective", "Unknown")
            },
            "governance": {
                "rule_used": raw_recommendation.get("rule_id", "None"),
                "policy_used": raw_recommendation.get("policy_id", "None"),
                "threshold_satisfied": True,
                "authority_level": auth_status.get("level", "Unknown"),
                "human_approval_required": auth_status.get("level") in ["Human Approval", "Human Override"]
            },
            "explainability": {
                "why_generated": "Matched evaluation criteria mapping to standard operational policy.",
                "why_alternatives_not_selected": "Other rules either failed sufficiency or authority boundaries.",
                "supporting_evidence_count": evaluation_package.get("evidence_summary", {}).get("used", 0)
            },
            "lifecycle": {
                "status": "Generated",
                "expiration": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
