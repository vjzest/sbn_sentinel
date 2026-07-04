from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from app.db.database import Base

class SignalModel(Base):
    __tablename__ = "signals"
    id = Column(String, primary_key=True, index=True)
    source = Column(String, index=True)
    type = Column(String, index=True)
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata_data = Column(JSON, nullable=True)
    ai_insight = Column(String, nullable=True)
    recommended_action = Column(String, nullable=True)