from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.profiles import PatientProfile
from app.models.timeline import HealthTimelineEvent
from app.schemas.timeline import HealthTimelineEventResponse, PaginatedTimelineResponse, PaginationMeta


def get_patient_timeline_events(
    db: Session,
    patient_profile: PatientProfile,
    page: int = 1,
    page_size: int = 20,
) -> PaginatedTimelineResponse:
    """Fetch paginated, chronological health timeline events for patient."""
    query = (
        db.query(HealthTimelineEvent)
        .filter(HealthTimelineEvent.patient_id == patient_profile.id)
        .order_by(HealthTimelineEvent.event_time.desc())
    )

    total = query.count()
    offset = (page - 1) * page_size
    events = query.offset(offset).limit(page_size).all()

    return PaginatedTimelineResponse(
        success=True,
        data=events,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
        ),
    )


def get_timeline_event_by_id(
    db: Session,
    patient_profile: PatientProfile,
    event_id: str,
) -> HealthTimelineEvent:
    """Fetch single timeline event with patient data boundary guard."""
    event = (
        db.query(HealthTimelineEvent)
        .filter(
            HealthTimelineEvent.id == event_id,
            HealthTimelineEvent.patient_id == patient_profile.id,
        )
        .first()
    )
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timeline event not found or unauthorized access",
        )
    return event
