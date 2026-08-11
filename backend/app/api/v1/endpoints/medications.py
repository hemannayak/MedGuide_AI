from typing import Any, List
from fastapi import APIRouter, Depends, status
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
)
from app.services.patient_service import get_patient_profile_by_user

router = APIRouter()


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
