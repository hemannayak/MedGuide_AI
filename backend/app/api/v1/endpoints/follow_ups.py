from typing import Any, Optional
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.models.profiles import HealthcareWorkerProfile
from app.models.timeline import FollowUp
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.follow_up import FollowUpCreateRequest, FollowUpResponse, FollowUpUpdateRequest
from app.services.access_service import require_patient_access, get_authorized_patients
from app.services.patient_service import get_patient_profile_by_user
from app.services.audit_service import log_audit_event

router = APIRouter()


@router.post(
    "",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create care follow-up record",
)
def create_followup(
    req: FollowUpCreateRequest,
    current_user: User = Depends(require_roles(["HEALTHCARE_WORKER"])),
    db: Session = Depends(get_db),
) -> Any:
    require_patient_access(db, current_user, req.patient_id)
    if req.scheduled_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=422, detail="Choose a future follow-up time")
    worker_profile = (
        db.query(HealthcareWorkerProfile)
        .filter(HealthcareWorkerProfile.user_id == current_user.id)
        .first()
    )

    followup = FollowUp(
        patient_id=req.patient_id,
        healthcare_worker_id=worker_profile.id if worker_profile else None,
        reason=req.reason,
        scheduled_at=req.scheduled_at,
        notes=req.notes,
        status="PENDING",
    )
    db.add(followup)
    db.flush()
    log_audit_event(db, action="FOLLOW_UP_CREATED", resource_type="FOLLOW_UP", actor_user_id=current_user.id, resource_id=followup.id)
    db.commit()
    db.refresh(followup)

    return StandardResponse(
        success=True,
        data=FollowUpResponse.model_validate(followup),
        message="Follow-up created successfully",
    )


@router.get(
    "",
    response_model=StandardResponse,
    summary="List care follow-ups",
)
def list_followups(
    patient_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    if current_user.role.name == "PATIENT":
        allowed = [get_patient_profile_by_user(db, current_user).id]
    elif current_user.role.name == "HEALTHCARE_WORKER":
        allowed = [p.id for p in get_authorized_patients(db, current_user)]
    else:
        raise HTTPException(status_code=403, detail="Patient or healthcare worker account required")
    if patient_id and patient_id not in allowed:
        raise HTTPException(status_code=403, detail="Patient access denied")
    query = db.query(FollowUp).filter(FollowUp.patient_id.in_(allowed))
    if patient_id:
        query = query.filter(FollowUp.patient_id == patient_id)
    followups = query.order_by(FollowUp.scheduled_at).all()
    return StandardResponse(
        success=True,
        data=[FollowUpResponse.model_validate(f) for f in followups],
    )


@router.patch("/{followup_id}", response_model=StandardResponse, summary="Update an authorized patient's follow-up")
def update_followup(
    followup_id: uuid.UUID, req: FollowUpUpdateRequest,
    current_user: User = Depends(require_roles(["HEALTHCARE_WORKER"])),
    db: Session = Depends(get_db),
):
    followup = db.get(FollowUp, followup_id)
    if not followup:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    require_patient_access(db, current_user, followup.patient_id)
    for field, value in req.model_dump(exclude_unset=True).items():
        if field == "status" and value is None:
            raise HTTPException(status_code=422, detail="Status cannot be null")
        setattr(followup, field, value)
    log_audit_event(db, action="FOLLOW_UP_UPDATED", resource_type="FOLLOW_UP", actor_user_id=current_user.id, resource_id=followup.id)
    db.commit()
    db.refresh(followup)
    return StandardResponse(success=True, data=FollowUpResponse.model_validate(followup))
