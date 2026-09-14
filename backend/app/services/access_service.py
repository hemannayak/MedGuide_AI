"""
Patient–worker access authorization service for MedGuide AI.

Provides the sole authority for determining whether a healthcare worker
is authorized to access a specific patient's information. All HCW
patient-data operations must pass through this service before proceeding.

Design rules:
- A healthcare worker ONLY has access to patients with an ACTIVE access record.
- Access is revocable; revoked records are retained for audit purposes.
- Duplicate grant attempts are idempotent — they return the existing record.
- No service outside this module should query patient_worker_accesses directly.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.access import PatientWorkerAccess
from app.models.profiles import HealthcareWorkerProfile, PatientProfile
from app.models.users import User
from app.services import audit_service


def _get_worker_profile(db: Session, worker_user: User) -> HealthcareWorkerProfile:
    """Fetch the HealthcareWorkerProfile for an authenticated worker user."""
    profile = (
        db.query(HealthcareWorkerProfile)
        .filter(HealthcareWorkerProfile.user_id == worker_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Healthcare worker profile not found for this account.",
        )
    return profile


def is_patient_accessible_by_worker(
    db: Session,
    worker_user: User,
    patient_profile_id: uuid.UUID,
) -> bool:
    """
    Return True if an ACTIVE access grant exists for this worker → patient pair.

    Does NOT raise — callers decide whether to raise 403 or return False.
    """
    worker_profile = _get_worker_profile(db, worker_user)
    record = (
        db.query(PatientWorkerAccess)
        .filter(
            PatientWorkerAccess.healthcare_worker_profile_id == worker_profile.id,
            PatientWorkerAccess.patient_profile_id == patient_profile_id,
            PatientWorkerAccess.status == "ACTIVE",
        )
        .first()
    )
    return record is not None


def require_patient_access(
    db: Session,
    worker_user: User,
    patient_profile_id: uuid.UUID,
) -> None:
    """
    Raise HTTP 403 if the worker does not have ACTIVE access to this patient.

    Use this at the top of any HCW endpoint that works with a specific patient.
    """
    if not is_patient_accessible_by_worker(db, worker_user, patient_profile_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You are not authorized to access this patient's information.",
        )


def get_authorized_patients(
    db: Session,
    worker_user: User,
) -> List[PatientProfile]:
    """
    Return only the PatientProfile records that this worker is authorized to access.

    Replaces the previous stub that returned all patients.
    """
    worker_profile = _get_worker_profile(db, worker_user)

    authorized = (
        db.query(PatientProfile)
        .join(
            PatientWorkerAccess,
            PatientWorkerAccess.patient_profile_id == PatientProfile.id,
        )
        .filter(
            PatientWorkerAccess.healthcare_worker_profile_id == worker_profile.id,
            PatientWorkerAccess.status == "ACTIVE",
        )
        .all()
    )
    return authorized


def grant_worker_patient_access(
    db: Session,
    worker_user: User,
    patient_profile_id: uuid.UUID,
) -> PatientWorkerAccess:
    """
    Create or reactivate an access grant for a worker → patient relationship.

    Idempotent: if an ACTIVE grant already exists, it is returned unchanged.
    If a REVOKED grant exists, it is reactivated rather than creating a duplicate.
    The UniqueConstraint prevents duplicate rows at the database level.
    """
    worker_profile = _get_worker_profile(db, worker_user)

    # Verify patient exists
    patient = db.query(PatientProfile).filter(
        PatientProfile.id == patient_profile_id
    ).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )

    # Check for existing record (active or revoked)
    existing = (
        db.query(PatientWorkerAccess)
        .filter(
            PatientWorkerAccess.healthcare_worker_profile_id == worker_profile.id,
            PatientWorkerAccess.patient_profile_id == patient_profile_id,
        )
        .first()
    )

    if existing:
        if existing.status == "ACTIVE":
            return existing  # Idempotent — already granted
        # Reactivate revoked record
        existing.status = "ACTIVE"
        existing.granted_at = datetime.now(timezone.utc)
        existing.revoked_at = None
        db.commit()
        db.refresh(existing)
        audit_service.log_audit_event(
            db=db,
            action=audit_service.ACTION_WORKER_ACCESS_GRANTED,
            resource_type=audit_service.RESOURCE_WORKER_ACCESS,
            actor_user_id=worker_user.id,
            resource_id=existing.id,
            metadata={"patient_profile_id": str(patient_profile_id), "reactivated": True},
        )
        db.commit()
        return existing

    # Create new grant
    access = PatientWorkerAccess(
        healthcare_worker_profile_id=worker_profile.id,
        patient_profile_id=patient_profile_id,
        status="ACTIVE",
        granted_at=datetime.now(timezone.utc),
    )
    db.add(access)
    db.flush()  # Get access.id without committing

    audit_service.log_audit_event(
        db=db,
        action=audit_service.ACTION_WORKER_ACCESS_GRANTED,
        resource_type=audit_service.RESOURCE_WORKER_ACCESS,
        actor_user_id=worker_user.id,
        resource_id=access.id,
        metadata={"patient_profile_id": str(patient_profile_id)},
    )
    db.commit()
    db.refresh(access)
    return access


def revoke_worker_patient_access(
    db: Session,
    worker_user: User,
    patient_profile_id: uuid.UUID,
) -> None:
    """
    Revoke an existing ACTIVE access grant. Idempotent if already revoked.
    """
    worker_profile = _get_worker_profile(db, worker_user)

    existing = (
        db.query(PatientWorkerAccess)
        .filter(
            PatientWorkerAccess.healthcare_worker_profile_id == worker_profile.id,
            PatientWorkerAccess.patient_profile_id == patient_profile_id,
            PatientWorkerAccess.status == "ACTIVE",
        )
        .first()
    )

    if not existing:
        return  # Idempotent — already revoked or never granted

    existing.status = "REVOKED"
    existing.revoked_at = datetime.now(timezone.utc)

    audit_service.log_audit_event(
        db=db,
        action=audit_service.ACTION_WORKER_ACCESS_REVOKED,
        resource_type=audit_service.RESOURCE_WORKER_ACCESS,
        actor_user_id=worker_user.id,
        resource_id=existing.id,
        metadata={"patient_profile_id": str(patient_profile_id)},
    )
    db.commit()
