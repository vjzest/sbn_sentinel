"""
GET /.well-known/jwks.json

Public JWKS endpoint required for SMART Backend Services / System App registration.
Publishes the RSA public key so Practice Fusion can verify JWT client assertions.
Private key NEVER leaves the server — only public key components are exposed here.
Supports kid for future key rotation.
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
    The private key is never exposed.
    kid must match the kid used in JWT headers so key rotation is possible.
    """
    try:
        from app.core.config import settings
        from cryptography.hazmat.primitives.serialization import load_pem_private_key
        from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey

        pem_bytes = getattr(settings, "JWT_PRIVATE_KEY", None)
        key_id = getattr(settings, "JWT_KEY_ID", "sbn-sentinel-key-1")

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
            "alg": "RS384",
            "n": _int_to_base64url(pub.n),
            "e": _int_to_base64url(pub.e),
        }

        return {"keys": [jwk]}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"JWKS generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate JWKS")
