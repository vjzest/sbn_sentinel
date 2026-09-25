import time
import jwt
from typing import Dict, Any
from app.integrations.core.contracts import AuthStrategy


class JwtClientAssertionAuth(AuthStrategy):
    """
    Implements OAuth 2.0 Client Credentials Grant using a JWT Client Assertion
    (RFC 7523) to authenticate to external FHIR servers.
    """

    def __init__(self, client_id: str, token_endpoint: str, private_key: str, key_id: str, algorithm: str = "RS384"):
        self.client_id = client_id
        self.token_endpoint = token_endpoint
        self.private_key = private_key
        self.key_id = key_id
        self.algorithm = algorithm

    def _generate_jwt_assertion(self) -> str:
        """Generates a signed JWT client assertion."""
        now = int(time.time())
        payload = {
            "iss": self.client_id,
            "sub": self.client_id,
            "aud": self.token_endpoint,
            "exp": now + 300,  # 5 minutes expiry
            "jti": f"{self.client_id}-{now}",
        }

        token = jwt.encode(
            payload,
            self.private_key,
            algorithm=self.algorithm,
            headers={"kid": self.key_id}
        )
        return token

    async def authenticate(self) -> Dict[str, Any]:
        """
        Authenticates against the token endpoint.
        Returns the authorization token data.
        """
        assertion = self._generate_jwt_assertion()

        # In a real implementation, we would HTTP POST to the token_endpoint here
        # with grant_type=client_credentials and client_assertion=assertion
        # For now, we simulate the token retrieval for the interface

        return {
            "access_token": "simulated_access_token",
            "token_type": "Bearer",
            "expires_in": 3600,
            "client_assertion_used": assertion
        }
