"""
Session schemas - Appointments CRUD
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.session import SessionStatus, SessionType


class SessionCreate(BaseModel):
    professional_id: str
    patient_id: str
    room_id: str
    scheduled_at: datetime
    duration_minutes: float = Field(..., gt=0)
    session_type: SessionType = SessionType.CONSULTATION
    amount: float = Field(..., ge=0)
    notes: Optional[str] = None


class SessionUpdate(BaseModel):
    professional_id: Optional[str] = None
    patient_id: Optional[str] = None
    room_id: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[float] = Field(None, gt=0)
    session_type: Optional[SessionType] = None
    status: Optional[SessionStatus] = None
    amount: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
    clinical_notes: Optional[str] = None
    attended: Optional[bool] = None


class SessionResponse(BaseModel):
    id: str
    professional_id: str
    patient_id: str
    room_id: str
    scheduled_at: datetime
    duration_minutes: float
    session_type: SessionType
    status: SessionStatus
    amount: float
    notes: Optional[str] = None
    clinical_notes: Optional[str] = None
    attended: Optional[bool] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Joined data
    professional_name: Optional[str] = None
    patient_name: Optional[str] = None
    room_name: Optional[str] = None

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    id: str
    professional_id: str
    patient_id: str
    room_id: str
    scheduled_at: datetime
    duration_minutes: float
    session_type: SessionType
    status: SessionStatus
    amount: float
    attended: Optional[bool] = None
    professional_name: Optional[str] = None
    patient_name: Optional[str] = None
    room_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Attendance ---

class SessionAttendanceCreate(BaseModel):
    session_id: str
    attended: bool = True
    checked_in_at: Optional[datetime] = None
    actual_duration_minutes: Optional[float] = None
    cancellation_reason: Optional[str] = None
    no_show_reason: Optional[str] = None


class SessionAttendanceResponse(BaseModel):
    id: str
    session_id: str
    checked_in_at: Optional[datetime] = None
    checked_out_at: Optional[datetime] = None
    actual_duration_minutes: Optional[float] = None
    attended: bool
    cancellation_reason: Optional[str] = None
    no_show_reason: Optional[str] = None

    class Config:
        from_attributes = True
