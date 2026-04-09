"""
Patient model - Client records
PatientHistory - Medical history and notes
"""

from sqlalchemy import Column, String, Date, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from .base import Base, AuditMixin


class Patient(Base, AuditMixin):
    """Patient (client) model"""
    __tablename__ = "patient"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)

    # Contact and referral
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    province = Column(String(100), nullable=True)
    referral_source = Column(String(100), nullable=True)  # Friend, Google, Instagram, etc.

    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    notes = Column(Text, nullable=True)

    # Relationships
    sessions = relationship("Session", back_populates="patient")
    patient_history = relationship("PatientHistory", back_populates="patient", uselist=False)

    def __repr__(self):
        return f"<Patient {self.full_name}>"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class PatientHistory(Base, AuditMixin):
    """Patient medical history and clinical notes"""
    __tablename__ = "patient_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patient.id"), nullable=False, unique=True, index=True)

    # Clinical information
    chief_complaint = Column(Text, nullable=True)
    medical_history = Column(Text, nullable=True)
    psychiatric_history = Column(Text, nullable=True)
    current_medications = Column(JSON, default=list, nullable=False)
    allergies = Column(JSON, default=list, nullable=False)

    # Treatment plan
    diagnosis = Column(String(255), nullable=True)
    treatment_plan = Column(Text, nullable=True)
    goals = Column(JSON, default=list, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="patient_history")

    def __repr__(self):
        return f"<PatientHistory {self.patient_id}>"
