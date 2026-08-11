from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.profiles import PatientProfile
from app.models.users import User
from app.schemas.patient import PatientProfileUpdateRequest


def get_patient_profile_by_user(db: Session, user: User) -> PatientProfile:
    """Fetch patient profile associated with authenticated user."""
    profile = (
        db.query(PatientProfile)
        .filter(PatientProfile.user_id == user.id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )
    return profile


def update_patient_profile(
    db: Session,
    patient_profile: PatientProfile,
    req: PatientProfileUpdateRequest,
) -> PatientProfile:
    """Update patient profile information."""
    if req.display_name is not None:
        patient_profile.display_name = req.display_name
    if req.date_of_birth is not None:
        patient_profile.date_of_birth = req.date_of_birth
    if req.preferred_language is not None:
        patient_profile.preferred_language = req.preferred_language
    if req.contact_reference is not None:
        patient_profile.contact_reference = req.contact_reference

    db.commit()
    db.refresh(patient_profile)
    return patient_profile
