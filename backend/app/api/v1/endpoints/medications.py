from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Body, Depends, HTTPException, status
from app.schemas.medication_correction import MedicationCorrection, MedicationVerificationRevision
from app.services.audit_service import log_audit_event
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.medication import (
    MedicationAdherenceRecordRequest,
    MedicationAdherenceResponse,
    MedicationCreateRequest,
    MedicationResponse,
    MedicationScheduleCreateRequest,
    MedicationScheduleResponse,
)
from app.services.medication_service import (
    create_medication,
    create_medication_schedule,
    get_adherence_records_for_schedule,
    get_medication_by_id,
    get_patient_medications,
    get_schedules_for_medication,
    record_medication_adherence,
    verify_medication,
)
from app.services.patient_service import get_patient_profile_by_user

router = APIRouter()


@router.patch('/{medication_id}/ocr-correction', response_model=StandardResponse,
              summary='Correct owned pending OCR medication without verifying or scheduling')
def correct_ocr_medication(medication_id: UUID, req: MedicationCorrection,
                           current_user: User = Depends(get_current_user),
                           db: Session = Depends(get_db)):
    profile = get_patient_profile_by_user(db, current_user)
    med = get_medication_by_id(db, profile, medication_id)
    db.refresh(med, with_for_update=True)
    if not req.checked_original:
        raise HTTPException(422, 'Compare corrections with the original prescription first.')
    if med.verification_status != 'PENDING' or med.prescription_id is None:
        raise HTTPException(409, 'Only pending prescription extraction can be corrected here.')
    med.medicine_name = req.medicine_name
    med.dosage = req.dosage
    med.instructions = req.instructions
    log_audit_event(db, action='MEDICATION_OCR_CORRECTED', resource_type='MEDICATION',
                    actor_user_id=current_user.id, resource_id=med.id,
                    metadata={'verification_status': 'PENDING'})
    db.commit()
    db.refresh(med)
    return StandardResponse(success=True, data=MedicationResponse.model_validate(med))


@router.post(
    "",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create verified patient medication",
)
def create_med(
    req: MedicationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    med = create_medication(db, profile, req)
    return StandardResponse(
        success=True,
        data=MedicationResponse.model_validate(med),
        message="Medication created successfully",
    )


@router.get(
    "",
    response_model=StandardResponse,
    summary="List patient active medications",
)
def list_meds(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    meds = get_patient_medications(db, profile)
    return StandardResponse(
        success=True,
        data=[MedicationResponse.model_validate(m) for m in meds],
    )


@router.get(
    "/{medication_id}",
    response_model=StandardResponse,
    summary="Get single medication detail",
)
def get_med_detail(
    medication_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    med = get_medication_by_id(db, profile, medication_id)
    return StandardResponse(
        success=True,
        data=MedicationResponse.model_validate(med),
    )


@router.post(
    "/{medication_id}/verify",
    response_model=StandardResponse,
    summary="Explicitly verify a PENDING medication (Patient or Authorized Caregiver)",
)
def verify_med(
    medication_id: str,
    revision: MedicationVerificationRevision | None = Body(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    med = verify_medication(db, profile, medication_id, expected_updated_at=revision.expected_updated_at if revision else None)
    return StandardResponse(
        success=True,
        data=MedicationResponse.model_validate(med),
        message="Medication successfully verified and approved for active scheduling",
    )


@router.post(
    "/{medication_id}/schedules",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create dosage schedule for medication",
)
def create_schedule(
    medication_id: str,
    req: MedicationScheduleCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    sched = create_medication_schedule(db, profile, medication_id, req)
    return StandardResponse(
        success=True,
        data=MedicationScheduleResponse.model_validate(sched),
        message="Medication schedule created successfully",
    )


@router.get(
    "/{medication_id}/schedules",
    response_model=StandardResponse,
    summary="Get dosage schedules for medication",
)
def list_schedules(
    medication_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    schedules = get_schedules_for_medication(db, profile, medication_id)
    return StandardResponse(
        success=True,
        data=[MedicationScheduleResponse.model_validate(s) for s in schedules],
    )


@router.post(
    "/schedules/{schedule_id}/adherence",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record medication intake dose compliance event",
)
def record_adherence(
    schedule_id: str,
    req: MedicationAdherenceRecordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    adherence = record_medication_adherence(db, profile, schedule_id, req)
    return StandardResponse(
        success=True,
        data=MedicationAdherenceResponse.model_validate(adherence),
        message="Medication adherence recorded successfully",
    )


@router.get(
    "/schedules/{schedule_id}/adherence",
    response_model=StandardResponse,
    summary="Get medication adherence intake logs for schedule",
)
def list_adherence(
    schedule_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    records = get_adherence_records_for_schedule(db, profile, schedule_id)
    return StandardResponse(
        success=True,
        data=[MedicationAdherenceResponse.model_validate(r) for r in records],
    )
