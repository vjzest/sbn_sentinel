from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class ConnectorCreate(BaseModel):
    id: str  # e.g., 'conn_epic' or 'conn_athena'
    name: str
    type: str
    status: Optional[str] = "Connected"
    config: Optional[Dict[str, Any]] = None


class ConnectorResponse(BaseModel):
    id: str
    name: str
    type: str
    status: str
    latency_ms: int
    last_sync: datetime
    config: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
