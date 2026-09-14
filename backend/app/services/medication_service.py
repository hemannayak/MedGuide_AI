"""
Medication service for MedGuide AI.

SAFETY RULE: Medications are created with verification_status=PENDING.
A medication must NEVER be auto-promoted to VERIFIED by the API.
Verification must happen through an explicit verify_medication() call
which represents a deliberate patient (or authorized worker) confirmation.

Medication schedules may NOT be created for PENDING medications.
This prevents unverified OCR output or LLM-generated medicine names from
silently entering an active dosage schedule.
"""
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
from app.services import audit_service


def create_medication(
    db: Session,
    patient_profile: PatientProfile,
    req: MedicationCreateRequest,
) -> Medication:
    """
    Create a new medication record for a patient.

    The verification_status is always set to PENDING on creation.
    The client cannot override this — MedicationCreateRequest does not
    expose a verification_status field, and this service ignores any
    attempt to set it at the model level.
    """
    med = Medication(
        patient_id=patient_profile.id,
        prescription_id=req.prescription_id,
        medicine_name=req.medicine_name,
        dosage=req.dosage,
        route=req.route,
        instructions=req.instructions,
        verification_status="PENDING",   # Always PENDING — never auto-VERIFIED
    )
    db.add(med)
    db.flush()  # Get med.id before committing

    # Timeline event
    timeline_event = HealthTimelineEvent(
        patient_id=patient_profile.id,
        event_type="MEDICATION_CREATED",
        reference_id=med.id,
        event_time=med.created_at,
        metadata_={"medicine_name": req.medicine_name},
    )
    db.add(timeline_event)

    # Audit record — within the same transaction
    audit_service.log_audit_event(
        db=db,
        action=audit_service.ACTION_MEDICATION_CREATED,
        resource_type=audit_service.RESOURCE_MEDICATION,
        actor_user_id=patient_profile.user_id,
        resource_id=med.id,
        metadata={"verification_status": "PENDING"},
    )

    db.commit()
    db.refresh(med)
    return med


def verify_medication(
    db: Session,
    patient_profile: PatientProfile,
    medication_id: str,
) -> Medication:
    """
    Explicitly verify a PENDING medication, promoting it to VERIFIED status.

    This is the ONLY function that may set verification_status=VERIFIED.
    It represents a deliberate confirmation by the authenticated patient
    that the medication information is correct.

    Idempotent: returns the medication unchanged if already VERIFIED.
    """
    med = get_medication_by_id(db, patient_profile, medication_id)

    if med.verification_status == "VERIFIED":
        return med  # Idempotent

    med.verification_status = "VERIFIED"

    audit_service.log_audit_event(
        db=db,
        action=audit_service.ACTION_MEDICATION_VERIFIED,
        resource_type=audit_service.RESOURCE_MEDICATION,
        actor_user_id=patient_profile.user_id,
        resource_id=med.id,
        metadata={"medicine_name": med.medicine_name},
    )

    db.commit()
    db.refresh(med)
    return med


def get_patient_medications(
    db: Session,
    patient_profile: PatientProfile,
) -> List[Medication]:
    """Get all medication records for authenticated patient."""
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
    """Fetch a single medication with patient data boundary guard."""
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
    """
    Create a dosage timing schedule for a verified medication.

    SAFETY GUARD: Schedules may NOT be created for PENDING medications.
    The patient must explicitly verify the medication first via verify_medication().
    This prevents unverified OCR or LLM-generated medicine names from entering
    an active dosage schedule automatically.
    """
    med = get_medication_by_id(db, patient_profile, medication_id)

    if med.verification_status != "VERIFIED":
        audit_service.log_audit_event(
            db=db,
            action=audit_service.ACTION_MEDICATION_SCHEDULE_BLOCKED,
            resource_type=audit_service.RESOURCE_MEDICATION_SCHEDULE,
            actor_user_id=patient_profile.user_id,
            resource_id=med.id,
            metadata={
                "reason": "medication_not_verified",
                "verification_status": med.verification_status,
            },
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Cannot create a schedule for an unverified medication. "
                "Please verify the medication details first using POST /medications/{id}/verify."
            ),
        )

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
    """Get schedules for a medication belonging to the authenticated patient."""
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
    """Record a medication intake dose compliance event."""
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
    """Get adherence records for a specific schedule belonging to this patient."""
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
