"""
Availability model - Professional availability calendar
AvailabilityOverride - Exceptions to regular availability
"""

from sqlalchemy import Column, String, Integer, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from .base import Base, AuditMixin


class Availability(Base, AuditMixin):
    """Professional availability - Weekly templates"""
    __tablename__ = "availability"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    professional_id = Column(String(36), ForeignKey("professional.id"), nullable=False, index=True)

    # Weekly schedule
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String(5), nullable=False)  # HH:MM
    end_time = Column(String(5), nullable=False)  # HH:MM
    is_available = Column(Boolean, default=True, nullable=False)

    # Relationships
    professional = relationship("Professional", back_populates="availabilities")

    def __repr__(self):
        return f"<Availability {self.professional_id} - Day {self.day_of_week}>"


class AvailabilityOverride(Base, AuditMixin):
    """Availability override - Exceptions to regular schedule"""
    __tablename__ = "availability_override"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    professional_id = Column(String(36), ForeignKey("professional.id"), nullable=False, index=True)

    # Date-specific override
    date = Column(Date, nullable=False, index=True)
    start_time = Column(String(5), nullable=True)
    end_time = Column(String(5), nullable=True)
    is_available = Column(Boolean, default=False, nullable=False)
    reason = Column(String(500), nullable=True)

    # Relationships
    professional = relationship("Professional", foreign_keys=[professional_id])

    def __repr__(self):
        return f"<AvailabilityOverride {self.professional_id} - {self.date}>"
