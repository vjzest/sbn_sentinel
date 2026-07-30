from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.db.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    status = Column(String, default="Pending") # Pending, Paid, Failed
    razorpay_order_id = Column(String, unique=True, index=True)
    razorpay_payment_id = Column(String, unique=True, index=True, nullable=True)
    razorpay_signature = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(String, nullable=False)
    status = Column(String, default="Active") # Active, Cancelled, Halted
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
