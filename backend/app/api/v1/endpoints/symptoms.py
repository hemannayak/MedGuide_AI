from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.symptom import SymptomAnalyzeRequest, SymptomSubmitRequest
from app.services.patient_service import get_patient_profile_by_user
from app.services.symptom_service import analyze_symptom_record, record_patient_symptom

router = APIRouter()


@router.post(
    "",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit patient symptom narrative input",
)
def submit_symptoms(
    req: SymptomSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    res = record_patient_symptom(db, profile, req)
    return StandardResponse(
        success=True,
        data=res,
        message="Symptoms recorded successfully",
    )


@router.post(
    "/analyze",
    response_model=StandardResponse,
    summary="Execute deterministic safety triage analysis on recorded symptoms",
)
def analyze_symptoms(
    req: SymptomAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    res = analyze_symptom_record(db, profile, str(req.symptom_record_id))
    return StandardResponse(
        success=True,
        data=res,
        message="Symptom triage completed",
    )
