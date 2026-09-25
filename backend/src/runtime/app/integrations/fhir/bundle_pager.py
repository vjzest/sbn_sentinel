from typing import Dict, Any, List, AsyncGenerator
import logging

logger = logging.getLogger(__name__)

class BundlePager:
    """
    Handles generic FHIR Bundle pagination using standard 'next' links.
    """
    def __init__(self, transport, headers: Dict[str, str]):
        self.transport = transport
        self.headers = headers

    async def fetch_all(self, initial_url: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Fetches all resources across all pages of a bundle.
        """
        resources = []
        async for batch in self.iterate(initial_url, params):
            resources.extend(batch)
        return resources

    async def iterate(self, initial_url: str, params: Dict[str, Any] = None) -> AsyncGenerator[List[Dict[str, Any]], None]:
        """
        Yields batches of resources from each page.
        """
        url = initial_url
        current_params = params

        while url:
            try:
                response = await self.transport.get(url, headers=self.headers, params=current_params)
                data = response.json()
                
                if data.get("resourceType") != "Bundle":
                    yield [data]
                    break
                    
                entries = data.get("entry", [])
                resources = [entry.get("resource", {}) for entry in entries if entry.get("resource")]
                
                if resources:
                    yield resources
                    
                # Find next page link
                next_link = next((link.get("url") for link in data.get("link", []) if link.get("relation") == "next"), None)
                url = next_link
                current_params = None  # Params are typically embedded in the next link
                
            except Exception as e:
                logger.error(f"Error paginating FHIR bundle at {url}: {e}")
                raise e
