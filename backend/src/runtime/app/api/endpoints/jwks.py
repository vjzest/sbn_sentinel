"""
GET /.well-known/jwks.json

Public JWKS endpoint required for SMART Backend Services / System App registration.
Publishes the RSA public key so Practice Fusion can verify JWT client assertions.
Private key NEVER leaves the server — only public key components are exposed here.
Supports kid for future key rotation.

Mounted directly on the FastAPI app (not under /api/v1) so the public URL is:
  GET /.well-known/jwks.json
"""
import base64
import logging
from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)

router = APIRouter()


def _int_to_base64url(value: int) -> str:
    """Encode a Python int as base64url (no padding) for JWK n/e fields."""
    length = (value.bit_length() + 7) // 8
    return (
        base64.urlsafe_b64encode(value.to_bytes(length, byteorder="big"))
        .rstrip(b"=")
        .decode("ascii")
    )


@router.get("/.well-known/jwks.json", tags=["JWKS"])
async def jwks_endpoint():
    """
    Returns the public JWKS used for JWT Client Assertion verification.
    The private key is never exposed — only n and e (RSA public components).
    kid must match the kid used in JWT headers so key rotation is possible.
    Requires JWT_PRIVATE_KEY and JWT_KEY_ID to be set in environment / settings.
    """
    try:
        from app.integrations.core.secrets import SigningKeyProvider
        from cryptography.hazmat.primitives.serialization import load_pem_private_key
        from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey

        # Use explicit declared settings fields via provider
        pem_bytes = SigningKeyProvider.get_private_key()
        key_id = SigningKeyProvider.get_key_id()

        if not pem_bytes:
            raise HTTPException(
                status_code=503,
                detail="JWKS not configured: JWT_PRIVATE_KEY is not set",
            )

        if isinstance(pem_bytes, str):
            pem_bytes = pem_bytes.encode()

        private_key = load_pem_private_key(pem_bytes, password=None)

        if not isinstance(private_key, RSAPrivateKey):
            raise HTTPException(
                status_code=503,
                detail="Only RSA keys are supported for JWKS publication",
            )

        pub = private_key.public_key().public_numbers()

        jwk = {
            "kty": "RSA",
            "kid": key_id,
            "use": "sig",
            "alg": SigningKeyProvider.get_algorithm(),
            "n": _int_to_base64url(pub.n),
            "e": _int_to_base64url(pub.e),
        }

        return {"keys": [jwk]}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"JWKS generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate JWKS")
