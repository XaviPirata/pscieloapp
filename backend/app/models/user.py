"""
User model - System users with RBAC (Role-Based Access Control)
Roles: SUPERADMIN, ADMIN, PROFESSIONAL, READONLY
"""

from sqlalchemy import Column, String, Boolean, Text, Enum as SQLEnum
from enum import Enum
import uuid
from .base import Base, AuditMixin


class UserRole(str, Enum):
    """User roles for RBAC"""
    SUPERADMIN = "SUPERADMIN"
    ADMIN = "ADMIN"
    PROFESSIONAL = "PROFESSIONAL"
    READONLY = "READONLY"


class User(Base, AuditMixin):
    """User model - System users"""
    __tablename__ = "user"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.READONLY, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    phone = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)

    def __repr__(self):
        return f"<User {self.email} - {self.role.value}>"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
