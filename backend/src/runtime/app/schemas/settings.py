from pydantic import BaseModel
from typing import Optional


class SettingsUpdate(BaseModel):
    practice_name: Optional[str] = None
    practice_phone: Optional[str] = None
    timezone: Optional[str] = None
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    language: Optional[str] = None
    theme_mode: Optional[str] = None

    # AI Settings
    scheduling_aggressiveness: Optional[int] = None
    auto_outreach: Optional[bool] = None
    confidence_threshold: Optional[str] = None
    ai_model: Optional[str] = None

    # Notifications
    notify_sms: Optional[bool] = None
    notify_email: Optional[bool] = None
    notify_desktop: Optional[bool] = None
    notify_copay: Optional[bool] = None
    reminder_interval: Optional[str] = None

    # Billing
    active_plan: Optional[str] = None
    payment_card: Optional[str] = None


class SettingsResponse(BaseModel):
    id: int
    practice_name: str
    practice_phone: str
    timezone: str
    open_time: str
    close_time: str
    language: str
    theme_mode: str

    scheduling_aggressiveness: int
    auto_outreach: bool
    confidence_threshold: str
    ai_model: str

    notify_sms: bool
    notify_email: bool
    notify_desktop: bool
    notify_copay: bool
    reminder_interval: str

    active_plan: str
    payment_card: str

    class Config:
        from_attributes = True
