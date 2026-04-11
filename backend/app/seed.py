"""
Seed script - Crea el usuario SUPERADMIN inicial si no existe.
Se ejecuta al arrancar el backend (idempotente).
"""

import os
from app.models.base import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.middleware.auth import hash_password


def seed_superadmin():
    """Crear SUPERADMIN inicial desde variables de entorno."""
    # Asegurar que las tablas existan
    Base.metadata.create_all(bind=engine)

    email = os.getenv("SEED_SUPERADMIN_EMAIL", "admin@pscielo.com")
    password = os.getenv("SEED_SUPERADMIN_PASSWORD")
    first_name = os.getenv("SEED_SUPERADMIN_FIRST_NAME", "Super")
    last_name = os.getenv("SEED_SUPERADMIN_LAST_NAME", "Admin")

    if not password:
        print("⚠️  SEED_SUPERADMIN_PASSWORD no configurado, saltando seed.")
        return

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"✅ SUPERADMIN ya existe: {email}")
            return

        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password_hash=hash_password(password),
            role=UserRole.SUPERADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        print(f"✅ SUPERADMIN creado: {email}")
    except Exception as e:
        db.rollback()
        print(f"❌ Error creando SUPERADMIN: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_superadmin()
