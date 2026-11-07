"""Server-only SMTP adapter; delivery is never inferred from code generation."""
import smtplib
import ssl
from email.message import EmailMessage
from app.core.config import settings


class EmailDeliveryError(RuntimeError):
    pass


def send_email(recipient: str, subject: str, text: str) -> None:
    """Send an explicitly requested application email using authenticated STARTTLS.

    No public send endpoint is exposed. Callers must authorize the recipient and
    decide which application workflow permits delivery. No patient content is logged.
    """
    if not settings.SMTP_PASSWORD:
        raise EmailDeliveryError('Email is not configured on the server.')
    if settings.SMTP_PORT != 587:
        raise EmailDeliveryError('Email requires STARTTLS on port 587.')
    if any(c in recipient + subject for c in '\r\n') or '@' not in recipient or ',' in recipient:
        raise ValueError('Provide one valid email recipient and a single-line subject.')
    if settings.SMTP_SENDER != settings.SMTP_USERNAME:
        raise EmailDeliveryError('Email sender must match the authenticated mailbox.')
    message = EmailMessage()
    message['From'] = settings.SMTP_SENDER
    message['To'] = recipient
    message['Subject'] = subject
    message.set_content(text)
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as client:
            client.ehlo()
            client.starttls(context=ssl.create_default_context())
            client.ehlo()
            client.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            refused = client.send_message(message)
            if refused:
                raise EmailDeliveryError('The email server refused the recipient.')
    except (smtplib.SMTPException, OSError):
        raise EmailDeliveryError('Email delivery failed. Check server email configuration.') from None
