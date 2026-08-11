from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.profiles import PatientProfile
from app.models.roles import Role
from app.models.users import User
from app.schemas.auth import UserRegisterRequest


def register_patient_user(db: Session, req: UserRegisterRequest) -> User:
    """Register a new patient account with associated patient profile."""
    existing_user = (
        db.query(User)
        .filter(User.login_identifier == req.login_identifier)
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this login identifier already exists",
        )

    patient_role = db.query(Role).filter(Role.name == "PATIENT").first()
    if not patient_role:
        patient_role = Role(name="PATIENT")
        db.add(patient_role)
        db.commit()
        db.refresh(patient_role)

    new_user = User(
        role_id=patient_role.id,
        login_identifier=req.login_identifier,
        password_hash=hash_password(req.password),
        status="ACTIVE",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    profile = PatientProfile(
        user_id=new_user.id,
        display_name=req.display_name,
        preferred_language=req.preferred_language,
    )
    db.add(profile)
    db.commit()

    return new_user


from typing import Tuple

def authenticate_user(db: Session, login_identifier: str, password: str) -> Tuple[User, str]:
    """Authenticate user login credentials and return User model and JWT token."""
    user = (
        db.query(User)
        .filter(User.login_identifier == login_identifier)
        .first()
    )
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login credentials",
        )

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(subject=user.id, role=user.role.name)
    return user, token

