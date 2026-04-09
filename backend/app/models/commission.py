"""
Commission model - Weekly commission calculations
Critical: Must be idempotent and auditable
"""

from sqlalchemy import Column, String, Float, Date, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from .base import Base, AuditMixin


class Commission(Base, AuditMixin):
    """Weekly commission calculation"""
    __tablename__ = "commission"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    professional_id = Column(String(36), ForeignKey("professional.id"), nullable=False, index=True)

    # Period
    week_start = Column(Date, nullable=False, index=True)
    week_end = Column(Date, nullable=False)

    # Calculation details
    total_sessions = Column(Float, nullable=False)  # Number of attended sessions
    total_revenue = Column(Float, nullable=False)  # ARS
    commission_amount = Column(Float, nullable=False)  # ARS
    commission_percentage = Column(Float, nullable=False)  # % applied

    # Breakdown
    session_details = Column(JSON, default=list, nullable=False)  # Array of session records

    # Status
    calculated = Column(Boolean, default=False, nullable=False)
    paid = Column(Boolean, default=False, nullable=False, index=True)
    payment_date = Column(Date, nullable=True)

    # Relationships
    professional = relationship("Professional", back_populates="commissions")

    def __repr__(self):
        return f"<Commission {self.professional_id} - {self.week_start}>"
