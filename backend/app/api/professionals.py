"""
Professional endpoints - CRUD operations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session as DBSession
from typing import Optional

from app.models.base import get_db
from app.models.user import User
from app.models.professional import Professional
from app.schemas.professional import (
    ProfessionalCreate, ProfessionalUpdate,
    ProfessionalResponse, ProfessionalListResponse,
)
from app.schemas.shared import PaginatedResponse
from app.middleware.auth import get_current_user, require_admin
from app.services.audit import log_action

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ProfessionalListResponse])
async def list_professionals(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all professionals with pagination"""
    query = db.query(Professional)

    if is_active is not None:
        query = query.filter(Professional.is_active == is_active)

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    # Enrich with user data
    result = []
    for prof in items:
        user = db.query(User).filter(User.id == prof.user_id).first()
        data = ProfessionalListResponse.model_validate(prof)
        if user:
            data.user_email = user.email
            data.user_name = user.full_name
        result.append(data)

    return PaginatedResponse(
        items=result,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{professional_id}", response_model=ProfessionalResponse)
async def get_professional(
    professional_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific professional by ID"""
    prof = db.query(Professional).filter(Professional.id == professional_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")

    user = db.query(User).filter(User.id == prof.user_id).first()
    response = ProfessionalResponse.model_validate(prof)
    if user:
        response.user_email = user.email
        response.user_name = user.full_name

    return response


@router.post("", response_model=ProfessionalResponse, status_code=status.HTTP_201_CREATED)
async def create_professional(
    data: ProfessionalCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new professional (admin only)"""
    # Verify user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Check if user already has a professional profile
    existing = db.query(Professional).filter(Professional.user_id == data.user_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Este usuario ya tiene perfil profesional")

    prof = Professional(
        **data.model_dump(),
        created_by=current_user.id,
    )
    db.add(prof)
    db.commit()
    db.refresh(prof)

    log_action(db, current_user.id, "CREATE", "professional", prof.id, new_values=data.model_dump())

    response = ProfessionalResponse.model_validate(prof)
    response.user_email = user.email
    response.user_name = user.full_name
    return response


@router.put("/{professional_id}", response_model=ProfessionalResponse)
async def update_professional(
    professional_id: str,
    data: ProfessionalUpdate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a professional (admin only)"""
    prof = db.query(Professional).filter(Professional.id == professional_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")

    old_values = {k: getattr(prof, k) for k in data.model_dump(exclude_unset=True)}
    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(prof, key, value)

    prof.updated_by = current_user.id
    db.commit()
    db.refresh(prof)

    log_action(db, current_user.id, "UPDATE", "professional", prof.id,
               old_values=old_values, new_values=update_data)

    user = db.query(User).filter(User.id == prof.user_id).first()
    response = ProfessionalResponse.model_validate(prof)
    if user:
        response.user_email = user.email
        response.user_name = user.full_name
    return response


@router.delete("/{professional_id}")
async def delete_professional(
    professional_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Soft-delete a professional (set inactive)"""
    prof = db.query(Professional).filter(Professional.id == professional_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")

    prof.is_active = False
    prof.updated_by = current_user.id
    db.commit()

    log_action(db, current_user.id, "DELETE", "professional", prof.id,
               old_values={"is_active": True}, new_values={"is_active": False})

    return {"message": "Profesional desactivado exitosamente"}
