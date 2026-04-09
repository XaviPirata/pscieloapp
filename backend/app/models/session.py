"""
Session model - Appointments/consultations
SessionAttendance - Attendance tracking
"""

from sqlalchemy import Column, String, DateTime, Float, Text, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from enum import Enum
import uuid
from datetime import datetime
from .base import Base, AuditMixin


class SessionStatus(str, Enum):
    """Session status"""
    SCHEDULED = "SCHEDULED"
    CONFIRMED = "CONFIRMED"
    ATTENDED = "ATTENDED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class SessionType(str, Enum):
    """Type of session"""
    CONSULTATION = "CONSULTATION"
    FOLLOW_UP = "FOLLOW_UP"
    INITIAL = "INITIAL"
    ASSESSMENT = "ASSESSMENT"


class Session(Base, AuditMixin):
    """Session (appointment) model"""
    __tablename__ = "session"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    professional_id = Column(String(36), ForeignKey("professional.id"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("patient.id"), nullable=False, index=True)
    room_id = Column(String(36), ForeignKey("room.id"), nullable=False, index=True)

    # Session details
    scheduled_at = Column(DateTime, nullable=False, index=True)
    duration_minutes = Column(Float, nullable=False)
    session_type = Column(SQLEnum(SessionType), default=SessionType.CONSULTATION, nullable=False)
    status = Column(SQLEnum(SessionStatus), default=SessionStatus.SCHEDULED, nullable=False, index=True)

    # Financial
    amount = Column(Float, nullable=False)  # ARS - Amount charged to patient

    # Notes
    notes = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=True)

    # Attendance
    attended = Column(Boolean, nullable=True)  # True/False/None (null = not yet determined)

    # Relationships
    professional = relationship("Professional", back_populates="sessions")
    patient = relationship("Patient", back_populates="sessions")
    room = relationship("Room", foreign_keys=[room_id])
    attendance = relationship("SessionAttendance", back_populates="session", uselist=False)

    def __repr__(self):
        return f"<Session {self.id} - {self.scheduled_at}>"


class SessionAttendance(Base, AuditMixin):
    """Session attendance tracking"""
    __tablename__ = "session_attendance"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("session.id"), nullable=False, unique=True, index=True)

    # Actual attendance
    checked_in_at = Column(DateTime, nullable=True)
    checked_out_at = Column(DateTime, nullable=True)
    actual_duration_minutes = Column(Float, nullable=True)
    attended = Column(Boolean, nullable=False, default=True)

    # Notes
    cancellation_reason = Column(String(500), nullable=True)
    no_show_reason = Column(String(500), nullable=True)

    # Relationships
    session = relationship("Session", back_populates="attendance")

    def __repr__(self):
        return f"<SessionAttendance {self.session_id}>"
