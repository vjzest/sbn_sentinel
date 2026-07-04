from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import random

from app.db.database import get_db
from app.models.connector import ConnectorModel
from app.schemas.reality import ConnectorHealthResponse, ConnectorSyncRequest
from app.schemas.connector import ConnectorCreate

router = APIRouter()

def seed_default_connectors(db: Session):
    default_connectors = [
        {"id": "conn_ehr_01", "name": "Practice Fusion", "type": "EHR System", "status": "Connected", "latency_ms": 42},
        {"id": "conn_tel_01", "name": "Twilio", "type": "Voice + SMS", "status": "Connected", "latency_ms": 18},
        {"id": "conn_gmail_01", "name": "Gmail Workspace", "type": "Email automation", "status": "Syncing", "latency_ms": 35},
        {"id": "conn_stripe_01", "name": "Stripe", "type": "Billing", "status": "Connected", "latency_ms": 22},
        {"id": "conn_zoom_01", "name": "Zoom", "type": "Telehealth", "status": "Connected", "latency_ms": 15},
        {"id": "conn_kareo_01", "name": "Kareo", "type": "Billing System", "status": "Needs attention", "latency_ms": 110},
    ]
    for conn_data in default_connectors:
        conn = ConnectorModel(
            id=conn_data["id"],
            name=conn_data["name"],
            type=conn_data["type"],
            status=conn_data["status"],
            latency_ms=conn_data["latency_ms"],
            last_sync=datetime.utcnow()
        )
        db.add(conn)
    db.commit()

@router.get("/health", response_model=List[Dict[str, Any]])
def check_connectors_health(db: Session = Depends(get_db)):
    """
    Get the health status of all connected Reality Sources.
    Seeds default connectors if none exist.
    """
    connectors = db.query(ConnectorModel).all()
    if not connectors:
        seed_default_connectors(db)
        connectors = db.query(ConnectorModel).all()
    
    response = []
    for c in connectors:
        response.append({
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "status": c.status,
            "latency_ms": c.latency_ms,
            "last_sync": c.last_sync.isoformat() + "Z" if c.last_sync else datetime.utcnow().isoformat() + "Z"
        })
    return response

@router.post("/connect", status_code=status.HTTP_201_CREATED)
def connect_new_system(connector_in: ConnectorCreate, db: Session = Depends(get_db)):
    """
    Connect a new EHR or billing system integration.
    """
    existing = db.query(ConnectorModel).filter(ConnectorModel.id == connector_in.id).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Connector with ID '{connector_in.id}' already exists."
        )
    
    new_connector = ConnectorModel(
        id=connector_in.id,
        name=connector_in.name,
        type=connector_in.type,
        status=connector_in.status or "Connected",
        latency_ms=random.randint(10, 80),
        last_sync=datetime.utcnow(),
        config=connector_in.config
    )
    db.add(new_connector)
    db.commit()
    db.refresh(new_connector)
    return {"message": "System connected successfully", "connector_id": new_connector.id}

@router.post("/sync")
def trigger_connector_sync(request: ConnectorSyncRequest, db: Session = Depends(get_db)):
    """
    Manually trigger data synchronization from a specific Reality Source.
    """
    connector = db.query(ConnectorModel).filter(ConnectorModel.id == request.connector_id).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    # Update status and last sync time
    connector.status = "Syncing"
    db.commit()
    
    # Simulate synchronization complete
    connector.status = "Connected"
    connector.last_sync = datetime.utcnow()
    connector.latency_ms = random.randint(15, 60)
    db.commit()
    
    return {"message": f"Sync triggered successfully for {connector.name}"}

@router.delete("/disconnect/{connector_id}")
def disconnect_system(connector_id: str, db: Session = Depends(get_db)):
    """
    Disconnect/Delete an existing integration.
    """
    connector = db.query(ConnectorModel).filter(ConnectorModel.id == connector_id).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    db.delete(connector)
    db.commit()
    return {"message": f"Successfully disconnected {connector_id}"}
