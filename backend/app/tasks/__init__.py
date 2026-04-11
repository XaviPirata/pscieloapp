"""
Celery application initialization.
Tareas async: cálculo de comisiones, envío de emails, backups.
"""

from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "pscielo",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.commissions", "app.tasks.emails"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Argentina/Buenos_Aires",
    enable_utc=True,
    task_track_started=True,
    # Beat schedule: calcular comisiones cada viernes a las 23:59
    beat_schedule={
        "calcular-comisiones-semanal": {
            "task": "app.tasks.commissions.calcular_comisiones_semana",
            "schedule": 604800.0,  # cada 7 días
        },
    },
)

# Alias para que `celery -A app.tasks worker` funcione
app = celery_app
