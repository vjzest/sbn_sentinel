from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query  # noqa
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.clinic import ClinicModel
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[Dict[str, Any]])
def get_clinics(
    org_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all clinics. Enforces scope if org_id is provided."""
    if org_id and current_user.org_id and org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Cross-scope access denied")
    clinics = db.query(ClinicModel).all()
    # No mock data injection
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
