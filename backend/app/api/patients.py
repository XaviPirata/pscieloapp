"""
Patient endpoints - CRUD operations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session as DBSession
from typing import Optional

from app.models.base import get_db
from app.models.user import User
from app.models.patient import Patient, PatientHistory
from app.schemas.patient import (
    PatientCreate, PatientUpdate, PatientResponse, PatientListResponse,
    PatientHistoryCreate, PatientHistoryUpdate, PatientHistoryResponse,
)
from app.schemas.shared import PaginatedResponse
from app.middleware.auth import get_current_user, require_admin, require_professional
from app.services.audit import log_action

router = APIRouter()


@router.get("", response_model=PaginatedResponse[PatientListResponse])
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all patients with search and pagination"""
    query = db.query(Patient)

    if is_active is not None:
        query = query.filter(Patient.is_active == is_active)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Patient.first_name.ilike(search_term)) |
            (Patient.last_name.ilike(search_term)) |
            (Patient.email.ilike(search_term)) |
            (Patient.phone.ilike(search_term))
        )

    total = query.count()
    items = query.order_by(Patient.last_name).offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedResponse(
        items=[PatientListResponse.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific patient by ID"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return patient


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    data: PatientCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_professional),
):
    """Create a new patient"""
    patient = Patient(
        **data.model_dump(),
        created_by=current_user.id,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    log_action(db, current_user.id, "CREATE", "patient", patient.id, new_values=data.model_dump())
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    data: PatientUpdate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_professional),
):
    """Update a patient"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    old_values = {k: getattr(patient, k) for k in data.model_dump(exclude_unset=True)}
    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(patient, key, value)

    patient.updated_by = current_user.id
    db.commit()
    db.refresh(patient)

    log_action(db, current_user.id, "UPDATE", "patient", patient.id,
               old_values=old_values, new_values=update_data)
    return patient


@router.delete("/{patient_id}")
async def delete_patient(
    patient_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Soft-delete a patient (admin only)"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    patient.is_active = False
    patient.updated_by = current_user.id
    db.commit()

    log_action(db, current_user.id, "DELETE", "patient", patient.id,
               old_values={"is_active": True}, new_values={"is_active": False})
    return {"message": "Paciente desactivado exitosamente"}


@router.delete("/{patient_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def permanent_delete_patient(
    patient_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Permanently delete a patient and their history (admin only)"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    # Check for existing sessions
    from app.models.session import Session as SessionModel
    session_count = db.query(SessionModel).filter(SessionModel.patient_id == patient_id).count()
    if session_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"No se puede eliminar: el paciente tiene {session_count} sesión(es) registrada(s). Desactívelo en su lugar."
        )

    # Delete history if exists
    history = db.query(PatientHistory).filter(PatientHistory.patient_id == patient_id).first()
    if history:
        db.delete(history)

    patient_name = f"{patient.first_name} {patient.last_name}"
    log_action(db, current_user.id, "PERMANENT_DELETE", "patient", patient_id,
               old_values={"name": patient_name, "email": patient.email})

    db.delete(patient)
    db.commit()


# --- Patient History ---

@router.get("/{patient_id}/history", response_model=PatientHistoryResponse)
async def get_patient_history(
    patient_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_professional),
):
    """Get patient clinical history"""
    history = db.query(PatientHistory).filter(PatientHistory.patient_id == patient_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="Historial no encontrado")
    return history


@router.post("/{patient_id}/history", response_model=PatientHistoryResponse, status_code=status.HTTP_201_CREATED)
async def create_patient_history(
    patient_id: str,
    data: PatientHistoryCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_professional),
):
    """Create patient clinical history"""
    existing = db.query(PatientHistory).filter(PatientHistory.patient_id == patient_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe historial para este paciente")

    history = PatientHistory(
        **data.model_dump(),
        created_by=current_user.id,
    )
    db.add(history)
    db.commit()
    db.refresh(history)

    log_action(db, current_user.id, "CREATE", "patient_history", history.id)
    return history


@router.put("/{patient_id}/history", response_model=PatientHistoryResponse)
async def update_patient_history(
    patient_id: str,
    data: PatientHistoryUpdate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_professional),
):
    """Update patient clinical history"""
    history = db.query(PatientHistory).filter(PatientHistory.patient_id == patient_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="Historial no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(history, key, value)

    history.updated_by = current_user.id
    db.commit()
    db.refresh(history)

    log_action(db, current_user.id, "UPDATE", "patient_history", history.id)
    return history
