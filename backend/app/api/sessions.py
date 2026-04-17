"""
Session endpoints - Appointments CRUD
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session as DBSession
from typing import Optional
from datetime import datetime, date

from app.models.base import get_db
from app.models.user import User
from app.models.session import Session, SessionStatus, SessionAttendance
from app.models.professional import Professional
from app.models.patient import Patient
from app.models.room import Room
from app.schemas.session import (
    SessionCreate, SessionUpdate, SessionResponse, SessionListResponse,
    SessionAttendanceCreate, SessionAttendanceResponse,
)
from app.schemas.shared import PaginatedResponse
from app.middleware.auth import get_current_user, require_professional
from app.services.audit import log_action

router = APIRouter()


def _enrich_session(session: Session, db: DBSession) -> dict:
    """Add joined names to session data"""
    data = SessionListResponse.model_validate(session)
    prof = db.query(Professional).filter(Professional.id == session.professional_id).first()
    patient = db.query(Patient).filter(Patient.id == session.patient_id).first()
    room = db.query(Room).filter(Room.id == session.room_id).first()
    if prof:
        user = db.query(User).filter(User.id == prof.user_id).first()
        data.professional_name = user.full_name if user else None
    if patient:
        data.patient_name = patient.full_name
    if room:
        data.room_name = room.name
    return data


@router.get("", response_model=PaginatedResponse[SessionListResponse])
async def list_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=500),
    professional_id: Optional[str] = None,
    patient_id: Optional[str] = None,
    session_status: Optional[SessionStatus] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List sessions with filters"""
    query = db.query(Session)

    if professional_id:
        query = query.filter(Session.professional_id == professional_id)
    if patient_id:
        query = query.filter(Session.patient_id == patient_id)
    if session_status:
        query = query.filter(Session.status == session_status)
    if date_from:
        query = query.filter(Session.scheduled_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.filter(Session.scheduled_at <= datetime.combine(date_to, datetime.max.time()))

    total = query.count()
    items = query.order_by(Session.scheduled_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedResponse(
        items=[_enrich_session(s, db) for s in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific session"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    response = SessionResponse.model_validate(session)
    enriched = _enrich_session(session, db)
    response.professional_name = enriched.professional_name
    response.patient_name = enriched.patient_name
    response.room_name = enriched.room_name
    return response


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    data: SessionCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_professional),
):
    """Create a new session/appointment"""
    # Validate references exist
    if not db.query(Professional).filter(Professional.id == data.professional_id).first():
        raise HTTPException(status_code=404, detail="Profesional no encontrado")
    if not db.query(Patient).filter(Patient.id == data.patient_id).first():
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    if not db.query(Room).filter(Room.id == data.room_id).first():
        raise HTTPException(status_code=404, detail="Consultorio no encontrado")

    # Check for scheduling conflicts
    conflict = db.query(Session).filter(
        Session.room_id == data.room_id,
        Session.scheduled_at == data.scheduled_at,
        Session.status.notin_([SessionStatus.CANCELLED]),
    ).first()
    if conflict:
        raise HTTPException(status_code=409, detail="Ya existe una sesión en ese consultorio a esa hora")

    session = Session(
        **data.model_dump(),
        created_by=current_user.id,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    log_action(db, current_user.id, "CREATE", "session", session.id, new_values=data.model_dump(mode="json"))
    return SessionResponse.model_validate(session)


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    data: SessionUpdate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_professional),
):
    """Update a session"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    old_values = {k: getattr(session, k) for k in data.model_dump(exclude_unset=True)}
    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(session, key, value)

    session.updated_by = current_user.id
    db.commit()
    db.refresh(session)

    log_action(db, current_user.id, "UPDATE", "session", session.id,
               old_values={k: str(v) for k, v in old_values.items()},
               new_values={k: str(v) for k, v in update_data.items()})
    return SessionResponse.model_validate(session)


@router.delete("/{session_id}")
async def cancel_session(
    session_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_professional),
):
    """Cancel a session (soft-delete)"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    session.status = SessionStatus.CANCELLED
    session.updated_by = current_user.id
    db.commit()

    log_action(db, current_user.id, "CANCEL", "session", session.id)
    return {"message": "Sesión cancelada exitosamente"}


# --- Attendance ---

@router.post("/{session_id}/attendance", response_model=SessionAttendanceResponse, status_code=201)
async def record_attendance(
    session_id: str,
    data: SessionAttendanceCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_professional),
):
    """Record session attendance"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    existing = db.query(SessionAttendance).filter(SessionAttendance.session_id == session_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya se registró asistencia para esta sesión")

    attendance = SessionAttendance(
        session_id=session_id,
        attended=data.attended,
        checked_in_at=data.checked_in_at or datetime.utcnow(),
        actual_duration_minutes=data.actual_duration_minutes,
        cancellation_reason=data.cancellation_reason,
        no_show_reason=data.no_show_reason,
        created_by=current_user.id,
    )
    db.add(attendance)

    # Update session status
    session.attended = data.attended
    session.status = SessionStatus.ATTENDED if data.attended else SessionStatus.NO_SHOW
    session.updated_by = current_user.id

    db.commit()
    db.refresh(attendance)

    log_action(db, current_user.id, "CREATE", "session_attendance", attendance.id)
    return attendance
