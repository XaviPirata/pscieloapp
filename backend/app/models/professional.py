"""
Professional model - Psychologists/Therapists
Includes specialties, hourly rates, and rental information
"""

from sqlalchemy import Column, String, Integer, Float, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from .base import Base, AuditMixin


class Professional(Base, AuditMixin):
    """Professional (psychologist/therapist) model"""
    __tablename__ = "professional"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("user.id"), nullable=False, unique=True, index=True)

    # Professional details
    license_number = Column(String(50), nullable=True)
    specialties = Column(JSON, default=list, nullable=False)
    bio = Column(Text, nullable=True)

    # Financial
    hourly_rate = Column(Float, nullable=False)
    room_rental_monthly = Column(Float, default=0, nullable=False)
    commission_percentage = Column(Float, default=30, nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    room_rentals = relationship("RoomRental", back_populates="professional")
    sessions = relationship("Session", back_populates="professional")
    availabilities = relationship("Availability", back_populates="professional")
    commissions = relationship("Commission", back_populates="professional")

    def __repr__(self):
        return f"<Professional {self.id}>"


class ProfessionalMatrix(Base, AuditMixin):
    """Professional matrix - Assignment of professionals to rooms/schedules"""
    __tablename__ = "professional_matrix"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    professional_id = Column(String(36), ForeignKey("professional.id"), nullable=False, index=True)
    room_id = Column(String(36), ForeignKey("room.id"), nullable=False, index=True)

    # Day/time
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String(5), nullable=False)  # HH:MM
    end_time = Column(String(5), nullable=False)

    # Relationships
    professional = relationship("Professional", foreign_keys=[professional_id])
    room = relationship("Room", foreign_keys=[room_id])

    def __repr__(self):
        return f"<ProfessionalMatrix {self.professional_id} in {self.room_id}>"
