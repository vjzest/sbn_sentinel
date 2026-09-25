from typing import Dict, Any, List
from app.integrations.core.contracts import AuthStrategy


class ResourceConfig:
    """Represents a manifest resource entry with scope and mapper info."""

    def __init__(self, scope: str, mapper: str = None, search_params: List[str] = None):
        self.scope = scope
        self.mapper = mapper
        self.search_params = search_params or ["_id", "_lastUpdated"]


class PracticeFusionManifest:
    """
    Defines capabilities, scopes, and specific auth requirements
    for Practice Fusion.
    Scopes are minimum-necessary — derived from enabled resources only.
    """

    def __init__(self):
        self.vendor_name = "Practice Fusion"
        self.auth_type = "jwt_client_assertion"

        # Each resource entry defines scope and mapper
        self.resources: Dict[str, ResourceConfig] = {
            "Patient": ResourceConfig(
                scope="system/Patient.read",
                mapper="patient_mapper",
                search_params=["_id", "_lastUpdated"]
            ),
            "Encounter": ResourceConfig(
                scope="system/Encounter.read",
                mapper="encounter_mapper",
                search_params=["_id", "_lastUpdated", "patient"]
            ),
            "Coverage": ResourceConfig(
                scope="system/Coverage.read",
                mapper="coverage_mapper",
                search_params=["_id", "patient"]
            ),
        }

    def get_minimum_scopes(self) -> List[str]:
        """Returns minimum-necessary scopes derived from manifest resources."""
        return [rc.scope for rc in self.resources.values()]

    def build_auth(self, config: Dict[str, Any], token_endpoint: str) -> AuthStrategy:
        """
        Build JwtClientAssertionAuth with a SMART-discovered token_endpoint.

        This is the preferred production factory method.
        Called inside adapter.sync() AFTER SMART discovery has resolved
        the token_endpoint. Never requires token_endpoint to be in config
        before discovery.
        """
        from app.integrations.auth.jwt_client_assertion import JwtClientAssertionAuth

        is_mock = "mock" in str(config.get("id", "")) or "mock" in str(config.get("base_url", ""))

        client_id = config.get("client_id")
        private_key = config.get("private_key")
        key_id = config.get("key_id", "key-1")

        if not client_id and not is_mock:
            raise ValueError("client_id required for Practice Fusion authentication")
        if not private_key and not is_mock:
            raise ValueError("private_key required for Practice Fusion authentication")
        if not token_endpoint:
            raise ValueError(
                "token_endpoint is required. Must be resolved from SMART discovery."
            )

        return JwtClientAssertionAuth(
            client_id=client_id or "mock_client",
            private_key=private_key or "mock_key",
            key_id=key_id,
            token_endpoint=token_endpoint,
            scopes=self.get_minimum_scopes(),
        )

    def get_auth_strategy(self, config: Dict[str, Any]) -> AuthStrategy:
        """
        Legacy factory: returns auth strategy accepting a pre-resolved
        token_endpoint in config. Used in tests and legacy call sites.

        In production, prefer manifest.build_auth(config, token_endpoint)
        after SMART discovery.
        """
        from app.integrations.auth.jwt_client_assertion import JwtClientAssertionAuth

        is_mock = "mock" in str(config.get("id", "")) or "mock" in str(config.get("base_url", ""))

        client_id = config.get("client_id")
        private_key = config.get("private_key")
        key_id = config.get("key_id", "key-1")

        if not client_id and not is_mock:
            raise ValueError("client_id required for Practice Fusion authentication")

        if not private_key and not is_mock:
            raise ValueError("private_key required for Practice Fusion authentication")

        # token_endpoint must come from SMART discovery at runtime.
        # In production, the adapter calls SmartDiscovery before building auth.
        # Here we accept a pre-resolved endpoint (or mock for tests).
        token_endpoint = config.get("token_endpoint", "mock/auth/token")
        if not is_mock and token_endpoint == "mock/auth/token":
            raise ValueError(
                "token_endpoint is required. It must be resolved from SMART discovery."
            )

        return JwtClientAssertionAuth(
            client_id=client_id or "mock_client",
            private_key=private_key or "mock_key",
            key_id=key_id,
            token_endpoint=token_endpoint,
            scopes=self.get_minimum_scopes(),
        )
