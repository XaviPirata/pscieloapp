"""
Authentication endpoints - Login, Register, Refresh, Me
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.models.base import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    LoginRequest, TokenResponse, RefreshTokenRequest,
    UserCreate, UserResponse,
)
from app.middleware.auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, get_current_user, require_admin,
)
from app.config import get_settings

settings = get_settings()
router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: DBSession = Depends(get_db)):
    """Authenticate user and return JWT tokens"""
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada. Contactá al administrador.",
        )

    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: DBSession = Depends(get_db)):
    """Refresh access token using refresh token"""
    payload = decode_token(data.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de refresh inválido",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )

    access_token = create_access_token(user.id, user.role.value)
    new_refresh_token = create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: UserCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Register a new user (admin only)"""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese email",
        )

    user = User(
        email=data.email,
        first_name=data.first_name,
        last_name=data.last_name,
        password_hash=hash_password(data.password),
        role=data.role,
        phone=data.phone,
        is_active=True,
        is_verified=True,
        created_by=current_user.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile"""
    return current_user


@router.post("/seed-superadmin", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def seed_superadmin(db: DBSession = Depends(get_db)):
    """Create initial superadmin user (only works if no users exist)"""
    user_count = db.query(User).count()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existen usuarios. Este endpoint solo funciona con la BD vacía.",
        )

    superadmin = User(
        email="admin@pscielo.com",
        first_name="Admin",
        last_name="PsCielo",
        password_hash=hash_password("admin123456"),
        role=UserRole.SUPERADMIN,
        is_active=True,
        is_verified=True,
    )
    db.add(superadmin)
    db.commit()
    db.refresh(superadmin)

    return superadmin
