from typing import Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.timeline import HealthTimelineEventResponse, PaginatedTimelineResponse
from app.services.patient_service import get_patient_profile_by_user
from app.services.timeline_service import get_patient_timeline_events, get_timeline_event_by_id

router = APIRouter()


@router.get(
    "",
    response_model=PaginatedTimelineResponse,
    summary="Get paginated, chronological health timeline events",
)
def get_timeline(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Page size limit"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    return get_patient_timeline_events(db, profile, page, page_size)


@router.get(
    "/{event_id}",
    response_model=StandardResponse,
    summary="Get single health timeline event detail",
)
def get_timeline_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    event = get_timeline_event_by_id(db, profile, event_id)
    return StandardResponse(
        success=True,
        data=HealthTimelineEventResponse.model_validate(event),
    )
