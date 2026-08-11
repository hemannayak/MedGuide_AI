from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.healthcare_worker import PatientSummaryResponse
from app.schemas.patient import PatientProfileResponse
from app.services.hcw_service import get_authorized_patients, get_patient_summary_for_worker

router = APIRouter()


@router.get(
    "/patients",
    response_model=StandardResponse,
    summary="List authorized patients for healthcare worker view",
)
def list_patients(
    current_user: User = Depends(require_roles(["HEALTHCARE_WORKER", "ADMIN"])),
    db: Session = Depends(get_db),
) -> Any:
    patients = get_authorized_patients(db, current_user)
    return StandardResponse(
        success=True,
        data=[PatientProfileResponse.model_validate(p) for p in patients],
    )


@router.get(
    "/patients/{patient_id}/summary",
    response_model=StandardResponse,
    summary="Get clinical summary for authorized patient",
)
def get_patient_summary(
    patient_id: str,
    current_user: User = Depends(require_roles(["HEALTHCARE_WORKER", "ADMIN"])),
    db: Session = Depends(get_db),
) -> Any:
    summary = get_patient_summary_for_worker(db, patient_id)
    return StandardResponse(
        success=True,
        data=summary,
    )
