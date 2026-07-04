from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any

class ConnectorHealthResponse(BaseModel):
    id: str
    name: str
    status: str
    latency_ms: int
    last_sync: str
    details: Optional[Dict[str, Any]] = None

class ConnectorSyncRequest(BaseModel):
    connector_id: str
    force_full_sync: bool = False
