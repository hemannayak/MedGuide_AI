from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.medications import Medication, MedicationAdherence, MedicationSchedule
from app.models.profiles import PatientProfile
from app.models.timeline import HealthTimelineEvent
from app.schemas.medication import (
    MedicationAdherenceRecordRequest,
    MedicationCreateRequest,
    MedicationScheduleCreateRequest,
)


def create_medication(
    db: Session,
    patient_profile: PatientProfile,
    req: MedicationCreateRequest,
) -> Medication:
    """Create a new medication record for patient."""
    med = Medication(
        patient_id=patient_profile.id,
        prescription_id=req.prescription_id,
        medicine_name=req.medicine_name,
        dosage=req.dosage,
        route=req.route,
        instructions=req.instructions,
        verification_status="VERIFIED",
    )
    db.add(med)
    db.commit()
    db.refresh(med)

    # Log timeline event
    timeline_event = HealthTimelineEvent(
        patient_id=patient_profile.id,
        event_type="MEDICATION_CREATED",
        reference_id=med.id,
        event_time=med.created_at,
        metadata_={"medicine_name": req.medicine_name},
    )
    db.add(timeline_event)
    db.commit()

    return med


def get_patient_medications(
    db: Session,
    patient_profile: PatientProfile,
) -> List[Medication]:
    """Get all active medications for authenticated patient."""
    return (
        db.query(Medication)
        .filter(Medication.patient_id == patient_profile.id)
        .all()
    )


def get_medication_by_id(
    db: Session,
    patient_profile: PatientProfile,
    medication_id: str,
) -> Medication:
    """Fetch single medication detail with patient data boundary guard."""
    med = (
        db.query(Medication)
        .filter(
            Medication.id == medication_id,
            Medication.patient_id == patient_profile.id,
        )
        .first()
    )
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found or unauthorized access",
        )
    return med


def create_medication_schedule(
    db: Session,
    patient_profile: PatientProfile,
    medication_id: str,
    req: MedicationScheduleCreateRequest,
) -> MedicationSchedule:
    """Create dosage timing schedule for a medication."""
    med = get_medication_by_id(db, patient_profile, medication_id)

    sched = MedicationSchedule(
        medication_id=med.id,
        frequency=req.frequency,
        schedule_data=req.schedule_data,
        start_date=req.start_date,
        end_date=req.end_date,
        timezone=req.timezone,
        status="ACTIVE",
    )
    db.add(sched)
    db.commit()
    db.refresh(sched)

    return sched


def get_schedules_for_medication(
    db: Session,
    patient_profile: PatientProfile,
    medication_id: str,
) -> List[MedicationSchedule]:
    """Get schedules for a specific medication belonging to patient."""
    med = get_medication_by_id(db, patient_profile, medication_id)
    return (
        db.query(MedicationSchedule)
        .filter(MedicationSchedule.medication_id == med.id)
        .all()
    )


def record_medication_adherence(
    db: Session,
    patient_profile: PatientProfile,
    schedule_id: str,
    req: MedicationAdherenceRecordRequest,
) -> MedicationAdherence:
    """Record medication intake dose compliance event."""
    sched = (
        db.query(MedicationSchedule)
        .join(Medication)
        .filter(
            MedicationSchedule.id == schedule_id,
            Medication.patient_id == patient_profile.id,
        )
        .first()
    )
    if not sched:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication schedule not found or unauthorized access",
        )

    adherence = MedicationAdherence(
        medication_schedule_id=sched.id,
        scheduled_at=req.scheduled_at,
        recorded_at=datetime.now(timezone.utc),
        status=req.status,
        source=req.source,
    )
    db.add(adherence)
    db.commit()
    db.refresh(adherence)

    # Automatically record timeline event
    timeline_event = HealthTimelineEvent(
        patient_id=patient_profile.id,
        event_type="MEDICATION_TAKEN" if req.status == "TAKEN" else "MEDICATION_MISSED",
        reference_id=adherence.id,
        event_time=adherence.recorded_at,
        metadata_={"status": req.status, "medicine_name": sched.medication.medicine_name},
    )
    db.add(timeline_event)
    db.commit()

    return adherence


def get_adherence_records_for_schedule(
    db: Session,
    patient_profile: PatientProfile,
    schedule_id: str,
) -> List[MedicationAdherence]:
    """Get adherence records for a specific schedule."""
    sched = (
        db.query(MedicationSchedule)
        .join(Medication)
        .filter(
            MedicationSchedule.id == schedule_id,
            Medication.patient_id == patient_profile.id,
        )
        .first()
    )
    if not sched:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication schedule not found or unauthorized access",
        )

    return (
        db.query(MedicationAdherence)
        .filter(MedicationAdherence.medication_schedule_id == sched.id)
        .order_by(MedicationAdherence.recorded_at.desc())
        .all()
    )
