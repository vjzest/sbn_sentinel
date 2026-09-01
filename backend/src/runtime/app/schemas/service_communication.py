"""
SES-003: Internal API & Service Communication Specification
Standard Request and Response Contracts for all internal service communication.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class ServiceErrorCode(str, Enum):
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    BUSINESS_RULE_ERROR = "BUSINESS_RULE_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    INTERNAL_PROCESSING_ERROR = "INTERNAL_PROCESSING_ERROR"


class ErrorCategory(str, Enum):
    VALIDATION = "Validation Error"
    BUSINESS_RULE = "Business Rule Error"
    CONNECTOR = "Connector Error"
    AUTHENTICATION = "Authentication Error"
    AUTHORIZATION = "Authorization Error"
    COMMUNICATION = "Communication Error"
    TIMEOUT = "Timeout Error"
    DATA_INTEGRITY = "Data Integrity Error"
    CONFIGURATION = "Configuration Error"
    SYSTEM = "System Error"


class ErrorSeverity(str, Enum):
    INFORMATIONAL = "Informational"
    WARNING = "Warning"
    ERROR = "Error"
    CRITICAL = "Critical"


class ServiceStatus(str, Enum):
    SUCCESS = "SUCCESS"
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"
    FAILED = "FAILED"


class ErrorDetail(BaseModel):
    error_code: ServiceErrorCode
    category: ErrorCategory = Field(default=ErrorCategory.SYSTEM)
    severity: ErrorSeverity = Field(default=ErrorSeverity.ERROR)
    message: str
    retry_eligible: bool = Field(default=False)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ServiceRequest(BaseModel):
    """
    Standard Request Contract (SES-003 Section 7)
    No module bypasses this structure when calling another module.
    """
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    correlation_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    calling_module: str
    target_service: str
    payload: Dict[str, Any]
    version: str = Field(default="v1.0")


class ServiceResponse(BaseModel):
    """
    Standard Response Contract (SES-003 Section 8)
    Every module returns exactly this structure regardless of implementation.
    """
    status: ServiceStatus
    response_code: int = Field(default=200)
    correlation_id: str
    processing_time_ms: float
    result_payload: Dict[str, Any] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)
    error_details: Optional[ErrorDetail] = None
