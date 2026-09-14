"""
Healthcare worker API endpoints for MedGuide AI.

Every patient-data endpoint enforces worker→patient authorization through
hcw_service / access_service before returning any information.

Access management (grant/revoke) is exposed here for ADMIN or the worker
themselves to manage their patient relationships.
"""
import uuid
from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.healthcare_worker import PatientSummaryResponse
from app.schemas.patient import PatientProfileResponse
from app.services.hcw_service import get_authorized_patients, get_patient_summary_for_worker
from app.services.access_service import grant_worker_patient_access, revoke_worker_patient_access

router = APIRouter()


@router.get(
    "/patients",
    response_model=StandardResponse,
    summary="List patients authorized for this healthcare worker",
)
def list_patients(
    current_user: User = Depends(require_roles(["HEALTHCARE_WORKER", "ADMIN"])),
    db: Session = Depends(get_db),
) -> Any:
    """Return only patients the authenticated worker has ACTIVE access to."""
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
    """
    Return a structured patient summary.

    Returns HTTP 403 if the worker does not have ACTIVE access to this patient.
    The worker_user is passed to the service so authorization is enforced
    server-side — the patient_id in the URL is never trusted implicitly.
    """
    summary = get_patient_summary_for_worker(db, current_user, patient_id)
    return StandardResponse(
        success=True,
        data=summary,
    )


@router.post(
    "/patients/{patient_id}/access",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Grant worker access to a patient (admin or self-registration)",
)
def grant_access(
    patient_id: str,
    current_user: User = Depends(require_roles(["HEALTHCARE_WORKER", "ADMIN"])),
    db: Session = Depends(get_db),
) -> Any:
    """
    Create an ACTIVE PatientWorkerAccess grant for this worker → patient pair.

    Idempotent: if ACTIVE grant already exists, returns it unchanged.
    If a REVOKED grant exists, it is reactivated.
    """
    try:
        patient_uuid = uuid.UUID(patient_id)
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="Invalid patient ID format.")

    access = grant_worker_patient_access(db, current_user, patient_uuid)
    return StandardResponse(
        success=True,
        data={
            "access_id": str(access.id),
            "patient_profile_id": str(access.patient_profile_id),
            "status": access.status,
            "granted_at": access.granted_at.isoformat() if access.granted_at else None,
        },
        message="Patient access granted successfully.",
    )


@router.delete(
    "/patients/{patient_id}/access",
    response_model=StandardResponse,
    summary="Revoke worker access to a patient",
)
def revoke_access(
    patient_id: str,
    current_user: User = Depends(require_roles(["HEALTHCARE_WORKER", "ADMIN"])),
    db: Session = Depends(get_db),
) -> Any:
    """
    Revoke an ACTIVE PatientWorkerAccess grant. Idempotent if already revoked.
    The access record is retained for audit purposes — not deleted.
    """
    try:
        patient_uuid = uuid.UUID(patient_id)
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="Invalid patient ID format.")

    revoke_worker_patient_access(db, current_user, patient_uuid)
    return StandardResponse(
        success=True,
        data=None,
        message="Patient access revoked successfully.",
    )
