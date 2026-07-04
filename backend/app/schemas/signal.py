from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class SignalEvent(BaseModel):
    id: str
    source: str  # e.g. "Practice Fusion", "Twilio"
    type: str    # e.g. "EHR", "Phone", "Email"
    message: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None
    ai_insight: Optional[str] = None
    recommended_action: Optional[str] = None
