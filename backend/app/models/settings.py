from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base

class SettingsModel(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    practice_name = Column(String, default="Sentinel Health Urgent Care")
    practice_phone = Column(String, default="(555) 019-2834")
    timezone = Column(String, default="Eastern Time (US & Canada)")
    open_time = Column(String, default="08:00")
    close_time = Column(String, default="20:00")
    language = Column(String, default="en")
    theme_mode = Column(String, default="system")
    
    # AI Settings
    scheduling_aggressiveness = Column(Integer, default=2)
    auto_outreach = Column(Boolean, default=True)
    confidence_threshold = Column(String, default="85% (Recommended)")
    ai_model = Column(String, default="gpt-4o")

    # Notifications
    notify_sms = Column(Boolean, default=True)
    notify_email = Column(Boolean, default=False)
    notify_desktop = Column(Boolean, default=True)
    notify_copay = Column(Boolean, default=True)
    reminder_interval = Column(String, default="24h")

    # Billing
    active_plan = Column(String, default="professional")
    payment_card = Column(String, default="Visa ending in 4242")
