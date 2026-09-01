from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.audit import AuditLogCreate, AuditLogResponse
from app.models.audit import AuditLogModel
from app.services.data_audit_engine import data_audit_engine

router = APIRouter()


@router.post("/", response_model=dict)
def create_audit_log(audit_in: AuditLogCreate, background_tasks: BackgroundTasks):
    """
    Creates an immutable audit log entry (e.g., when a user acknowledges an alert or approves an action).
    Executed in the background to not block the request.
    """
    background_tasks.add_task(data_audit_engine.log_audit_event, audit_in)
    return {"status": "accepted", "message": "Audit log queued for DMAE processing."}


@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a list of recent audit logs. (Read-only access)
    """
    logs = db.query(AuditLogModel).order_by(
        AuditLogModel.timestamp.desc()).offset(skip).limit(limit).all()
    return logs
