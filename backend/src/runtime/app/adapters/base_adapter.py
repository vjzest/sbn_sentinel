from abc import ABC, abstractmethod
from typing import Dict, Any
from app.models.canonical import CanonicalEvent

class BaseEHRAdapter(ABC):
    """
    Abstract base class for EHR adapters.
    Ensures that all vendor-specific payloads are transformed into CanonicalEvents
    before they enter Sentinel Core.
    """
    
    @abstractmethod
    def to_canonical(self, raw_payload: Dict[str, Any], event_id: str, event_type: str, source: str) -> CanonicalEvent:
        """
        Transform a vendor-specific payload into a Sentinel CanonicalEvent.
        """
        pass
