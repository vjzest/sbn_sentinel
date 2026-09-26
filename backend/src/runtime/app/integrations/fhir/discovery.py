import logging
from typing import Dict, Any
from app.integrations.core.transport import HttpTransport

logger = logging.getLogger(__name__)


class SmartDiscovery:
    """
    Implements SMART on FHIR discovery (/.well-known/smart-configuration).
    Provides the token endpoint, authorization endpoint, and capabilities.
    """

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.transport = HttpTransport()

    async def get_smart_configuration(self) -> Dict[str, Any]:
        """
        Fetches the SMART configuration from the FHIR server.
        """
        discovery_url = f"{self.base_url}/.well-known/smart-configuration"



        try:
            response = await self.transport.get(discovery_url)
            return response.json()
        except Exception as e:
            logger.error(f"SMART discovery failed for {self.base_url}: {e}")
            raise ValueError(f"Failed to fetch SMART configuration: {e}")

    async def get_token_endpoint(self) -> str:
        """Helper to extract token endpoint."""
        config = await self.get_smart_configuration()
        endpoint = config.get("token_endpoint")
        if not endpoint:
            raise ValueError("Token endpoint not found in SMART configuration")
        return endpoint
