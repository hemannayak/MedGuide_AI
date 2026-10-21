from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.consent import Consent
from app.models.profiles import PatientProfile
from app.schemas.consent import ConsentGrantRequest
from app.services.audit_service import log_audit_event, ACTION_CONSENT_GRANTED, ACTION_CONSENT_WITHDRAWN


def require_patient_consent(db: Session, patient_profile: PatientProfile, scope: str) -> None:
    record = (db.query(Consent).filter(
        Consent.patient_id == patient_profile.id, Consent.consent_type == scope,
    ).order_by(Consent.created_at.desc()).first())
    if not record or record.status != "GRANTED" or record.version != "1.0":
        raise HTTPException(status_code=403, detail=f"Consent required: {scope}. Review your consent settings before continuing.")


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
    db.flush()
    log_audit_event(db, ACTION_CONSENT_GRANTED, "Consent", patient_profile.user_id,
              consent.id, {"scope": req.consent_type, "version": req.version})
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

    # Withdraw all active grants in this scope so an older grant cannot revive it.
    active = db.query(Consent).filter(
        Consent.patient_id == patient_profile.id,
        Consent.consent_type == consent.consent_type,
        Consent.status == "GRANTED",
    ).all()
    for record in active:
        record.status = "WITHDRAWN"
        record.withdrawn_at = datetime.now(timezone.utc)
    log_audit_event(db, ACTION_CONSENT_WITHDRAWN, "Consent", patient_profile.user_id,
              consent.id, {"scope": consent.consent_type})
    db.commit()
    db.refresh(consent)
    return consent
