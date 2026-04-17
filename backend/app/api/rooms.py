"""
Room endpoints - Rooms and Rentals CRUD + Schedule
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session as DBSession
from typing import Optional

from app.models.base import get_db
from app.models.user import User
from app.models.room import Room, RoomRental
from app.models.professional import Professional
from app.models.patient import Patient
from app.models.session import Session, SessionStatus
from app.schemas.room import (
    RoomCreate, RoomUpdate, RoomResponse,
    RoomRentalCreate, RoomRentalUpdate, RoomRentalResponse,
    ScheduleSlot, DaySchedule, RoomScheduleResponse,
)
from app.schemas.shared import PaginatedResponse
from app.middleware.auth import get_current_user, require_admin
from app.services.audit import log_action

router = APIRouter()


@router.get("", response_model=list[RoomResponse])
async def list_rooms(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all rooms"""
    rooms = db.query(Room).order_by(Room.name).all()
    return [RoomResponse.model_validate(r) for r in rooms]


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific room"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Consultorio no encontrado")
    return room


@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    data: RoomCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new room (admin only)"""
    existing = db.query(Room).filter(Room.name == data.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe un consultorio con ese nombre")

    room = Room(**data.model_dump(), created_by=current_user.id)
    db.add(room)
    db.commit()
    db.refresh(room)

    log_action(db, current_user.id, "CREATE", "room", room.id, new_values=data.model_dump())
    return room


@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: str,
    data: RoomUpdate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a room (admin only)"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Consultorio no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(room, key, value)

    room.updated_by = current_user.id
    db.commit()
    db.refresh(room)

    log_action(db, current_user.id, "UPDATE", "room", room.id, new_values=update_data)
    return room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a room (admin only) - only if no sessions linked"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Consultorio no encontrado")

    session_count = db.query(Session).filter(Session.room_id == room_id).count()
    if session_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"No se puede eliminar: tiene {session_count} sesiones asociadas",
        )

    log_action(db, current_user.id, "DELETE", "room", room.id, old_values={"name": room.name})
    db.delete(room)
    db.commit()


@router.get("/{room_id}/schedule", response_model=RoomScheduleResponse)
async def get_room_schedule(
    room_id: str,
    week_start: Optional[str] = Query(None, description="YYYY-MM-DD, default=lunes actual"),
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get weekly schedule for a room (Mon-Fri, 08:00-20:00)"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Consultorio no encontrado")

    # Parse week_start or default to current week's Monday
    if week_start:
        try:
            start = datetime.strptime(week_start, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha inválido, usar YYYY-MM-DD")
        # Adjust to Monday
        start = start - timedelta(days=start.weekday())
    else:
        today = datetime.utcnow()
        start = today - timedelta(days=today.weekday())

    start = start.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=5)  # Mon-Fri

    # Business hours 08:00-20:00
    business_hours = [f"{h:02d}:00" for h in range(8, 20)]

    # Query sessions for this room in the week
    sessions = (
        db.query(Session)
        .filter(
            Session.room_id == room_id,
            Session.scheduled_at >= start,
            Session.scheduled_at < end,
            Session.status != SessionStatus.CANCELLED,
        )
        .order_by(Session.scheduled_at)
        .all()
    )

    # Build day labels
    day_labels = ["Lun", "Mar", "Mié", "Jue", "Vie"]
    days = []

    for d in range(5):
        day_date = start + timedelta(days=d)
        day_sessions = [s for s in sessions if s.scheduled_at.date() == day_date.date()]

        slots = []
        for s in day_sessions:
            # Get patient and professional names
            patient = db.query(Patient).filter(Patient.id == s.patient_id).first()
            prof = db.query(Professional).filter(Professional.id == s.professional_id).first()
            prof_user = db.query(User).filter(User.id == prof.user_id).first() if prof else None

            patient_name = f"{patient.first_name} {patient.last_name}" if patient else "?"
            professional_name = f"{prof_user.first_name} {prof_user.last_name}" if prof_user else "?"

            slots.append(ScheduleSlot(
                session_id=s.id,
                hour=s.scheduled_at.strftime("%H:%M"),
                patient_name=patient_name,
                professional_name=professional_name,
                status=s.status.value,
                session_type=s.session_type.value if s.session_type else None,
                duration_minutes=int(s.duration_minutes),
            ))

        days.append(DaySchedule(
            date=day_date.strftime("%Y-%m-%d"),
            day_label=f"{day_labels[d]} {day_date.day}",
            slots=slots,
        ))

    return RoomScheduleResponse(
        room_id=room.id,
        room_name=room.name,
        week_start=start.strftime("%Y-%m-%d"),
        week_end=(start + timedelta(days=4)).strftime("%Y-%m-%d"),
        business_hours=business_hours,
        days=days,
    )


# --- Room Rentals ---

@router.get("/rentals/all", response_model=PaginatedResponse[RoomRentalResponse])
async def list_rentals(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=500),
    month_year: Optional[str] = None,
    paid: Optional[bool] = None,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List room rentals"""
    query = db.query(RoomRental)

    if month_year:
        query = query.filter(RoomRental.month_year == month_year)
    if paid is not None:
        query = query.filter(RoomRental.paid == paid)

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for rental in items:
        data = RoomRentalResponse.model_validate(rental)
        room = db.query(Room).filter(Room.id == rental.room_id).first()
        prof = db.query(Professional).filter(Professional.id == rental.professional_id).first()
        if room:
            data.room_name = room.name
        if prof:
            user = db.query(User).filter(User.id == prof.user_id).first()
            data.professional_name = user.full_name if user else None
        result.append(data)

    return PaginatedResponse(
        items=result,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.post("/rentals", response_model=RoomRentalResponse, status_code=201)
async def create_rental(
    data: RoomRentalCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a room rental record (admin only)"""
    rental = RoomRental(**data.model_dump(), created_by=current_user.id)
    db.add(rental)
    db.commit()
    db.refresh(rental)

    log_action(db, current_user.id, "CREATE", "room_rental", rental.id, new_values=data.model_dump(mode="json"))
    return rental


@router.put("/rentals/{rental_id}", response_model=RoomRentalResponse)
async def update_rental(
    rental_id: str,
    data: RoomRentalUpdate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a rental (mark as paid, etc.)"""
    rental = db.query(RoomRental).filter(RoomRental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(rental, key, value)

    rental.updated_by = current_user.id
    db.commit()
    db.refresh(rental)

    log_action(db, current_user.id, "UPDATE", "room_rental", rental.id, new_values=update_data)
    return rental


@router.delete("/rentals/{rental_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rental(
    rental_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a rental record (admin only)"""
    rental = db.query(RoomRental).filter(RoomRental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")

    log_action(db, current_user.id, "DELETE", "room_rental", rental.id)
    db.delete(rental)
    db.commit()


@router.get("/{room_id}/rentals", response_model=list[RoomRentalResponse])
async def get_room_rentals(
    room_id: str,
    month_year: Optional[str] = None,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all rentals for a specific room"""
    query = db.query(RoomRental).filter(RoomRental.room_id == room_id)
    if month_year:
        query = query.filter(RoomRental.month_year == month_year)

    rentals = query.all()
    result = []
    for rental in rentals:
        data = RoomRentalResponse.model_validate(rental)
        room = db.query(Room).filter(Room.id == rental.room_id).first()
        prof = db.query(Professional).filter(Professional.id == rental.professional_id).first()
        if room:
            data.room_name = room.name
        if prof:
            user = db.query(User).filter(User.id == prof.user_id).first()
            data.professional_name = user.full_name if user else None
        result.append(data)
    return result
