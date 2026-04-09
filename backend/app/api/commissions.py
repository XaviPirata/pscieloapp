"""
Commission endpoints - Calculate and track weekly commissions
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession
from typing import Optional
from datetime import date

from app.models.base import get_db
from app.models.user import User
from app.models.session import Session, SessionStatus
from app.models.professional import Professional
from app.models.commission import Commission
from app.schemas.commission import (
    CommissionCalculateRequest, CommissionResponse, CommissionPayRequest,
)
from app.schemas.shared import PaginatedResponse
from app.middleware.auth import get_current_user, require_admin
from app.services.audit import log_action

router = APIRouter()


@router.get("", response_model=PaginatedResponse[CommissionResponse])
async def list_commissions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    professional_id: Optional[str] = None,
    paid: Optional[bool] = None,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List commissions with filters"""
    query = db.query(Commission)

    if professional_id:
        query = query.filter(Commission.professional_id == professional_id)
    if paid is not None:
        query = query.filter(Commission.paid == paid)

    total = query.count()
    items = query.order_by(Commission.week_start.desc()).offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for comm in items:
        data = CommissionResponse.model_validate(comm)
        prof = db.query(Professional).filter(Professional.id == comm.professional_id).first()
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


@router.post("/calculate", response_model=CommissionResponse, status_code=201)
async def calculate_commission(
    data: CommissionCalculateRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Calculate commission for a professional for a given week"""
    prof = db.query(Professional).filter(Professional.id == data.professional_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")

    # Check for existing commission for this period
    existing = db.query(Commission).filter(
        Commission.professional_id == data.professional_id,
        Commission.week_start == data.week_start,
        Commission.week_end == data.week_end,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe comisión calculada para este período")

    # Get attended sessions in the period
    sessions = db.query(Session).filter(
        Session.professional_id == data.professional_id,
        Session.status == SessionStatus.ATTENDED,
        Session.scheduled_at >= data.week_start.isoformat(),
        Session.scheduled_at <= data.week_end.isoformat() + "T23:59:59",
    ).all()

    total_revenue = sum(s.amount for s in sessions)
    commission_amount = total_revenue * (prof.commission_percentage / 100)

    session_details = [
        {
            "session_id": s.id,
            "date": s.scheduled_at.isoformat(),
            "amount": s.amount,
            "patient_id": s.patient_id,
        }
        for s in sessions
    ]

    commission = Commission(
        professional_id=data.professional_id,
        week_start=data.week_start,
        week_end=data.week_end,
        total_sessions=len(sessions),
        total_revenue=total_revenue,
        commission_amount=commission_amount,
        commission_percentage=prof.commission_percentage,
        session_details=session_details,
        calculated=True,
        created_by=current_user.id,
    )
    db.add(commission)
    db.commit()
    db.refresh(commission)

    log_action(db, current_user.id, "CALCULATE", "commission", commission.id,
               new_values={"amount": commission_amount, "sessions": len(sessions)})

    return CommissionResponse.model_validate(commission)


@router.put("/{commission_id}/pay", response_model=CommissionResponse)
async def mark_commission_paid(
    commission_id: str,
    data: CommissionPayRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Mark a commission as paid"""
    commission = db.query(Commission).filter(Commission.id == commission_id).first()
    if not commission:
        raise HTTPException(status_code=404, detail="Comisión no encontrada")

    if commission.paid:
        raise HTTPException(status_code=409, detail="Esta comisión ya está marcada como pagada")

    commission.paid = True
    commission.payment_date = data.payment_date
    commission.updated_by = current_user.id
    db.commit()
    db.refresh(commission)

    log_action(db, current_user.id, "PAY", "commission", commission.id,
               new_values={"paid": True, "payment_date": data.payment_date.isoformat()})

    return CommissionResponse.model_validate(commission)
