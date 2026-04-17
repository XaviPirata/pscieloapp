"""
Professional schemas - CRUD operations
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProfessionalCreate(BaseModel):
    user_id: str
    license_number: Optional[str] = None
    specialties: List[str] = []
    bio: Optional[str] = None
    hourly_rate: float = Field(default=40000, ge=0)
    room_rental_monthly: float = Field(default=0, ge=0)
    commission_percentage: float = Field(default=30, ge=0, le=100)


class ProfessionalUpdate(BaseModel):
    license_number: Optional[str] = None
    specialties: Optional[List[str]] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = Field(None, ge=0)
    room_rental_monthly: Optional[float] = Field(None, ge=0)
    commission_percentage: Optional[float] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None


class ProfessionalResponse(BaseModel):
    id: str
    user_id: str
    license_number: Optional[str] = None
    specialties: List[str] = []
    bio: Optional[str] = None
    hourly_rate: float
    room_rental_monthly: float
    commission_percentage: float
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # User info (joined)
    user_email: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class ProfessionalListResponse(BaseModel):
    id: str
    user_id: str
    license_number: Optional[str] = None
    specialties: List[str] = []
    bio: Optional[str] = None
    hourly_rate: float
    room_rental_monthly: float = 0
    commission_percentage: float
    is_active: bool
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
