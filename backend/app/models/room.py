"""
Room model - Office spaces (consultorios)
RoomRental - Rental records (monthly or hourly)
"""

from sqlalchemy import Column, String, Float, Text, Boolean, ForeignKey, Date, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
from enum import Enum
import uuid
from .base import Base, AuditMixin


class RoomStatus(str, Enum):
    """Room status"""
    AVAILABLE = "AVAILABLE"
    RENTED = "RENTED"
    MAINTENANCE = "MAINTENANCE"
    UNAVAILABLE = "UNAVAILABLE"


class RentalType(str, Enum):
    """Type of rental"""
    MONTHLY = "MONTHLY"
    HOURLY = "HOURLY"


class TimeWindow(str, Enum):
    """Time window for rental"""
    MORNING = "MORNING"      # 08:00 - 14:00
    AFTERNOON = "AFTERNOON"  # 14:00 - 20:00
    FULL_DAY = "FULL_DAY"    # 08:00 - 20:00


class Room(Base, AuditMixin):
    """Room (consultorio) model"""
    __tablename__ = "room"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    capacity = Column(Float, nullable=False)  # m²
    hourly_rate = Column(Float, nullable=False, default=0)  # ARS por hora/sesión
    amenities = Column(String(500), nullable=True)  # Whiteboard, sink, etc.
    status = Column(SQLEnum(RoomStatus), default=RoomStatus.AVAILABLE, nullable=False)

    # Relationships
    room_rentals = relationship("RoomRental", back_populates="room")

    def __repr__(self):
        return f"<Room {self.name}>"


class RoomRental(Base, AuditMixin):
    """Room rental - Monthly or hourly rental per professional"""
    __tablename__ = "room_rental"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id = Column(String(36), ForeignKey("room.id"), nullable=False, index=True)
    professional_id = Column(String(36), ForeignKey("professional.id"), nullable=False, index=True)

    # Rental type and schedule
    rental_type = Column(SQLEnum(RentalType), default=RentalType.MONTHLY, nullable=False)
    day_of_week = Column(Integer, nullable=True)  # 0=Monday, 6=Sunday (null for all days)
    time_window = Column(SQLEnum(TimeWindow), default=TimeWindow.MORNING, nullable=True)

    # Rental details
    month_year = Column(String(7), nullable=False)  # YYYY-MM
    amount = Column(Float, nullable=False)  # ARS
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    paid = Column(Boolean, default=False, nullable=False)

    # Relationships
    room = relationship("Room", back_populates="room_rentals")
    professional = relationship("Professional", back_populates="room_rentals")

    def __repr__(self):
        return f"<RoomRental {self.room_id} to {self.professional_id} - {self.month_year}>"
