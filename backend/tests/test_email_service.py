import smtplib
from unittest.mock import MagicMock
import pytest
from app.services import email_service as mail


def test_missing_credential_never_connects(monkeypatch):
    monkeypatch.setattr(mail.settings, 'SMTP_PASSWORD', '')
    smtp = MagicMock()
    monkeypatch.setattr(mail.smtplib, 'SMTP', smtp)
    with pytest.raises(mail.EmailDeliveryError, match='not configured'):
        mail.send_email('SYN-test@example.invalid', 'Synthetic test', 'Test only')
    smtp.assert_not_called()


def test_tls_precedes_auth_and_send(monkeypatch):
    monkeypatch.setattr(mail.settings, 'SMTP_PASSWORD', 'SYN-test-secret')
    smtp = MagicMock()
    client = smtp.return_value.__enter__.return_value
    client.send_message.return_value = {}
    monkeypatch.setattr(mail.smtplib, 'SMTP', smtp)
    mail.send_email('SYN-test@example.invalid', 'Synthetic test', 'Test only')
    assert [c[0] for c in client.method_calls] == ['ehlo', 'starttls', 'ehlo', 'login', 'send_message']
    message = client.send_message.call_args.args[0]
    assert message['From'] == 'viala.health@gmail.com'


def test_provider_error_does_not_expose_credentials(monkeypatch):
    monkeypatch.setattr(mail.settings, 'SMTP_PASSWORD', 'SYN-test-secret')
    smtp = MagicMock(side_effect=smtplib.SMTPAuthenticationError(535, b'SYN-test-secret'))
    monkeypatch.setattr(mail.smtplib, 'SMTP', smtp)
    with pytest.raises(mail.EmailDeliveryError) as error:
        mail.send_email('SYN-test@example.invalid', 'Synthetic test', 'Test only')
    assert 'SYN-test-secret' not in str(error.value)
