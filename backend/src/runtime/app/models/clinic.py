import uuid
from sqlalchemy import Column, String
from app.db.database import Base


class ClinicModel(Base):
    __tablename__ = "clinics"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    address = Column(String)
    phone = Column(String)
    status = Column(String, default="Active")
