from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.consent import ConsentGrantRequest, ConsentResponse, ConsentWithdrawRequest
from app.services.consent_service import get_patient_consents, grant_consent, withdraw_consent
from app.services.patient_service import get_patient_profile_by_user

router = APIRouter()


@router.get(
    "",
    response_model=StandardResponse,
    summary="Get patient consent records",
)
def list_consent(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    consents = get_patient_consents(db, profile)
    return StandardResponse(
        success=True,
        data=[ConsentResponse.model_validate(c) for c in consents],
    )


@router.post(
    "",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record granted patient consent",
)
def post_consent(
    req: ConsentGrantRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    c = grant_consent(db, profile, req)
    return StandardResponse(
        success=True,
        data=ConsentResponse.model_validate(c),
        message="Consent granted successfully",
    )


@router.patch(
    "/{consent_id}",
    response_model=StandardResponse,
    summary="Withdraw patient consent",
)
def patch_consent(
    consent_id: str,
    req: ConsentWithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    c = withdraw_consent(db, profile, consent_id)
    return StandardResponse(
        success=True,
        data=ConsentResponse.model_validate(c),
        message="Consent withdrawn successfully",
    )
