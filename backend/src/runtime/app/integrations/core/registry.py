from typing import Dict, Any, Optional
from app.integrations.core.contracts import IntegrationAdapter
from app.integrations.vendors.practice_fusion.adapter import PracticeFusionAdapter
from app.integrations.vendors.practice_fusion.manifest import PracticeFusionManifest


class IntegrationRegistry:
    """
    Central registry for discovering and instantiating vendor integration adapters.

    Auth strategy is NOT constructed here. The registry creates the adapter with
    the manifest and raw config. SMART discovery and auth construction happen
    inside adapter.sync() after token_endpoint is resolved at runtime.

    Sequence:
        Registry.create()
            -> builds manifest + adapter (no auth yet)
        adapter.sync()
            -> SMART discovery -> token_endpoint
            -> manifest/auth factory builds JwtClientAssertionAuth
            -> token exchange
    """

    def __init__(self):
        self._vendors = {
            "Practice Fusion": {
                "adapter": PracticeFusionAdapter,
                "manifest": PracticeFusionManifest,
            }
        }

    def create(self, vendor_id: str, config: Dict[str, Any]) -> Optional[IntegrationAdapter]:
        """
        Create an adapter instance without requiring auth at creation time.
        Auth is deferred until adapter.sync() runs SMART discovery.
        """
        vendor_data = None
        # Match by name or exact ID (support legacy naming)
        for key, val in self._vendors.items():
            if key in vendor_id or vendor_id in key:
                vendor_data = val
                break

        if not vendor_data:
            return None

        manifest_cls = vendor_data["manifest"]
        adapter_cls = vendor_data["adapter"]

        manifest = manifest_cls()

        # Registry does NOT require auth or token_endpoint yet.
        # auth will be built inside adapter.sync() after SMART discovery.
        adapter = adapter_cls(auth=None, manifest=manifest, config=config)
        return adapter


registry = IntegrationRegistry()
