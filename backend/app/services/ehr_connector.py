from abc import ABC, abstractmethod
from typing import List, Dict, Any

class EHRConnector(ABC):
    """
    Abstract Base Class representing an external EHR/PM system.
    All integrations (e.g., Practice Fusion, AthenaHealth, Epic) must implement this interface.
    
    Principle 1 Enforcement: This interface exposes read-only operations.
    Write operations to production systems are strictly prohibited in V1.
    """
    
    @abstractmethod
    async def get_patients(self) -> List[Dict[str, Any]]:
        """Fetch the patient list."""
        pass
        
    @abstractmethod
    async def get_appointments(self, date_str: str) -> List[Dict[str, Any]]:
        """Fetch the clinic's schedule/encounters for a specific date."""
        pass
        
    @abstractmethod
    async def get_medication_requests(self, patient_id: str) -> List[Dict[str, Any]]:
        """Fetch active medication requests/prescriptions for a patient."""
        pass
        
    @abstractmethod
    async def get_diagnostic_reports(self, patient_id: str) -> List[Dict[str, Any]]:
        """Fetch diagnostic reports (labs, imaging) for a patient."""
        pass
        
    @abstractmethod
    async def get_observations(self, patient_id: str) -> List[Dict[str, Any]]:
        """Fetch clinical observations (vitals, lab results) for a patient."""
        pass
