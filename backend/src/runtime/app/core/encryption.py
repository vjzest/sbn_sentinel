import base64
from cryptography.fernet import Fernet
from app.core.config import settings

# In a real environment, this key would be loaded from a secure vault or HSM.
# For SES-008 demonstration, we derive a Fernet key from the existing SECRET_KEY.


def _get_fernet_key() -> bytes:
    # Ensure key is 32 URL-safe base64-encoded bytes
    secret = settings.SECRET_KEY.encode("utf-8")
    # Pad or truncate to 32 bytes
    if len(secret) < 32:
        secret = secret.ljust(32, b"x")
    else:
        secret = secret[:32]
    return base64.urlsafe_b64encode(secret)


fernet = Fernet(_get_fernet_key())


def encrypt_value(value: str) -> str:
    """Encrypts a plaintext string into a secure token."""
    if not value:
        return value
    return fernet.encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_value(encrypted_value: str) -> str:
    """Decrypts a secure token back into a plaintext string."""
    if not encrypted_value:
        return encrypted_value
    try:
        return fernet.decrypt(encrypted_value.encode("utf-8")).decode("utf-8")
    except Exception:
        # Fallback or invalid token
        return encrypted_value
