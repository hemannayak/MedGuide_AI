import pytest
import uuid
from fastapi import status
from fastapi.testclient import TestClient

from app.main import app
from app.models.users import User
from app.models.profiles import PatientProfile
from app.models.otp import OTPRecord

client = TestClient(app)


@pytest.fixture
def synthetic_phone(db_session):
    # Non-routable synthetic identifier; this development-only test sends no SMS.
    phone = '+999' + str(uuid.uuid4().int)[:12]
    yield phone
    db_session.rollback()
    db_session.query(OTPRecord).filter_by(phone_number=phone).delete(synchronize_session=False)
    db_session.query(User).filter_by(login_identifier=phone).delete(synchronize_session=False)
    db_session.commit()


def test_otp_flow_register_and_login(db_session, synthetic_phone):
    phone = synthetic_phone

    # 1. Request OTP for registration
    req_res = client.post("/api/v1/auth/otp/request", json={"phone_number": phone, "purpose": "REGISTER"})
    assert req_res.status_code == status.HTTP_200_OK
    data = req_res.json()["data"]
    otp_code = data["dev_otp"]
    assert otp_code is not None
    assert len(otp_code) == 6

    # 2. Rate limit test: immediate second request should fail with 429
    rate_res = client.post("/api/v1/auth/otp/request", json={"phone_number": phone, "purpose": "REGISTER"})
    assert rate_res.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    # 3. Incorrect code test
    wrong_code = str((int(otp_code) + 1) % 1000000).zfill(6)
    bad_res = client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "otp_code": wrong_code, "purpose": "REGISTER"})
    assert bad_res.status_code == status.HTTP_400_BAD_REQUEST

    # 4. Successful registration with correct OTP
    reg_res = client.post("/api/v1/auth/otp/register", json={
        "phone_number": phone,
        "otp_code": otp_code,
        "display_name": "SYN OTP Test",
        "preferred_language": "te",
    })
    assert reg_res.status_code == status.HTTP_201_CREATED
    reg_data = reg_res.json()["data"]
    assert "access_token" in reg_data
    assert reg_data["user"]["login_identifier"] == phone

    # Verify patient profile was created in DB
    user = db_session.query(User).filter(User.login_identifier == phone).first()
    assert user is not None
    assert user.patient_profile.display_name == "SYN OTP Test"
    assert user.patient_profile.preferred_language == "te"

    # 5. Request OTP for Login
    login_req_res = client.post("/api/v1/auth/otp/request", json={"phone_number": phone, "purpose": "LOGIN"})
    assert login_req_res.status_code == status.HTTP_200_OK
    login_otp = login_req_res.json()["data"]["dev_otp"]

    # 6. Login with OTP
    login_res = client.post("/api/v1/auth/otp/login", json={"phone_number": phone, "otp_code": login_otp})
    assert login_res.status_code == status.HTTP_200_OK
    login_data = login_res.json()["data"]
    assert "access_token" in login_data
    assert login_data["user"]["login_identifier"] == phone


def test_otp_login_unregistered_phone_fails(synthetic_phone):
    unregistered_phone = synthetic_phone
    res = client.post("/api/v1/auth/otp/request", json={"phone_number": unregistered_phone, "purpose": "LOGIN"})
    assert res.status_code == status.HTTP_404_NOT_FOUND
    assert "No account found" in res.json()["detail"]


def test_expired_code_and_attempt_limit_are_not_bypassed(db_session, synthetic_phone):
    from datetime import datetime, timezone, timedelta
    result=client.post('/api/v1/auth/otp/request',json={'phone_number':synthetic_phone,'purpose':'REGISTER'})
    assert result.status_code==200
    code=result.json()['data']['dev_otp']
    row=db_session.query(OTPRecord).filter_by(phone_number=synthetic_phone).one()
    row.expires_at=datetime.now(timezone.utc)-timedelta(seconds=1);db_session.commit()
    body={'phone_number':synthetic_phone,'purpose':'REGISTER','otp_code':code}
    expired=client.post('/api/v1/auth/otp/verify',json=body)
    assert expired.status_code==400 and 'expired' in expired.json()['detail']
    row.expires_at=datetime.now(timezone.utc)+timedelta(minutes=5);row.attempts=row.max_attempts;db_session.commit()
    assert client.post('/api/v1/auth/otp/verify',json=body).status_code==429


def test_unconfigured_production_phone_auth_never_accepts_development_codes(monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings,'DEBUG',False)
    body={'phone_number':'+999000000000000','purpose':'REGISTER'}
    assert client.post('/api/v1/auth/otp/request',json=body).status_code==503
    assert client.post('/api/v1/auth/otp/verify',json={**body,'otp_code':'000000'}).status_code==503
    assert client.post('/api/v1/auth/otp/request',json={**body,'purpose':'SYN-invalid'}).status_code==422
