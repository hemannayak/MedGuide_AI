from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.users import User
from app.schemas.alert import AlertResponse, AlertUpdateRequest
from app.schemas.auth import StandardResponse
from app.services.alert_service import get_alert_by_id, get_patient_alerts, update_alert_status
from app.services.patient_service import get_patient_profile_by_user

router = APIRouter()


@router.get(
    "",
    response_model=StandardResponse,
    summary="Get safety alerts for patient",
)
def list_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    alerts = get_patient_alerts(db, profile)
    return StandardResponse(
        success=True,
        data=[AlertResponse.model_validate(a) for a in alerts],
    )


@router.get(
    "/{alert_id}",
    response_model=StandardResponse,
    summary="Get single safety alert detail",
)
def get_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    alert = get_alert_by_id(db, profile, alert_id)
    return StandardResponse(
        success=True,
        data=AlertResponse.model_validate(alert),
    )


@router.patch(
    "/{alert_id}",
    response_model=StandardResponse,
    summary="Acknowledge or resolve safety alert",
)
def patch_alert(
    alert_id: str,
    req: AlertUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    alert = update_alert_status(db, alert_id, req.status)
    return StandardResponse(
        success=True,
        data=AlertResponse.model_validate(alert),
        message=f"Alert status updated to {req.status}",
    )
