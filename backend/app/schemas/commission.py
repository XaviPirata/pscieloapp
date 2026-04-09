"""
Commission schemas - Weekly commission tracking
"""

from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date, datetime


class CommissionCalculateRequest(BaseModel):
    professional_id: str
    week_start: date
    week_end: date


class CommissionResponse(BaseModel):
    id: str
    professional_id: str
    week_start: date
    week_end: date
    total_sessions: float
    total_revenue: float
    commission_amount: float
    commission_percentage: float
    session_details: List[Any] = []
    calculated: bool
    paid: bool
    payment_date: Optional[date] = None
    created_at: Optional[datetime] = None

    # Joined
    professional_name: Optional[str] = None

    class Config:
        from_attributes = True


class CommissionPayRequest(BaseModel):
    payment_date: date
