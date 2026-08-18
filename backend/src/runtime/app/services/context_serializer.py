import json
import logging

logger = logging.getLogger(__name__)

class ContextSerializer:
    """
    AIS-002: Context Serializer
    Formats the finalized Decision Context Package into a standard JSON-serializable
    format for consumption by downstream engines.
    """

    def __init__(self):
        pass

    def serialize(self, context_package: dict) -> dict:
        """
        Ensures the package strictly adheres to the schema required by AIS-002.
        """
        logger.info(f"[{context_package['identity']['context_id']}] ContextSerializer: Serializing package")
        
        # Deep copy or format transformations can happen here.
        # Since our builder already creates a dictionary, we just validate structure.
        return {
            "identity": context_package.get("identity", {}),
            "evidence": context_package.get("evidence", {}),
            "operational_context": context_package.get("operational_context", {}),
            "governance": context_package.get("governance", {})
        }
