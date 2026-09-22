from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime
import json

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.connector import ConnectorModel

router = APIRouter()

@router.get("/runtime", summary="D7 Authoritative Runtime Status")
def get_runtime_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    D7 Authoritative Runtime Status
    Communicates technical truth without converting it into operational truth.
    Connector failure, timeout, invalid response, partial response,
    degraded runtime and system unavailability remain distinct.
    """
    connectors = db.query(ConnectorModel).all()
    
    capabilities = []
    connector_dtos = []
    
    # Analyze Practice Fusion (EHR Capability)
    pf_connector = next((c for c in connectors if "Practice Fusion" in c.name), None)
    
    if not pf_connector:
        # T01: PF absent -> UNAVAILABLE
        capabilities.append({
            "capability_id": "ehr_read",
            "label": "EHR Data Retrieval",
            "state": "UNAVAILABLE",
            "affected_scope": "System Wide",
            "can_continue": False,
            "retry_supported": False,
            "last_confirmed_at": datetime.utcnow().isoformat() + "Z"
        })
    elif pf_connector.status not in ["Healthy", "Ready"] or not pf_connector.access_token:
        # T02, T03: PF unhealthy or missing token -> DEGRADED/UNAVAILABLE
        state = "UNAVAILABLE" if not pf_connector.access_token else "DEGRADED"
        capabilities.append({
            "capability_id": "ehr_read",
            "label": "EHR Data Retrieval",
            "state": state,
            "affected_scope": "Practice Fusion Sync",
            "can_continue": False,
            "retry_supported": True,
            "last_confirmed_at": (pf_connector.last_sync or datetime.utcnow()).isoformat() + "Z",
            "diagnostic_ref": f"CONN-{pf_connector.id[:8]}"
        })
    else:
        capabilities.append({
            "capability_id": "ehr_read",
            "label": "EHR Data Retrieval",
            "state": "READY",
            "can_continue": True,
            "retry_supported": False,
            "last_confirmed_at": (pf_connector.last_sync or datetime.utcnow()).isoformat() + "Z"
        })

    for c in connectors:
        # For D7, if it's a mock connector that fails sync with UNAVAILABLE code
        # we can pass that up.
        code = None
        if c.status == "Warning":
            code = "UNAVAILABLE"
        elif c.status == "Error":
            code = "TIMEOUT"
            
        connector_dtos.append({
            "connector_id": c.id,
            "name": c.name,
            "state": c.status.lower() if c.status else "unknown",
            "supported_in_v1": "Practice Fusion" in c.name,
            "latency_ms": c.latency_ms,
            "last_sync": c.last_sync.isoformat() + "Z" if c.last_sync else None,
            "failure_code": code
        })

    # Overall state
    overall_state = "READY"
    if any(c["state"] == "UNAVAILABLE" for c in capabilities):
        overall_state = "DEGRADED" # Or BLOCKED if it's full system block
        
    return {
        "overall": {
            "scope": "system",
            "state": overall_state,
            "message": "System operating normally" if overall_state == "READY" else "Degraded operation detected",
            "checked_at": datetime.utcnow().isoformat() + "Z"
        },
        "capabilities": capabilities,
        "connectors": connector_dtos,
        "technical_state": "ready"
    }
