"""
ExpenseRecord model - Operating costs tracking
Minimal for MVP (focus on revenue)
"""

from sqlalchemy import Column, String, Float, Date, Text
import uuid
from .base import Base, AuditMixin


class ExpenseRecord(Base, AuditMixin):
    """Expense record - Operating costs"""
    __tablename__ = "expense_record"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Date and type
    date = Column(Date, nullable=False, index=True)
    expense_type = Column(String(50), nullable=False)  # RENT, UTILITIES, SUPPLIES, OTHER
    category = Column(String(100), nullable=True)

    # Amount
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="ARS", nullable=False)

    # Details
    description = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    receipt_path = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<ExpenseRecord {self.expense_type} - {self.amount} ARS>"
