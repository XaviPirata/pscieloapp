"""
Room schemas - Rooms and Rentals CRUD
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from app.models.room import RoomStatus


class RoomCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    capacity: float = Field(..., gt=0)
    amenities: Optional[str] = None
    status: RoomStatus = RoomStatus.AVAILABLE


class RoomUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    capacity: Optional[float] = Field(None, gt=0)
    amenities: Optional[str] = None
    status: Optional[RoomStatus] = None


class RoomResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    capacity: float
    amenities: Optional[str] = None
    status: RoomStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


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
