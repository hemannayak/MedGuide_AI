from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.consent import Consent
from app.models.profiles import PatientProfile
from app.schemas.consent import ConsentGrantRequest


def get_patient_consents(
    db: Session,
    patient_profile: PatientProfile,
) -> List[Consent]:
    """Fetch consent status for patient."""
    return (
        db.query(Consent)
        .filter(Consent.patient_id == patient_profile.id)
        .all()
    )


def grant_consent(
    db: Session,
    patient_profile: PatientProfile,
    req: ConsentGrantRequest,
) -> Consent:
    """Record patient granted consent."""
    consent = Consent(
        patient_id=patient_profile.id,
        consent_type=req.consent_type,
        status="GRANTED",
        version=req.version,
        granted_at=datetime.now(timezone.utc),
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return consent


def withdraw_consent(
    db: Session,
    patient_profile: PatientProfile,
    consent_id: str,
) -> Consent:
    """Withdraw patient consent."""
    consent = (
        db.query(Consent)
        .filter(
            Consent.id == consent_id,
            Consent.patient_id == patient_profile.id,
        )
        .first()
    )
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent record not found",
        )

    consent.status = "WITHDRAWN"
    consent.withdrawn_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(consent)
    return consent
