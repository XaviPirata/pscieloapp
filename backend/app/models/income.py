"""
IncomeRecord model - Revenue tracking
Includes rentals and commissions
"""

from sqlalchemy import Column, String, Float, Date, Text
import uuid
from .base import Base, AuditMixin


class IncomeRecord(Base, AuditMixin):
    """Income record - Revenue from rentals and sessions"""
    __tablename__ = "income_record"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Date and type
    date = Column(Date, nullable=False, index=True)
    income_type = Column(String(50), nullable=False)  # RENTAL, COMMISSION, SESSION, OTHER
    professional_id = Column(String(36), nullable=True, index=True)

    # Amount
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="ARS", nullable=False)

    # Reference
    reference = Column(String(500), nullable=True)  # Link to session, rental, etc.
    notes = Column(Text, nullable=True)

    def __repr__(self):
        return f"<IncomeRecord {self.income_type} - {self.amount} ARS>"
