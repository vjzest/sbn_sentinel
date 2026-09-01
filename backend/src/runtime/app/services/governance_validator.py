class GovernanceValidator:
    """
    AIS-003: Governance Validator
    Validates if the evaluated evidence package meets the mandatory governance criteria
    required to proceed to recommendation generation.
    """

    def __init__(self, db_session):
        self.db = db_session

    async def validate(self, sufficiency_status: str, governance_metadata: dict) -> dict:
        """
        Final check before evaluation completes.
        Returns a dict indicating if governance passed and the reason if it failed.
        """
        # Rule: Sentinel cannot proceed if evidence is strictly "Insufficient"
        if sufficiency_status == "Insufficient":
            return {
                "passed": False,
                "reason": "Governance blocked: Evidence sufficiency is Insufficient."
            }

        # Rule: Check if authority boundaries allow us to even evaluate
        if governance_metadata.get("authority_boundary") == "Administrative Block":
            return {
                "passed": False,
                "reason": "Governance blocked: Administrative override active."
            }

        # Rule: AIS-011 Every evaluation must have a linked Policy and Rule Version ID
        if not governance_metadata.get(
                "policy_version_id") or not governance_metadata.get("rule_version_id"):
            return {
                "passed": False,
                "reason": "Governance blocked: Missing mandatory AIS-011 Version IDs for Policy or Rule."}

        return {
            "passed": True,
            "reason": None
        }
