from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AuditLogCreate(BaseModel):
    user_email: str
    action: str
    resource: Optional[str] = None
    ip_address: Optional[str] = "127.0.0.1"

class AuditLog(BaseModel):
    id: int
    user_email: str
    action: str
    resource: Optional[str]
    timestamp: datetime
    ip_address: str

    class Config:
        from_attributes = True
