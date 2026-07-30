import logging
import json
import traceback
from datetime import datetime
from typing import Any, Dict

# SES-010: Structured Logging Configuration
class StructuredJSONFormatter(logging.Formatter):
    """
    Format logs as structured JSON to fulfill SES-010 Section 10 observability requirements.
    Ensures Timestamp, Severity, Component, and Correlation ID are present.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "severity": record.levelname,
            "component": record.name,
            "message": record.getMessage(),
        }

        # Handle exceptions
        if record.exc_info:
            log_entry["exception"] = "".join(traceback.format_exception(*record.exc_info))

        # Handle custom kwargs / Correlation ID
        if hasattr(record, "correlation_id"):
            log_entry["correlation_id"] = record.correlation_id

        return json.dumps(log_entry)


def setup_logging(log_level: str = "INFO"):
    """
    Initializes the root logger with the SES-010 compliant structured formatter.
    """
    root_logger = logging.getLogger()
    
    # Clear existing handlers to avoid duplicates
    if root_logger.hasHandlers():
        root_logger.handlers.clear()

    level = getattr(logging, log_level.upper(), logging.INFO)
    root_logger.setLevel(level)

    handler = logging.StreamHandler()
    handler.setFormatter(StructuredJSONFormatter())
    root_logger.addHandler(handler)

    # Specific loud loggers to silence or restrict
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    root_logger.info("Structured logging initialized (SES-010).")
