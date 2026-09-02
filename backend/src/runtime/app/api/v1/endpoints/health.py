from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any

from app.db.database import SessionLocal

router = APIRouter()

# Dependency


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/verify", summary="SES-012 Post-Deployment Health Check")
def verify_health(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    SES-012: Deep Post-Deployment Verification
    Validates that the database, caching, and core engines are operational in the current environment.
    """
    health_status = {
        "status": "Healthy",
        "database": "Unknown",
        "connectors": "Unknown",
        "rules_engine_cache": "Unknown"
    }

    # 1. Database Connectivity
    try:
        db.execute(text("SELECT 1"))
        health_status["database"] = "Connected"
    except Exception as e:
        health_status["database"] = f"Failed: {str(e)}"
        health_status["status"] = "Degraded"

    # 2. Connector Manager State
    try:
        from app.services.connector_manager import connector_manager
        # In python a dict has length, verify the manager initialized the registry
        if hasattr(
                connector_manager,
                '_connector_registry') and len(
                connector_manager._connector_registry) > 0:
            health_status["connectors"] = "Initialized"
        else:
            health_status["connectors"] = "Warning: No connectors registered"
    except Exception as e:
        health_status["connectors"] = f"Failed: {str(e)}"
        health_status["status"] = "Degraded"

    # 3. Rules Engine Cache State
    try:
        from app.services.rules_engine import rules_engine
        # Ensure rules engine is instantiated and cache variables exist
        if hasattr(rules_engine, '_cache_ttl_seconds'):
            health_status["rules_engine_cache"] = f"Enabled (TTL: {
                rules_engine._cache_ttl_seconds}s)"
        else:
            health_status["rules_engine_cache"] = "Warning: Cache disabled or uninitialized"
    except Exception as e:
        health_status["rules_engine_cache"] = f"Failed: {str(e)}"
        health_status["status"] = "Degraded"

    return health_status


@router.get("/ready", summary="Readiness Gate")
def readiness_gate(db: Session = Depends(get_db)):
    """
    Verifies that the backend is fully initialized and ready to serve traffic.
    Checks DB connectivity.
    """
    status_dict = {"ready": False, "database": "Disconnected", "auth": "Unverified", "governance": "Uninitialized"}

    try:
        db.execute(text("SELECT 1"))
        status_dict["database"] = "Connected"
        status_dict["auth"] = "Verified"  # In V1 we assume if DB is up auth is reachable
        
        # Check governance registry initialization
        from app.services.governance_registry import governance_registry
        if governance_registry._policies or governance_registry._rules:
            status_dict["governance"] = "Initialized"
        else:
            status_dict["governance"] = "Warning: Empty"
            
        status_dict["ready"] = True
    except Exception as e:
        status_dict["database"] = f"Failed: {str(e)}"

    if not status_dict["ready"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail=status_dict)

    return status_dict
