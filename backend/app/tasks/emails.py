"""
Tareas Celery: Envío de emails.
"""

from app.tasks import celery_app


@celery_app.task(name="app.tasks.emails.enviar_email", bind=True, max_retries=3)
def enviar_email(self, to: str, subject: str, body: str):
    """
    Envía un email de forma asíncrona.
    Placeholder — integrar SendGrid/Gmail en Fase 2.
    """
    try:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Email enviado a {to}: {subject}")
        return {"status": "sent", "to": to}
    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)
