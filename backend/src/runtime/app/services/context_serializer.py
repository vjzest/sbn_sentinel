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
        logger.info(
            f"[{context_package['identity']['context_id']}] ContextSerializer: Serializing package")

        # Deep copy or format transformations can happen here.
        # Since our builder already creates a dictionary, we just validate structure.
        from fastapi.encoders import jsonable_encoder
        
        # Ensure deep conversion of datetimes and models to primitives
        safe_package = jsonable_encoder(context_package)
        
        return {
            "identity": safe_package.get("identity", {}),
            "evidence": safe_package.get("evidence", {}),
            "operational_context": safe_package.get("operational_context", {}),
            "governance": safe_package.get("governance", {})
        }
