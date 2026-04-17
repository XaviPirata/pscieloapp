"""
Seed script - Crea datos iniciales si no existen.
Se ejecuta al arrancar el backend (idempotente).
"""

import os
from datetime import datetime, timedelta
from app.models.base import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.room import Room, RoomStatus
from app.models.professional import Professional
from app.models.patient import Patient
from app.models.session import Session, SessionStatus, SessionType
from app.middleware.auth import hash_password


def seed_superadmin():
    """Crear SUPERADMIN inicial desde variables de entorno."""
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
        else:
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

        # Seed rooms, professionals, patients, sessions
        _seed_rooms(db)
        _seed_professionals(db)
        _seed_patients(db)
        _seed_sessions(db)

    except Exception as e:
        db.rollback()
        print(f"❌ Error en seed: {e}")
    finally:
        db.close()


def _seed_rooms(db):
    """Crear los 4 consultorios iniciales."""
    existing = db.query(Room).count()
    if existing > 0:
        print(f"✅ Rooms ya existen ({existing})")
        return

    rooms = [
        Room(
            name="Consultorio 1",
            description="Consultorio principal - planta baja",
            capacity=15.0,
            hourly_rate=5000,
            amenities="Diván, escritorio, aire acondicionado",
            status=RoomStatus.AVAILABLE,
        ),
        Room(
            name="Consultorio 2",
            description="Consultorio secundario - planta baja",
            capacity=12.0,
            hourly_rate=5000,
            amenities="Sillones, escritorio, ventilador",
            status=RoomStatus.AVAILABLE,
        ),
        Room(
            name="Consultorio 3",
            description="Consultorio primer piso",
            capacity=18.0,
            hourly_rate=6000,
            amenities="Diván, escritorio, aire acondicionado, baño privado",
            status=RoomStatus.AVAILABLE,
        ),
        Room(
            name="Consultorio 4",
            description="Sala de terapia grupal",
            capacity=30.0,
            hourly_rate=8000,
            amenities="Sillas grupales, pizarra, proyector, aire acondicionado",
            status=RoomStatus.AVAILABLE,
        ),
    ]
    db.add_all(rooms)
    db.commit()
    print(f"✅ {len(rooms)} consultorios creados (C1-C4)")


def _seed_professionals(db):
    """Crear profesionales demo con sus usuarios."""
    existing = db.query(Professional).count()
    if existing > 0:
        print(f"✅ Professionals ya existen ({existing})")
        return

    pros = [
        {
            "email": "andrea@pscielo.com",
            "first_name": "Andrea",
            "last_name": "López",
            "phone": "351-555-0001",
            "license": "MP-1234",
            "specialties": ["Psicología Clínica", "Ansiedad"],
            "hourly_rate": 15000,
            "commission": 30,
        },
        {
            "email": "yamila@pscielo.com",
            "first_name": "Yamila",
            "last_name": "Gutiérrez",
            "phone": "351-555-0002",
            "license": "MP-5678",
            "specialties": ["Terapia Cognitiva", "Adolescentes"],
            "hourly_rate": 14000,
            "commission": 30,
        },
        {
            "email": "martin@pscielo.com",
            "first_name": "Martín",
            "last_name": "Rodríguez",
            "phone": "351-555-0003",
            "license": "MP-9012",
            "specialties": ["Neuropsicología", "Evaluaciones"],
            "hourly_rate": 18000,
            "commission": 25,
        },
        {
            "email": "lucia@pscielo.com",
            "first_name": "Lucía",
            "last_name": "Fernández",
            "phone": "351-555-0004",
            "license": "MP-3456",
            "specialties": ["Psicología Infantil", "Juego"],
            "hourly_rate": 13000,
            "commission": 30,
        },
    ]

    for p in pros:
        user = User(
            email=p["email"],
            first_name=p["first_name"],
            last_name=p["last_name"],
            phone=p["phone"],
            password_hash=hash_password("PsCielo2026!"),
            role=UserRole.PROFESSIONAL,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.flush()

        prof = Professional(
            user_id=user.id,
            license_number=p["license"],
            specialties=p["specialties"],
            hourly_rate=p["hourly_rate"],
            commission_percentage=p["commission"],
            is_active=True,
        )
        db.add(prof)

    db.commit()
    print(f"✅ {len(pros)} profesionales creados con usuarios")


def _seed_patients(db):
    """Crear pacientes demo."""
    existing = db.query(Patient).count()
    if existing > 0:
        print(f"✅ Patients ya existen ({existing})")
        return

    patients = [
        Patient(first_name="Federico", last_name="Mendoza", email="fede@email.com", phone="351-111-0001", referral_source="Instagram", is_active=True),
        Patient(first_name="Ismael", last_name="Ruiz", email="ismael@email.com", phone="351-111-0002", referral_source="Derivación", is_active=True),
        Patient(first_name="Morena", last_name="López", email="morena@email.com", phone="351-111-0003", referral_source="Google", is_active=True),
        Patient(first_name="Victoria", last_name="Sánchez", email="vicky@email.com", phone="351-111-0004", referral_source="Amigo", is_active=True),
        Patient(first_name="Sofía", last_name="Ramírez", email="sofia@email.com", phone="351-111-0005", referral_source="Instagram", is_active=True),
        Patient(first_name="Nicolás", last_name="Cattaneo", email="nico@email.com", phone="351-111-0006", referral_source="Instagram", is_active=True),
        Patient(first_name="Camila", last_name="Ríos", email="camila@email.com", phone="351-111-0007", referral_source="Web", is_active=False),
    ]
    db.add_all(patients)
    db.commit()
    print(f"✅ {len(patients)} pacientes creados")


def _seed_sessions(db):
    """Crear sesiones demo para esta semana."""
    existing = db.query(Session).count()
    if existing > 0:
        print(f"✅ Sessions ya existen ({existing})")
        return

    # Get references
    professionals = db.query(Professional).all()
    patients = db.query(Patient).filter(Patient.is_active == True).all()
    rooms = db.query(Room).all()

    if not professionals or not patients or not rooms:
        print("⚠️  No hay profesionales/pacientes/rooms para crear sesiones")
        return

    # Get current week's Monday
    today = datetime.utcnow()
    monday = today - timedelta(days=today.weekday())
    monday = monday.replace(hour=0, minute=0, second=0, microsecond=0)

    pro_andrea = next((p for p in professionals if "andrea" in db.query(User).filter(User.id == p.user_id).first().email), professionals[0])
    pro_yamila = next((p for p in professionals if "yamila" in db.query(User).filter(User.id == p.user_id).first().email), professionals[1]) if len(professionals) > 1 else professionals[0]

    sessions_data = [
        # Lunes
        {"pro": pro_andrea, "patient": patients[0], "room": rooms[1], "day": 0, "hour": 8, "status": SessionStatus.ATTENDED, "type": SessionType.FOLLOW_UP},
        {"pro": pro_andrea, "patient": patients[1], "room": rooms[1], "day": 0, "hour": 9, "status": SessionStatus.ATTENDED, "type": SessionType.CONSULTATION},
        # Martes
        {"pro": pro_yamila, "patient": patients[2], "room": rooms[0], "day": 1, "hour": 10, "status": SessionStatus.ATTENDED, "type": SessionType.FOLLOW_UP},
        {"pro": pro_andrea, "patient": patients[4], "room": rooms[2], "day": 1, "hour": 16, "status": SessionStatus.CONFIRMED, "type": SessionType.CONSULTATION},
        # Miércoles
        {"pro": pro_andrea, "patient": patients[0], "room": rooms[1], "day": 2, "hour": 14, "status": SessionStatus.SCHEDULED, "type": SessionType.FOLLOW_UP},
        {"pro": pro_yamila, "patient": patients[5], "room": rooms[0], "day": 2, "hour": 16, "status": SessionStatus.SCHEDULED, "type": SessionType.INITIAL},
        # Jueves
        {"pro": pro_yamila, "patient": patients[3], "room": rooms[0], "day": 3, "hour": 9, "status": SessionStatus.SCHEDULED, "type": SessionType.FOLLOW_UP},
        {"pro": pro_andrea, "patient": patients[6], "room": rooms[1], "day": 3, "hour": 17, "status": SessionStatus.CANCELLED, "type": SessionType.CONSULTATION},
        # Viernes
        {"pro": pro_yamila, "patient": patients[2], "room": rooms[0], "day": 4, "hour": 10, "status": SessionStatus.SCHEDULED, "type": SessionType.FOLLOW_UP},
        {"pro": pro_andrea, "patient": patients[4], "room": rooms[2], "day": 4, "hour": 15, "status": SessionStatus.SCHEDULED, "type": SessionType.ASSESSMENT},
    ]

    for s in sessions_data:
        session = Session(
            professional_id=s["pro"].id,
            patient_id=s["patient"].id,
            room_id=s["room"].id,
            scheduled_at=monday + timedelta(days=s["day"], hours=s["hour"]),
            duration_minutes=50,
            session_type=s["type"],
            status=s["status"],
            amount=s["pro"].hourly_rate,
        )
        db.add(session)

    db.commit()
    print(f"✅ {len(sessions_data)} sesiones demo creadas para esta semana")


if __name__ == "__main__":
    seed_superadmin()
