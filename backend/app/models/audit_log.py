"""
AuditLog model - Immutable append-only audit trail
Every data-affecting operation is logged here
"""

from sqlalchemy import Column, String, DateTime, Text, JSON
from datetime import datetime
import uuid
from .base import Base


class AuditLog(Base):
    """Immutable audit log - append-only"""
    __tablename__ = "audit_log"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Who, what, where
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False)  # CREATE, UPDATE, DELETE
    entity_type = Column(String(50), nullable=False, index=True)  # user, professional, session, etc.
    entity_id = Column(String(36), nullable=False, index=True)

    # Before/After
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)

    # Context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    def __repr__(self):
        return f"<AuditLog {self.action} - {self.entity_type} {self.entity_id}>"
