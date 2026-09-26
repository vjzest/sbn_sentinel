import uuid
import time
import jwt
import logging
from typing import Dict, Any, List
from app.integrations.core.contracts import AuthStrategy

logger = logging.getLogger(__name__)


class JwtClientAssertionAuth(AuthStrategy):
    """
    Implements OAuth 2.0 Client Credentials Grant using a JWT Client Assertion
    (RFC 7523) to authenticate to external FHIR servers.
    The token_endpoint is ALWAYS sourced from SMART discovery at runtime.
    """

    def __init__(
        self,
        client_id: str,
        private_key: str,
        key_id: str,
        token_endpoint: str,
        scopes: List[str] = None,
        algorithm: str = "RS384",
    ):
        self.client_id = client_id
        self.private_key = private_key
        self.key_id = key_id
        self.token_endpoint = token_endpoint
        # Scopes must be minimum-necessary, derived from manifest — never wildcard
        self.scopes = scopes or []
        self.algorithm = algorithm

    def _generate_jwt_assertion(self) -> str:
        """Generates a signed JWT client assertion with compliant header."""
        now = int(time.time())
        payload = {
            "iss": self.client_id,
            "sub": self.client_id,
            "aud": self.token_endpoint,
            "exp": now + 300,  # 5-minute window
            "iat": now,
            # jti MUST be globally unique — never reuse client_id+timestamp
            "jti": str(uuid.uuid4()),
        }

        token = jwt.encode(
            payload,
            self.private_key,
            algorithm=self.algorithm,
            headers={
                "kid": self.key_id,
                "typ": "JWT",
            },
        )
        return token

    async def authenticate(self) -> Dict[str, Any]:
        """
        Authenticates against the token endpoint.
        Returns the authorization token data.
        Scopes are minimum-necessary as derived from manifest resources.
        """
        assertion = self._generate_jwt_assertion()

        from app.integrations.core.transport import HttpTransport
        transport = HttpTransport()

        scope_string = " ".join(self.scopes) if self.scopes else ""

        data = {
            "grant_type": "client_credentials",
            "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            "client_assertion": assertion,
        }
        if scope_string:
            data["scope"] = scope_string

        response = await transport.post(self.token_endpoint, data=data)
        return response.json()
