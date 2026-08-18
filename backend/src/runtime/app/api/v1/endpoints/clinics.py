from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.clinic import ClinicModel

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
def get_clinics(db: Session = Depends(get_db)):
    """Get all clinics."""
    clinics = db.query(ClinicModel).all()
    # Return some mock data if empty for demo purposes
    if not clinics:
        mock_clinic = ClinicModel(
            name="Sentinel Health Urgent Care (Main)",
            address="123 Health Ave, New York, NY",
            phone="(555) 019-2834",
            status="Active"
        )
        db.add(mock_clinic)
        db.commit()
        db.refresh(mock_clinic)
        clinics = [mock_clinic]
        
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "address": c.address,
            "phone": c.phone,
            "status": c.status,
        }
        for c in clinics
    ]

@router.post("/")
def create_clinic(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new clinic."""
    name = payload.get("name")
    address = payload.get("address", "")
    phone = payload.get("phone", "")
    
    if not name:
        raise HTTPException(status_code=400, detail="Clinic name is required")
        
    new_clinic = ClinicModel(
        name=name,
        address=address,
        phone=phone,
        status="Active"
    )
    db.add(new_clinic)
    db.commit()
    db.refresh(new_clinic)
    
    return {
        "id": str(new_clinic.id),
        "name": new_clinic.name,
        "address": new_clinic.address,
        "phone": new_clinic.phone,
        "status": new_clinic.status
    }
