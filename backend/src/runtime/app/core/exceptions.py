class SentinelError(Exception):
    """Base class for all Sentinel-specific exceptions."""
    pass

class InputValidationError(SentinelError):
    """Raised when an input payload is structurally invalid or violates basic rules."""
    pass

class ConnectorError(SentinelError):
    """Raised when a connector (e.g., Practice Fusion) fails to communicate or is offline."""
    pass

class DependencyError(SentinelError):
    """Raised when an internal or external dependency required for an operation is unavailable."""
    pass

class TimeoutError(SentinelError):
    """Raised when an operation takes longer than the allotted time boundary."""
    pass

class InvalidResponseError(SentinelError):
    """Raised when a dependency returns a response that cannot be parsed or is missing required fields."""
    pass

class PersistenceError(SentinelError):
    """Raised when a database transaction fails to commit safely."""
    pass
