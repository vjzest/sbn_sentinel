import smtplib
from email.message import EmailMessage
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body: str, is_html: bool = False):
    if not settings.SMTP_SERVER or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(f"SMTP configuration is missing. Mocking email send to {to_email}: {subject}")
        return False

    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_USER
        msg['To'] = to_email

        if is_html:
            msg.set_content(body, subtype='html')
        else:
            msg.set_content(body)

        port = int(settings.SMTP_PORT) if settings.SMTP_PORT else 587
        with smtplib.SMTP(settings.SMTP_SERVER, port) as server:
            if port == 587:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False
