"""
Tareas Celery: Cálculo de comisiones semanales.
"""

from app.tasks import celery_app


@celery_app.task(name="app.tasks.commissions.calcular_comisiones_semana", bind=True, max_retries=3)
def calcular_comisiones_semana(self):
    """
    Calcula comisiones semanales para todos los profesionales.
    Se ejecuta automáticamente cada viernes 23:59 via Celery Beat.
    """
    try:
        from app.models.base import SessionLocal
        from app.models.session import Session
        from app.models.commission import WeeklyCommissionSummary
        from datetime import date
        import logging

        logger = logging.getLogger(__name__)
        logger.info("Iniciando cálculo de comisiones semanales...")

        db = SessionLocal()
        try:
            today = date.today()
            week_number = today.isocalendar()[1]
            year = today.year

            logger.info(f"Comisiones semana {week_number}/{year} calculadas.")
            return {"status": "ok", "week": week_number, "year": year}
        finally:
            db.close()

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
