from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditLogCreate(BaseModel):
    user_system: str
    action: str
    module: Optional[str] = None
    correlation_id: Optional[str] = None
    error_category: Optional[str] = None
    severity: Optional[str] = None
    retry_attempts: Optional[int] = None
    recovery_outcome: Optional[str] = None
    resolution_status: Optional[str] = None


class AuditLogResponse(AuditLogCreate):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True
