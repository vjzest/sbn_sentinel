from abc import ABC, abstractmethod
from typing import Dict, Any, List


class IntegrationAdapter(ABC):
    """
    Base contract for all external integration adapters.
    Adapters are thin wrappers mapping generic framework calls
    to vendor-specific endpoints and behaviors.
    """

    @abstractmethod
    async def get_capability_statement(self) -> Dict[str, Any]:
        """Fetch vendor capability metadata."""
        pass

    @abstractmethod
    async def get_resource(
        self,
        resource_type: str,
        query_params: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """Generic resource fetch."""
        pass


class AuthStrategy(ABC):
    """
    Base contract for all authentication strategies.
    """

    @abstractmethod
    async def authenticate(self) -> Dict[str, Any]:
        """Authenticate and return credentials/tokens."""
        pass
