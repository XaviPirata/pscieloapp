"""
Room schemas - Rooms, Rentals, and Schedule
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.models.room import RoomStatus


class RoomCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    capacity: float = Field(..., gt=0)
    hourly_rate: float = Field(0, ge=0)
    amenities: Optional[str] = None
    status: RoomStatus = RoomStatus.AVAILABLE


class RoomUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    capacity: Optional[float] = Field(None, gt=0)
    hourly_rate: Optional[float] = Field(None, ge=0)
    amenities: Optional[str] = None
    status: Optional[RoomStatus] = None


class RoomResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    capacity: float
    hourly_rate: float = 0
    amenities: Optional[str] = None
    status: RoomStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Room Schedule ---

class ScheduleSlot(BaseModel):
    """Una sesión ocupando un horario en el consultorio"""
    session_id: str
    hour: str  # "08:00"
    patient_name: str
    professional_name: str
    status: str
    session_type: Optional[str] = None
    duration_minutes: int = 50


class DaySchedule(BaseModel):
    """Horario de un día para un consultorio"""
    date: str  # "2026-04-14"
    day_label: str  # "Lun 14"
    slots: List[ScheduleSlot] = []


class RoomScheduleResponse(BaseModel):
    """Horario semanal completo de un consultorio"""
    room_id: str
    room_name: str
    week_start: str  # "2026-04-14"
    week_end: str  # "2026-04-18"
    business_hours: List[str]  # ["08:00", "09:00", ..., "19:00"]
    days: List[DaySchedule] = []


# --- Room Rental ---

class RoomRentalCreate(BaseModel):
    room_id: str
    professional_id: str
    month_year: str = Field(..., pattern=r"^\d{4}-\d{2}$")  # YYYY-MM
    amount: float = Field(..., gt=0)
    start_date: date
    end_date: date


class RoomRentalUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    paid: Optional[bool] = None


class RoomRentalResponse(BaseModel):
    id: str
    room_id: str
    professional_id: str
    month_year: str
    amount: float
    start_date: date
    end_date: date
    paid: bool
    created_at: Optional[datetime] = None

    # Joined
    room_name: Optional[str] = None
    professional_name: Optional[str] = None

    class Config:
        from_attributes = True
