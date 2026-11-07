import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.otp import OTPRecord
from app.models.profiles import PatientProfile
from app.models.roles import Role
from app.models.users import User
from app.schemas.auth import OTPLoginRequest, OTPRegisterRequest
from app.services.audit_service import (
    ACTION_LOGIN_FAILURE,
    ACTION_LOGIN_SUCCESS,
    RESOURCE_USER,
    log_audit_event,
)


def normalize_phone(phone: str) -> str:
    """Normalize phone number to standard international format (defaulting to +91 if 10 digits)."""
    cleaned = re.sub(r"[^\d+]", "", phone.strip())
    if cleaned.startswith("+"):
        return cleaned
    if len(cleaned) == 10:
        return f"+91{cleaned}"
    if cleaned.startswith("91") and len(cleaned) == 12:
        return f"+{cleaned}"
    return f"+{cleaned}" if not cleaned.startswith("+") else cleaned


def request_otp(db: Session, raw_phone: str, purpose: str = "LOGIN") -> Dict:
    """Generate, rate-limit, and dispatch an OTP for phone authentication."""
    if not (settings.DEBUG and settings.APP_ENV == 'development'):
        raise HTTPException(503, 'Phone verification delivery is not configured. Use password sign-in.')
    phone = normalize_phone(raw_phone)
    now = datetime.now(timezone.utc)

    # Validate purpose constraints
    if purpose.upper() == "LOGIN":
        user = db.query(User).filter(User.login_identifier == phone).first()
        if not user:
            # Also check without plus sign or 10-digit
            ten_digit = phone.replace("+91", "")
            user = db.query(User).filter(User.login_identifier.in_([phone, ten_digit])).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this mobile number. Please create an account first.",
            )
    elif purpose.upper() == "REGISTER":
        existing = db.query(User).filter(User.login_identifier == phone).first()
        if not existing:
            ten_digit = phone.replace("+91", "")
            existing = db.query(User).filter(User.login_identifier.in_([phone, ten_digit])).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this mobile number already exists. Please sign in.",
            )

    # Rate limiting check: 60 seconds cooldown
    recent = (
        db.query(OTPRecord)
        .filter(
            OTPRecord.phone_number == phone,
            OTPRecord.purpose == purpose.upper(),
            OTPRecord.resend_after > now,
            OTPRecord.consumed_at.is_(None),
        )
        .first()
    )
    if recent:
        wait_seconds = max(1, int((recent.resend_after - now).total_seconds()))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {wait_seconds} seconds before requesting a new code.",
        )

    # Generate 6-digit numeric OTP
    otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
    otp_hash = hash_password(otp_code)

    resend_after = now + timedelta(seconds=60)
    expires_at = now + timedelta(minutes=5)

    record = OTPRecord(
        phone_number=phone,
        otp_hash=otp_hash,
        purpose=purpose.upper(),
        attempts=0,
        max_attempts=5,
        resend_after=resend_after,
        expires_at=expires_at,
        is_verified=False,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # In development or debug, expose dev_otp for automated tests and dev convenience
    dev_otp: Optional[str] = None
    if settings.DEBUG and settings.APP_ENV == 'development':
        dev_otp = otp_code

    return {
        "phone_number": phone,
        "resend_after_seconds": 60,
        "expires_in_seconds": 300,
        "dev_otp": dev_otp,
    }


def verify_otp_internal(db: Session, raw_phone: str, otp_code: str, purpose: str = "LOGIN") -> OTPRecord:
    """Internal validation of OTP code with attempt tracking and expiry checks."""
    if not (settings.DEBUG and settings.APP_ENV == 'development'):
        raise HTTPException(503, 'Phone verification delivery is not configured. Use password sign-in.')
    phone = normalize_phone(raw_phone)
    now = datetime.now(timezone.utc)

    record = (
        db.query(OTPRecord)
        .filter(
            OTPRecord.phone_number == phone,
            OTPRecord.purpose == purpose.upper(),
            OTPRecord.consumed_at.is_(None),
        )
        .order_by(OTPRecord.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verification code was requested for this mobile number.",
        )

    if record.expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code.",
        )

    if record.attempts >= record.max_attempts:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please request a new verification code.",
        )

    if not verify_password(otp_code.strip(), record.otp_hash):
        record.attempts += 1
        db.commit()
        remaining = record.max_attempts - record.attempts
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Incorrect verification code. {remaining} attempt(s) remaining.",
        )

    record.is_verified = True
    db.commit()
    return record


def register_with_otp(db: Session, req: OTPRegisterRequest) -> Tuple[User, str]:
    """Verify OTP and register new patient account, establishing JWT session."""
    record = verify_otp_internal(db, req.phone_number, req.otp_code, purpose="REGISTER")
    phone = record.phone_number

    # Ensure role exists
    patient_role = db.query(Role).filter(Role.name == "PATIENT").first()
    if not patient_role:
        patient_role = Role(name="PATIENT")
        db.add(patient_role)
        db.commit()
        db.refresh(patient_role)

    # Double check unique
    existing = db.query(User).filter(User.login_identifier == phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this mobile number already exists. Please sign in.",
        )

    # Generate secure random system password for OTP-based account
    random_secret = secrets.token_urlsafe(32)
    user = User(
        role_id=patient_role.id,
        login_identifier=phone,
        password_hash=hash_password(random_secret),
        status="ACTIVE",
        last_login_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = PatientProfile(
        user_id=user.id,
        display_name=req.display_name.strip(),
        preferred_language=req.preferred_language,
    )
    db.add(profile)

    # Mark OTP as consumed
    record.consumed_at = datetime.now(timezone.utc)
    db.commit()

    log_audit_event(
        db=db,
        action=ACTION_LOGIN_SUCCESS,
        resource_type=RESOURCE_USER,
        actor_user_id=user.id,
        resource_id=user.id,
        metadata={"login_identifier": user.login_identifier, "role": user.role.name, "method": "OTP_REGISTER"},
    )
    db.commit()

    token = create_access_token(subject=user.id, role=user.role.name)
    return user, token


def login_with_otp(db: Session, req: OTPLoginRequest) -> Tuple[User, str]:
    """Verify OTP and authenticate existing patient, returning JWT token."""
    record = verify_otp_internal(db, req.phone_number, req.otp_code, purpose="LOGIN")
    phone = record.phone_number

    user = db.query(User).filter(User.login_identifier == phone).first()
    if not user:
        ten_digit = phone.replace("+91", "")
        user = db.query(User).filter(User.login_identifier.in_([phone, ten_digit])).first()

    if not user:
        log_audit_event(
            db=db,
            action=ACTION_LOGIN_FAILURE,
            resource_type=RESOURCE_USER,
            metadata={"login_identifier": phone, "method": "OTP_LOGIN"},
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this mobile number. Please register first.",
        )

    record.consumed_at = datetime.now(timezone.utc)
    user.last_login_at = datetime.now(timezone.utc)
    log_audit_event(
        db=db,
        action=ACTION_LOGIN_SUCCESS,
        resource_type=RESOURCE_USER,
        actor_user_id=user.id,
        resource_id=user.id,
        metadata={"login_identifier": user.login_identifier, "role": user.role.name, "method": "OTP_LOGIN"},
    )
    db.commit()

    token = create_access_token(subject=user.id, role=user.role.name)
    return user, token
