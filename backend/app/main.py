"""
FastAPI application entry point
PsCielo - Comprehensive psychological center management system
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.models.base import engine, Base

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    # Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)
    # Seed initial SUPERADMIN (idempotent)
    try:
        from app.seed import seed_superadmin
        seed_superadmin()
    except Exception as e:
        print(f"⚠️  Seed skipped: {e}")
    yield
    # Shutdown
    print(f"🛑 Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Comprehensive psychological center management system",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/api/v1/status")
async def api_status():
    """API status endpoint"""
    return {
        "status": "operational",
        "database": "connected",
        "timestamp": "now",
    }


# Import and include routers
from app.api import auth, professionals, rooms, patients, sessions, commissions

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(professionals.router, prefix="/api/v1/professionals", tags=["Profesionales"])
app.include_router(rooms.router, prefix="/api/v1/rooms", tags=["Consultorios"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Pacientes"])
app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["Sesiones"])
app.include_router(commissions.router, prefix="/api/v1/commissions", tags=["Comisiones"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )
