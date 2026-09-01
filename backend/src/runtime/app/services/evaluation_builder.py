import uuid
from datetime import datetime


class EvaluationBuilder:
    """
    AIS-003: Evaluation Builder
    Constructs the final, structured Evaluation Package ensuring no probabilistic data is included.
    """

    def __init__(self, db_session):
        self.db = db_session

    async def build(
            self,
            context_package: dict,
            sufficiency_status: str,
            governance_status: dict) -> dict:
        """
        Assembles the output evaluation package required for downstream modules (AIS-004).
        """
        return {
            "identity": {
                "evaluation_id": str(uuid.uuid4()),
                "context_id": context_package["identity"]["context_id"],
                "timestamp": datetime.utcnow().isoformat()
            },
            "evidence_summary": {
                "used": len(context_package.get("evidence", {}).get("used", [])),
                "missing": len(context_package.get("evidence", {}).get("missing", [])),
                "conflicts": len(context_package.get("evidence", {}).get("conflicts", []))
            },
            "governance_summary": {
                "sufficiency_status": sufficiency_status,
                "governance_status": "Passed" if governance_status["passed"] else "Failed",
                "authority_status": context_package.get("governance", {}).get("authority_boundary", "Unknown"),
                "human_review_requirement": self._determine_review_req(sufficiency_status)
            },
            "processing_status": "Evaluation Complete"
        }

    def _determine_review_req(self, sufficiency_status: str) -> bool:
        return sufficiency_status == "Conditionally Sufficient"
