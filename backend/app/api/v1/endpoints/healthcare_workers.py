"""
Healthcare worker API endpoints for MedGuide AI.

Every patient-data endpoint enforces worker→patient authorization through
hcw_service / access_service before returning any information.

Administrators grant access to named workers. Workers may relinquish their
own access; administrators may revoke a named worker relationship.
"""
import uuid
from typing import Any

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.healthcare_worker import PatientSummaryResponse
from app.schemas.patient import PatientProfileResponse
from app.services.hcw_service import get_authorized_patients, get_patient_summary_for_worker
from app.services.access_service import grant_worker_patient_access, revoke_worker_patient_access

router = APIRouter()


@router.get("/patients/{patient_id}/records", response_model=StandardResponse,
            summary="Review records for an explicitly authorized patient")
def patient_records(patient_id: uuid.UUID,
                    current_user: User = Depends(require_roles(["HEALTHCARE_WORKER"])),
                    db: Session = Depends(get_db)):
    from app.services.access_service import require_patient_access
    from app.services.medication_service import get_patient_medications
    from app.services.prescription_service import list_patient_prescriptions
    from app.services.alert_service import get_patient_alerts
    from app.schemas.medication import MedicationResponse
    from app.schemas.alert import AlertResponse
    from app.models.profiles import PatientProfile
    from app.models.symptoms import SymptomRecord
    require_patient_access(db, current_user, patient_id)
    patient = db.get(PatientProfile, patient_id)
    summary = get_patient_summary_for_worker(db, current_user, str(patient_id))
    symptoms = db.query(SymptomRecord).filter(SymptomRecord.patient_id == patient_id).order_by(SymptomRecord.reported_at.desc()).limit(50).all()
    return StandardResponse(success=True, data={
        "profile": PatientProfileResponse.model_validate(patient), "summary": summary,
        "symptoms": [{"id": s.id, "text": s.structured_data.get("text", ""), "language": s.structured_data.get("language", "en"), "reported_at": s.reported_at} for s in symptoms],
        "medications": [MedicationResponse.model_validate(m) for m in get_patient_medications(db, patient)],
        "prescriptions": list_patient_prescriptions(db, patient),
        "alerts": [AlertResponse.model_validate(a) for a in get_patient_alerts(db, patient)],
    })


@router.post("/patients/{patient_id}/medications/{medication_id}/verify", response_model=StandardResponse,
             summary="Authorized worker confirms extracted medication details")
def confirm_medication(patient_id: uuid.UUID, medication_id: uuid.UUID,
                       current_user: User = Depends(require_roles(["HEALTHCARE_WORKER"])),
                       db: Session = Depends(get_db)):
    from app.services.access_service import require_patient_access
    from app.services.medication_service import verify_medication
    from app.models.profiles import PatientProfile
    from app.schemas.medication import MedicationResponse
    require_patient_access(db, current_user, patient_id)
    medication = verify_medication(db, db.get(PatientProfile, patient_id), str(medication_id), actor_user_id=current_user.id)
    return StandardResponse(success=True, data=MedicationResponse.model_validate(medication))


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
    summary="Administrator grants a named worker access to a patient",
)
def grant_access(
    patient_id: str,
    worker_user_id: uuid.UUID,
    current_user: User = Depends(require_roles(["ADMIN"])),
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
        raise HTTPException(status_code=422, detail="Invalid patient ID format.")

    worker = db.query(User).filter(User.id == worker_user_id, User.status == "ACTIVE").first()
    if not worker or worker.role.name != "HEALTHCARE_WORKER":
        raise HTTPException(status_code=404, detail="Active healthcare worker not found")
    access = grant_worker_patient_access(db, worker, patient_uuid, actor_user_id=current_user.id)
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
    worker_user_id: uuid.UUID | None = None,
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
        raise HTTPException(status_code=422, detail="Invalid patient ID format.")

    worker = current_user
    if current_user.role.name == "ADMIN":
        if worker_user_id is None:
            raise HTTPException(status_code=422, detail="Specify the worker account to revoke")
        worker = db.get(User, worker_user_id)
        if not worker or worker.role.name != "HEALTHCARE_WORKER":
            raise HTTPException(status_code=404, detail="Healthcare worker not found")
    elif worker_user_id is not None and worker_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Workers may only revoke their own access")
    revoke_worker_patient_access(db, worker, patient_uuid, actor_user_id=current_user.id)
    return StandardResponse(
        success=True,
        data=None,
        message="Patient access revoked successfully.",
    )
