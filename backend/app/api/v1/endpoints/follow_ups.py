from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profiles import HealthcareWorkerProfile
from app.models.timeline import FollowUp
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.follow_up import FollowUpCreateRequest, FollowUpResponse, FollowUpUpdateRequest

router = APIRouter()


@router.post(
    "",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create care follow-up record",
)
def create_followup(
    req: FollowUpCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    followups = db.query(FollowUp).all()
    return StandardResponse(
        success=True,
        data=[FollowUpResponse.model_validate(f) for f in followups],
    )
