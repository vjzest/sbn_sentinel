from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.audit import AuditLogModel
from app.schemas.audit import AuditLog, AuditLogCreate

router = APIRouter()

@router.post("/", response_model=AuditLog, status_code=201)
def create_audit_entry(entry: AuditLogCreate, db: Session = Depends(get_db)):
    db_entry = AuditLogModel(
        user_email=entry.user_email,
        action=entry.action,
        resource=entry.resource,
        ip_address=entry.ip_address
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/", response_model=List[AuditLog])
def list_audit_entries(db: Session = Depends(get_db)):
    return db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).all()
