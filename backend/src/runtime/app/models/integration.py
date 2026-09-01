from sqlalchemy import Column, String, Boolean
from app.db.database import Base


class IntegrationModel(Base):
    __tablename__ = "integrations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    connected = Column(Boolean, default=False)
    lastSync = Column(String)
