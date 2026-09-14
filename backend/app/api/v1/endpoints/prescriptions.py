import uuid
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.users import User
from app.schemas.auth import StandardResponse
from app.schemas.prescription import (
    PrescriptionDetailResponse,
    PrescriptionSummaryResponse,
    PrescriptionUploadResponse,
)
from app.services.patient_service import get_patient_profile_by_user
from app.services.prescription_service import (
    get_prescription_detail,
    list_patient_prescriptions,
    process_prescription_upload,
)

router = APIRouter()


@router.post(
    "/upload",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload prescription image/PDF and run OCR extraction",
    description="Securely upload prescription image, run OCR gateway, and extract medication candidates as PENDING verification.",
)
async def upload_prescription(
    file: UploadFile = File(..., description="Prescription image or PDF file (Max 10MB)"),
    prescribed_date: Optional[date] = Form(None, description="Optional date on prescription"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StandardResponse:
    profile = get_patient_profile_by_user(db, current_user)
    upload_result = await process_prescription_upload(
        db=db,
        patient=profile,
        file=file,
        prescribed_date=prescribed_date,
    )
    return StandardResponse(
        success=True,
        data=upload_result.model_dump(mode="json"),
        message="Prescription uploaded and processed. Extracted medications require human verification.",
    )


@router.get(
    "",
    response_model=StandardResponse,
    summary="List patient prescription records",
    description="Retrieve list of all uploaded prescriptions for the authenticated patient.",
)
def list_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StandardResponse:
    profile = get_patient_profile_by_user(db, current_user)
    prescriptions = list_patient_prescriptions(db, profile)
    return StandardResponse(
        success=True,
        data=[p.model_dump(mode="json") for p in prescriptions],
    )


@router.get(
    "/{prescription_id}",
    response_model=StandardResponse,
    summary="Get single prescription detail",
    description="Retrieve full details of a prescription including image metadata, OCR text, and extracted medications.",
)
def get_prescription(
    prescription_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StandardResponse:
    profile = get_patient_profile_by_user(db, current_user)
    detail = get_prescription_detail(db, profile, prescription_id)
    return StandardResponse(
        success=True,
        data=detail.model_dump(mode="json"),
    )
