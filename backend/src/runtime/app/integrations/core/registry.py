from typing import Dict, Any, Optional
from app.integrations.core.contracts import IntegrationAdapter
from app.integrations.vendors.practice_fusion.adapter import PracticeFusionAdapter
from app.integrations.vendors.practice_fusion.manifest import PracticeFusionManifest


class IntegrationRegistry:
    """
    Central registry for discovering and instantiating vendor integration adapters.
    """

    def __init__(self):
        self._vendors = {
            "Practice Fusion": {
                "adapter": PracticeFusionAdapter,
                "manifest": PracticeFusionManifest
            }
        }

    def create(self, vendor_id: str, config: Dict[str, Any]) -> Optional[IntegrationAdapter]:
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
        # In a real dynamic setup, auth strategy is selected via manifest.
        # For Practice Fusion, it requires JWT Client Assertion.
        auth_config = config.get("auth", {})

        # Load auth strategy based on manifest
        auth_strategy = manifest.get_auth_strategy(auth_config)

        adapter = adapter_cls(auth=auth_strategy, manifest=manifest, config=config)
        return adapter


registry = IntegrationRegistry()
