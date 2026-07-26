import httpx
from typing import Dict, Any, List
import logging
from .base_connector import BaseConnector

class PracticeFusionConnector(BaseConnector):
    """
    Practice Fusion Connector implementing SES-005.
    Retrieves records and translates them into Sentinel Canonical Events.
    No business logic is performed here.
    """

    def __init__(self, connector_id: str):
        super().__init__(connector_id=connector_id, name="Practice Fusion")
        self.api_key = None
        self.base_url = "https://api.practicefusion.com/v1"
        self.headers = {}

    async def authenticate(self, config: Dict[str, Any]) -> bool:
        """
        Validates credentials and prepares the client headers.
        """
        self.api_key = config.get("api_key")
        endpoint = config.get("endpoint")
        if endpoint:
            self.base_url = endpoint
            
        if not self.api_key:
            self.logger.error("Missing api_key in config")
            return False

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        # Test authentication with a lightweight call (or rely on retrieve_data)
        # For simplicity in V1, we assume true if key exists. True auth is verified during retrieve.
        return True

    async def retrieve_data(self) -> List[Dict[str, Any]]:
        """
        Fetches the raw patient list (or appointments) from Practice Fusion.
        """
        url = f"{self.base_url}/Patient"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                return data.get("entry", [])
        except httpx.HTTPStatusError as e:
            self.logger.error(f"HTTP Error: {e.response.status_code}")
            raise Exception(f"Unauthorized or Invalid Key: {e.response.status_code}")
        except httpx.RequestError as e:
            self.logger.error(f"Network error: {str(e)}")
            raise Exception(f"Network error: {str(e)}")

    async def validate_data(self, raw_record: Dict[str, Any]) -> bool:
        """
        Ensure the raw FHIR-like resource is valid.
        """
        resource = raw_record.get("resource", {})
        if not resource:
            return False
        # Basic check for Patient data
        if resource.get("resourceType") != "Patient" and "name" not in resource:
            return False
        return True

    async def transform_to_canonical(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transforms a PF Patient into a Sentinel Canonical Event.
        """
        resource = raw_record.get("resource", {})
        patient_id = resource.get("id", "UNKNOWN")
        
        names = resource.get("name", [])
        patient_name = "Unknown"
        if names:
            name_obj = names[0]
            first = name_obj.get("given", [""])[0]
            last = name_obj.get("family", "")
            patient_name = f"{first} {last}".strip()

        # Generate a Canonical Detail String
        detail = f"Patient {patient_name} (ID: {patient_id}) updated in Practice Fusion."

        return {
            "event_type": "EHR_Update",
            "detail": detail,
            "patient_id": patient_id,
            "patient_name": patient_name,
            "raw_source_data": raw_record # Preserve raw data for reference
        }
