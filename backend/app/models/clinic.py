from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base

class ClinicModel(Base):
    __tablename__ = "clinics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    phone = Column(String)
    status = Column(String, default="Active")
