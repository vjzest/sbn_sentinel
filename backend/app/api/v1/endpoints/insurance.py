from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import random
from typing import Dict, Any, Optional

from app.db.database import get_db
from app.models.insurance import PatientInsuranceModel
from app.schemas.insurance import PatientInsuranceCreate, PatientInsuranceResponse, OCRScanResponse

router = APIRouter()

@router.post("/ocr-scan", response_model=OCRScanResponse)
def simulate_ocr_scan(file_type: str = "image/png"):
    """
    Simulate OCR scanning on a patient's uploaded health insurance card (front/back).
    Extracts Payer Name, Member ID, Group Number, etc.
    """
    # Simple list of mock insurance providers
    providers = [
        {"name": "Blue Cross Blue Shield", "payer_id": "BCBS8902"},
        {"name": "Aetna Health", "payer_id": "AETNA1192"},
        {"name": "Cigna Healthcare", "payer_id": "CIGNA9923"},
        {"name": "UnitedHealthcare", "payer_id": "UHC44901"}
    ]
    selected = random.choice(providers)
    member_id = f"MEM{random.randint(100000, 999999)}"
    group_no = f"GRP{random.randint(10000, 99999)}"
    
    ocr_text = f"""
    INSURANCE CARD FRONT
    -------------------------
    PROVIDER: {selected['name']}
    MEMBER NAME: John Doe
    MEMBER ID: {member_id}
    GROUP NO: {group_no}
    PAYER ID: {selected['payer_id']}
    RX BIN: 610014
    -------------------------
    """
    
    return OCRScanResponse(
        provider_name=selected['name'],
        member_id=member_id,
        group_number=group_no,
        payer_id=selected['payer_id'],
        confidence_score=0.97,
        ocr_raw_text=ocr_text
    )

@router.post("/verify-eligibility", response_model=PatientInsuranceResponse)
def verify_patient_eligibility(insurance_in: PatientInsuranceCreate, db: Session = Depends(get_db)):
    """
    Verify patient insurance eligibility against simulated clearinghouse (EDI 270/271).
    Saves or updates the record in the database.
    """
    # Check if there is an existing record for the patient
    existing = db.query(PatientInsuranceModel).filter(
        PatientInsuranceModel.patient_name == insurance_in.patient_name
    ).first()
    
    # Simulate eligibility responses
    status_choices = ["Active", "Active", "Active", "Inactive"] # Mostly active for test ease
    eligibility = random.choice(status_choices)
    
    copay_p = 20.0 if eligibility == "Active" else 0.0
    copay_s = 45.0 if eligibility == "Active" else 0.0
    deductible = float(random.choice([0, 250, 500, 1000])) if eligibility == "Active" else 0.0
    
    raw_ocr = f"Verified via clearinghouse gateway on {datetime.now(timezone.utc).isoformat()}"
    
    if existing:
        existing.provider_name = insurance_in.provider_name
        existing.member_id = insurance_in.member_id
        existing.group_number = insurance_in.group_number
        existing.payer_id = insurance_in.payer_id
        existing.eligibility_status = eligibility
        existing.copay_primary = copay_p
        existing.copay_specialist = copay_s
        existing.deductible = deductible
        existing.ocr_raw_text = raw_ocr
        existing.last_verified = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_record = PatientInsuranceModel(
            patient_name=insurance_in.patient_name,
            provider_name=insurance_in.provider_name,
            member_id=insurance_in.member_id,
            group_number=insurance_in.group_number,
            payer_id=insurance_in.payer_id,
            eligibility_status=eligibility,
            copay_primary=copay_p,
            copay_specialist=copay_s,
            deductible=deductible,
            ocr_raw_text=raw_ocr,
            last_verified=datetime.utcnow()
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return new_record

@router.get("/patient/{patient_name}", response_model=Optional[PatientInsuranceResponse])
def get_patient_insurance_details(patient_name: str, db: Session = Depends(get_db)):
    """
    Fetch stored insurance card details & eligibility status for a patient.
    """
    record = db.query(PatientInsuranceModel).filter(
        PatientInsuranceModel.patient_name == patient_name
    ).first()
    if not record:
        # Create a default unverified record so user can verify
        return None
    return record
