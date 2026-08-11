from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.patient import PatientProfileResponse, PatientProfileUpdateRequest
from app.services.patient_service import get_patient_profile_by_user, update_patient_profile

router = APIRouter()


@router.get(
    "/me",
    response_model=StandardResponse,
    summary="Get authenticated patient profile",
)
def get_patient_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    return StandardResponse(
        success=True,
        data=PatientProfileResponse.model_validate(profile),
    )


@router.patch(
    "/me",
    response_model=StandardResponse,
    summary="Update authenticated patient profile",
)
def update_patient_me(
    req: PatientProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    updated = update_patient_profile(db, profile, req)
    return StandardResponse(
        success=True,
        data=PatientProfileResponse.model_validate(updated),
        message="Patient profile updated successfully",
    )
