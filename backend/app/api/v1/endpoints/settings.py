from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.settings import SettingsModel
from app.schemas.settings import SettingsUpdate, SettingsResponse

router = APIRouter()

@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    """
    Retrieve clinical settings. If none exist in the database,
    initialize and return default settings.
    """
    settings = db.query(SettingsModel).first()
    if not settings:
        settings = SettingsModel(
            practice_name="Sentinel Health Urgent Care",
            practice_phone="(555) 019-2834",
            timezone="Eastern Time (US & Canada)",
            open_time="08:00",
            close_time="20:00",
            language="en",
            theme_mode="system",
            scheduling_aggressiveness=2,
            auto_outreach=True,
            confidence_threshold="85% (Recommended)",
            ai_model="gpt-4o",
            notify_sms=True,
            notify_email=False,
            notify_desktop=True,
            notify_copay=True,
            reminder_interval="24h",
            active_plan="professional",
            payment_card="Visa ending in 4242"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.post("", response_model=SettingsResponse)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    """
    Update clinical settings. Creates a default record first if none exists.
    """
    settings = db.query(SettingsModel).first()
    if not settings:
        settings = SettingsModel()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    # Update only the provided fields
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
    
    db.commit()
    db.refresh(settings)
    return settings
