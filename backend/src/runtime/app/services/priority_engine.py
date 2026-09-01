class PriorityEngine:
    """
    AIS-004: Priority Engine
    Assigns an operational priority (e.g., Critical, High, Medium, Low, Informational)
    based on the operational urgency of the recommendation.
    """

    def __init__(self, db_session):
        self.db = db_session

    async def assign(self, raw_recommendation: dict) -> str:
        """
        Calculates priority deterministically.
        Priority reflects operational urgency, not AI confidence.
        """
        category = raw_recommendation.get("category", "")
        if category == "Operational":
            return "High"
        elif category == "Administrative":
            return "Medium"
        elif category == "Governance":
            return "Critical"
        return "Low"
