"""
Patient schemas - CRUD operations
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime


class PatientCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    referral_source: Optional[str] = None
    notes: Optional[str] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    referral_source: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class PatientResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    referral_source: Optional[str] = None
    is_active: bool
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    referral_source: Optional[str] = None

    class Config:
        from_attributes = True


# --- Patient History ---

class PatientHistoryCreate(BaseModel):
    patient_id: str
    chief_complaint: Optional[str] = None
    medical_history: Optional[str] = None
    psychiatric_history: Optional[str] = None
    current_medications: List[str] = []
    allergies: List[str] = []
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    goals: List[str] = []


class PatientHistoryUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    medical_history: Optional[str] = None
    psychiatric_history: Optional[str] = None
    current_medications: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    goals: Optional[List[str]] = None


class PatientHistoryResponse(BaseModel):
    id: str
    patient_id: str
    chief_complaint: Optional[str] = None
    medical_history: Optional[str] = None
    psychiatric_history: Optional[str] = None
    current_medications: List[str] = []
    allergies: List[str] = []
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    goals: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
