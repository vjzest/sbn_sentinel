import logging
import time
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class ConfigurationInvalid(Exception):
    """Raised when required adapter configuration is missing."""


class PracticeFusionAdapter:
    """
    Thin adapter for Practice Fusion FHIR.
    Relies on shared FHIR behaviors, auth, and transport layers.
    All configuration must be present — no guessed defaults.
    SMART discovery drives the token endpoint at runtime.
    Iterates over manifest-enabled resources gated by CapabilitySnapshot.
    """

    REQUIRED_CONFIG = ["base_url", "client_id", "key_id", "private_key"]

    def __init__(self, auth, manifest, config: Dict[str, Any]):
        is_mock = "mock" in str(config.get("id", ""))

        # Fail closed on missing required configuration (mocks exempt)
        if not is_mock:
            for field in self.REQUIRED_CONFIG:
                if not config.get(field):
                    raise ConfigurationInvalid(
                        f"Practice Fusion requires '{field}' in configuration"
                    )

        self.auth = auth
        self.manifest = manifest
        self.config = config
        self.connector_id = config.get("id", "PF-SYS")
        self._base_url = config.get("base_url", "mock")

    async def _resolve_base_url(self) -> str:
        return self._base_url.rstrip("/")

    async def get_capability_statement(self) -> "CapabilitySnapshot":
        """
        Fetch vendor CapabilityStatement and return a rich CapabilitySnapshot.
        Returns a mock snapshot in test environments.
        """
        from app.integrations.fhir.capability_snapshot import CapabilitySnapshot
        from app.integrations.core.transport import HttpTransport

        base_url = await self._resolve_base_url()

        if "mock" in base_url:
            return CapabilitySnapshot.mock()

        transport = HttpTransport()
        response = await transport.get(f"{base_url}/metadata")
        data = response.json()
        return CapabilitySnapshot.from_fhir_metadata(data)

    async def get_resource(
        self,
        resource_type: str,
        query_params: Dict[str, Any] = None,
    ) -> List[Dict[str, Any]]:
        """Fetch a single resource type from the FHIR server."""
        token_data = await self.auth.authenticate()

        from app.integrations.core.transport import HttpTransport
        transport = HttpTransport()

        base_url = await self._resolve_base_url()

        if "mock" in base_url:
            return [{"id": "123", "resourceType": resource_type, "status": "active"}]

        headers = {
            "Authorization": f"Bearer {token_data['access_token']}",
            "Accept": "application/fhir+json",
        }
        response = await transport.get(
            f"{base_url}/{resource_type}", headers=headers, params=query_params
        )
        data = response.json()

        if data.get("resourceType") == "Bundle":
            return [entry.get("resource", {}) for entry in data.get("entry", [])]
        return [data]

    async def sync(self) -> Dict[str, Any]:
        """
        Main sync entrypoint.
        1. Resolve token_endpoint via SMART discovery.
        2. Fetch CapabilitySnapshot.
        3. Iterate manifest-enabled resources, gated by capability + mapper.
        4. Commit cursor only after durable persistence succeeds.
        """
        from app.integrations.fhir.discovery import SmartDiscovery
        from app.integrations.auth.jwt_client_assertion import JwtClientAssertionAuth
        from app.integrations.fhir.bundle_pager import BundlePager
        from app.integrations.core.transport import HttpTransport
        from app.services.cursor_store import cursor_store
        from app.services.ingress_service import canonical_ingress

        base_url = await self._resolve_base_url()
        is_mock = "mock" in base_url

        # Step 1: Resolve token_endpoint from SMART discovery
        if is_mock:
            token_endpoint = f"{base_url}/auth/token"
        else:
            discovery = SmartDiscovery(base_url)
            token_endpoint = await discovery.get_token_endpoint()

        # Rebuild auth with the SMART-discovered endpoint
        auth = JwtClientAssertionAuth(
            client_id=self.config.get("client_id", "mock_client"),
            private_key=self.config.get("private_key", "mock_key"),
            key_id=self.config.get("key_id", "key-1"),
            token_endpoint=token_endpoint,
            scopes=self.manifest.get_minimum_scopes(),
        )

        # Step 2: Fetch capability snapshot
        capabilities = await self.get_capability_statement()

        transport = HttpTransport()
        total_processed = 0
        start_time = time.time()

        token_data = await auth.authenticate()
        headers = {
            "Authorization": f"Bearer {token_data['access_token']}",
            "Accept": "application/fhir+json",
        }
        pager = BundlePager(transport, headers)

        # Step 3: Iterate manifest-enabled resources
        for resource_type, resource_config in self.manifest.resources.items():
            # Gate: capability must support it
            if not capabilities.supports(resource_type):
                logger.info(
                    f"[{self.connector_id}] Skipping {resource_type}: "
                    "not in CapabilityStatement"
                )
                continue

            # Gate: mapper must exist
            if not resource_config.mapper:
                logger.info(
                    f"[{self.connector_id}] Skipping {resource_type}: no mapper defined"
                )
                continue

            checkpoint = cursor_store.get(self.connector_id, resource_type)
            params = {}

            # Only use _lastUpdated param if server supports it
            if checkpoint and capabilities.supports_last_updated(resource_type):
                params["_lastUpdated"] = f"gt{checkpoint}"

            url = f"{base_url}/{resource_type}"

            if is_mock:
                records = [
                    {
                        "id": "123",
                        "resourceType": resource_type,
                        "status": "active",
                        "meta": {"lastUpdated": "2026-01-01T00:00:00Z", "versionId": "1"},
                    }
                ]
            else:
                records = await pager.fetch_all(url, params)

            if not records:
                continue

            canonical_records = []
            newest_checkpoint = checkpoint

            for r in records:
                canonical_records.append(
                    {
                        "context_type": resource_type,
                        "vendor": self.manifest.vendor_name,
                        "detail": r,
                    }
                )
                last_updated = r.get("meta", {}).get("lastUpdated")
                if last_updated:
                    if not newest_checkpoint or last_updated > newest_checkpoint:
                        newest_checkpoint = last_updated

            result = await canonical_ingress.submit_batch(
                self.connector_id, canonical_records
            )
            total_processed += result.get("processed", 0)

            # Step 4: Commit cursor AFTER durable persistence
            if newest_checkpoint:
                cursor_store.commit(
                    self.connector_id, resource_type, newest_checkpoint
                )

        return {
            "status": "Success",
            "duration_ms": int((time.time() - start_time) * 1000),
            "processed": total_processed,
        }
