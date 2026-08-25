from sqlalchemy import Column, String, Text
from app.db.database import Base

class GovernanceStorageModel(Base):
    """Fallback storage for GovernanceRegistry to migrate away from pickle."""
    __tablename__ = "governance_storage"
    id = Column(String, primary_key=True)
    state_json = Column(Text, nullable=False)
