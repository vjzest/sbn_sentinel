import httpx
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class PracticeFusionClient:
    """
    Real integration client for Practice Fusion using FHIR standards.
    Requires a valid OAuth 2.0 Bearer token.
    """
    
    def __init__(self, api_key: str, base_url: str = "https://api.practicefusion.com/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        # In a production environment, you would use a persistent client pool.
        
    async def get_patients(self) -> List[Dict[str, Any]]:
        """
        Fetches the real patient list from Practice Fusion.
        """
        url = f"{self.base_url}/Patient"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=10.0)
                
                # If credentials are fake/missing, this will correctly raise an HTTP error (e.g., 401)
                response.raise_for_status()
                
                data = response.json()
                return data.get("entry", [])
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Practice Fusion API Error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Failed to fetch from Practice Fusion: Unauthorized or Invalid Key (Status {e.response.status_code})")
        except httpx.RequestError as e:
            logger.error(f"Network error connecting to Practice Fusion: {str(e)}")
            raise Exception(f"Network error connecting to Practice Fusion API: {str(e)}")

    async def get_appointments(self, date_str: str) -> List[Dict[str, Any]]:
        """
        Fetches the clinic's schedule/encounters for a specific date.
        """
        url = f"{self.base_url}/Appointment?date={date_str}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=10.0)
                response.raise_for_status()
                return response.json().get("entry", [])
        except Exception as e:
            logger.error(f"Failed to fetch appointments: {str(e)}")
            raise

