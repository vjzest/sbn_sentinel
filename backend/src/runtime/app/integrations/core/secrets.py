from app.core.config import settings


class SigningKeyProvider:
    """Provides JWT signing key materials for SMART authentication and JWKS publication."""

    @classmethod
    def get_private_key(cls) -> str:
        return settings.JWT_PRIVATE_KEY

    @classmethod
    def get_key_id(cls) -> str:
        return settings.JWT_KEY_ID

    @classmethod
    def get_algorithm(cls) -> str:
        return settings.JWT_ALGORITHM

    @classmethod
    def is_configured(cls) -> bool:
        return bool(settings.JWT_PRIVATE_KEY)
