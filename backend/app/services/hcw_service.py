from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.medications import Medication
from app.models.profiles import HealthcareWorkerProfile, PatientProfile
from app.models.symptoms import SymptomRecord
from app.models.timeline import Alert
from app.models.users import User
from app.schemas.healthcare_worker import PatientSummaryResponse


def get_authorized_patients(
    db: Session,
    worker_user: User,
) -> List[PatientProfile]:
    """Fetch list of patient profiles authorized for healthcare worker view."""
    return db.query(PatientProfile).all()


def get_patient_summary_for_worker(
    db: Session,
    patient_id: str,
) -> PatientSummaryResponse:
    """Generate structured patient summary for healthcare worker review."""
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    symptom_count = (
        db.query(SymptomRecord)
        .filter(SymptomRecord.patient_id == patient.id)
        .count()
    )
    med_count = (
        db.query(Medication)
        .filter(Medication.patient_id == patient.id)
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

    return PatientSummaryResponse(
        patient_id=patient.id,
        display_name=patient.display_name,
        summary_text=summary_text,
        reported_symptom_count=symptom_count,
        active_medication_count=med_count,
        open_alert_count=alert_count,
        generated_at=datetime.now(timezone.utc),
    )
