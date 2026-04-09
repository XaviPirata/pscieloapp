"""
Audit service - Log all data-affecting operations
Writes to the immutable audit_log table
"""

from typing import Optional
from sqlalchemy.orm import Session as DBSession
from app.models.audit_log import AuditLog


def log_action(
    db: DBSession,
    user_id: Optional[str],
    action: str,
    entity_type: str,
    entity_id: str,
    old_values: Optional[dict] = None,
    new_values: Optional[dict] = None,
    ip_address: Optional[str] = None,
    notes: Optional[str] = None,
) -> AuditLog:
    """Create an immutable audit log entry"""
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_values=old_values,
        new_values=new_values,
        ip_address=ip_address,
        notes=notes,
    )
    db.add(log)
    db.commit()
    return log
