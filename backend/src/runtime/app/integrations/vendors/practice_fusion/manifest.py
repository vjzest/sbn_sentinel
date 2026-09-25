from typing import Dict, Any
from app.integrations.auth.jwt_client_assertion import JwtClientAssertionAuth
from app.integrations.core.contracts import AuthStrategy


class PracticeFusionManifest:
    """
    Defines capabilities, scopes, and specific auth requirements
    for Practice Fusion.
    """

    def __init__(self):
        self.vendor_name = "Practice Fusion"
        self.auth_type = "jwt_client_assertion"

        self.resources = {
            "Patient": {
                "scope": "system/Patient.read"
            },
            "Encounter": {
                "scope": "system/Encounter.read"
            }
        }

    def get_auth_strategy(self, config: Dict[str, Any]) -> AuthStrategy:
        """Returns configured AuthStrategy."""
        return JwtClientAssertionAuth(
            client_id=config.get("client_id", "default_client_id"),
            token_endpoint=config.get("token_endpoint", "https://api.practicefusion.com/auth/token"),
            private_key=config.get("private_key", "mock_private_key_for_now"),
            key_id=config.get("key_id", "key-1")
        )
