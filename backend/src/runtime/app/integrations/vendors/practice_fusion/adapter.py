from typing import Dict, Any, List
from app.integrations.core.contracts import IntegrationAdapter, AuthStrategy
from app.services.ingress_service import canonical_ingress


class PracticeFusionAdapter(IntegrationAdapter):
    """
    Thin adapter for Practice Fusion FHIR.
    Relies on shared FHIR behaviors, auth, and transport layers.
    """

    def __init__(self, auth: AuthStrategy, manifest: Any, config: Dict[str, Any]):
        self.auth = auth
        self.manifest = manifest
        self.config = config
        self.connector_id = config.get("id", "PF-SYS")

    async def get_capability_statement(self) -> Dict[str, Any]:
        """Fetch vendor capability metadata."""
        # Simulated CapabilityStatement logic for the moment
        # Real implementation would call GET /metadata
        return {
            "Patient": True,
            "Encounter": True,
            "Coverage": True,
            "Appointment": False,  # Explicitly missing or unverified
        }

    async def get_resource(self, resource_type: str, query_params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        # Simulate fetch using auth
        _ = await self.auth.authenticate()

        # Simulate resource retrieval
        return [{"id": "123", "resourceType": resource_type, "status": "active"}]

    async def sync(self) -> Dict[str, Any]:
        """
        Main sync entrypoint.
        Note: The real incremental sync loop belongs in the shared sync/cursor
        module, but for scaffolding we provide this interface to satisfy ConnectorManager.
        """
        # Validate capabilities first
        _ = await self.get_capability_statement()

        # In a real sync we would iterate over supported resources defined in manifest
        records = await self.get_resource("Patient")

        # Transform and submit to ingress
        canonical_records = []
        for r in records:
            canonical_records.append({
                "context_type": "Patient",
                "vendor": "Practice Fusion",
                "detail": r
            })

        await canonical_ingress.submit_batch(self.connector_id, canonical_records)

        return {
            "status": "Success",
            "duration_ms": 100,
            "processed": len(canonical_records)
        }
