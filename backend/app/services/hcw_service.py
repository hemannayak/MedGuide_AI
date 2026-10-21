"""
Healthcare worker service for MedGuide AI.

All patient data access through this service enforces explicit worker→patient
authorization via access_service. No patient information is returned without
first verifying that an ACTIVE PatientWorkerAccess grant exists.

Audit records are written for every patient data access event.
"""
from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.medications import Medication, MedicationSchedule
from app.models.profiles import PatientProfile
from app.models.symptoms import SymptomRecord
from app.models.timeline import Alert
from app.models.users import User
from app.schemas.healthcare_worker import PatientSummaryResponse
from app.services import audit_service
from app.services.access_service import get_authorized_patients as _get_authorized, require_patient_access


def get_authorized_patients(
    db: Session,
    worker_user: User,
) -> List[PatientProfile]:
    """
    Return only patients this worker is explicitly authorized to access.

    Previously returned all patients — that stub is replaced here.
    """
    patients = _get_authorized(db, worker_user)

    audit_service.log_audit_event(
        db=db,
        action=audit_service.ACTION_PATIENT_LIST_ACCESSED,
        resource_type=audit_service.RESOURCE_PATIENT,
        actor_user_id=worker_user.id,
        metadata={"authorized_count": len(patients)},
    )
    db.commit()

    return patients


def get_patient_summary_for_worker(
    db: Session,
    worker_user: User,
    patient_id: str,
) -> PatientSummaryResponse:
    """
    Generate structured patient summary for an authorized healthcare worker.

    Raises HTTP 403 if the worker does not have ACTIVE access to this patient.
    Raises HTTP 404 if the patient does not exist.
    """
    import uuid as _uuid
    try:
        patient_uuid = _uuid.UUID(patient_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid patient ID format.",
        )

    # Authorization check BEFORE any data retrieval
    require_patient_access(db, worker_user, patient_uuid)

    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_uuid).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )

    symptom_count = (
        db.query(SymptomRecord)
        .filter(SymptomRecord.patient_id == patient.id)
        .count()
    )
    med_count = (
        db.query(Medication)
        .join(MedicationSchedule)
        .filter(Medication.patient_id == patient.id, Medication.verification_status == "VERIFIED", MedicationSchedule.status == "ACTIVE")
        .distinct()
        .count()
    )
    alert_count = (
        db.query(Alert)
        .filter(Alert.patient_id == patient.id, Alert.status == "OPEN")
        .count()
    )

    summary_text = (
        f"Patient {patient.display_name} (Language: {patient.preferred_language}). "
        f"Recorded Symptoms: {symptom_count}, Active Medications: {med_count}, Open Alerts: {alert_count}."
    )

    # Audit: record WHO accessed WHICH patient, not the health content itself
    audit_service.log_audit_event(
        db=db,
        action=audit_service.ACTION_PATIENT_ACCESSED,
        resource_type=audit_service.RESOURCE_PATIENT,
        actor_user_id=worker_user.id,
        resource_id=patient.id,
        metadata={"access_type": "summary"},
    )
    db.commit()

    return PatientSummaryResponse(
        patient_id=patient.id,
        display_name=patient.display_name,
        summary_text=summary_text,
        reported_symptom_count=symptom_count,
        active_medication_count=med_count,
        open_alert_count=alert_count,
        generated_at=datetime.now(timezone.utc),
    )
