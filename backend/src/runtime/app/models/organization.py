"""
SES-004: Database & Domain Model Architecture
Domain 1 - Organization
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class OrganizationModel(Base):
    """
    Represents the customer organization.
    """
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    status = Column(String, default="Active")
    time_zone = Column(String, default="UTC")
    created_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    clinics = relationship(
        "OrganizationClinicModel",
        back_populates="organization",
        cascade="all, delete")


class OrganizationClinicModel(Base):
    """
    Represents a physical or virtual care location.
    """
    __tablename__ = "org_clinics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    organization = relationship("OrganizationModel", back_populates="clinics")
