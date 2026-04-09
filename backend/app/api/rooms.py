"""
Room endpoints - Rooms and Rentals CRUD
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session as DBSession
from typing import Optional

from app.models.base import get_db
from app.models.user import User
from app.models.room import Room, RoomRental
from app.models.professional import Professional
from app.schemas.room import (
    RoomCreate, RoomUpdate, RoomResponse,
    RoomRentalCreate, RoomRentalUpdate, RoomRentalResponse,
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


# --- Room Rentals ---

@router.get("/rentals/all", response_model=PaginatedResponse[RoomRentalResponse])
async def list_rentals(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
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
