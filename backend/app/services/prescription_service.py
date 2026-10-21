import hashlib
import os
import uuid
from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.medications import Medication
from app.models.prescriptions import OCRResult, Prescription, PrescriptionImage
from app.models.profiles import PatientProfile
from app.models.timeline import HealthTimelineEvent
from app.schemas.prescription import (
    ExtractedMedicationCandidate,
    PrescriptionDetailResponse,
    PrescriptionImageResponse,
    PrescriptionSummaryResponse,
    PrescriptionUploadResponse,
    OCRResultResponse,
)
from app.services import audit_service
from app.services.ocr_service import create_ocr_gateway, extract_medication_entities, OCRError

# Allowed MIME types and max size
ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "uploads",
    "prescriptions",
)


def _ensure_upload_dir() -> str:
    """Ensure upload directory exists."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    return UPLOAD_DIR


async def process_prescription_upload(
    db: Session,
    patient: PatientProfile,
    file: UploadFile,
    prescribed_date: Optional[date] = None,
) -> PrescriptionUploadResponse:
    """
    Process prescription file upload, store securely, execute OCR, and create PENDING medications.
    """
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No prescription file uploaded.",
        )

    # 1. MIME Validation
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{content_type}'. Allowed types: JPEG, PNG, WEBP, PDF.",
        )

    content = await file.read(MAX_FILE_SIZE + 1)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded prescription file is empty.",
        )

    # 2. File Size Validation
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({len(content)} bytes) exceeds the 10MB limit.",
        )

    # Run processing before persisting so provider failure cannot create orphan records.
    try:
        ocr_gateway = create_ocr_gateway()
        if ocr_gateway.__class__.__name__ != "MockOCRGateway":
            import io
            import warnings
            from PIL import Image
            if content_type == "application/pdf":
                raise HTTPException(status_code=415, detail="Scanned PDF processing is not available. Upload a JPEG, PNG or WebP image.")
            try:
                with warnings.catch_warnings():
                    warnings.simplefilter("error", Image.DecompressionBombWarning)
                    with Image.open(io.BytesIO(content)) as image:
                        mime_types = {"JPEG": {"image/jpeg", "image/jpg"}, "PNG": {"image/png"}, "WEBP": {"image/webp"}}
                        allowed_mimes = mime_types.get(image.format) if image.format else None
                        if not allowed_mimes or content_type not in allowed_mimes:
                            raise ValueError("Unsupported image format")
                        image.verify()
            except Exception:
                raise HTTPException(status_code=422, detail="This file is not a readable prescription image.") from None
        ocr_output = ocr_gateway.process_image(content, file.filename or "prescription")
    except OCRError:
        raise HTTPException(status_code=503, detail="Prescription processing is unavailable. Ask your healthcare worker to review the original document.") from None

    # 3. Checksum & Secure Storage
    checksum = hashlib.sha256(content).hexdigest()
    image_id = uuid.uuid4()
    ext = ALLOWED_MIME_TYPES[content_type]
    filename = f"{image_id}{ext}"
    upload_dir = _ensure_upload_dir()
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(content)

    try:
        # 4. Create Prescription Record (PENDING verification)
        prescription = Prescription(
            patient_id=patient.id,
            source="OCR_UPLOAD",
            status="ACTIVE",
            verification_status="PENDING",
            prescribed_date=prescribed_date,
        )
        db.add(prescription)
        db.flush()

        # 5. Create PrescriptionImage Record
        presc_image = PrescriptionImage(
            id=image_id,
            prescription_id=prescription.id,
            storage_reference=file_path,
            file_type=content_type,
            file_size=len(content),
            checksum=checksum,
            uploaded_at=datetime.now(timezone.utc),
        )
        db.add(presc_image)
        db.flush()

        # 6. Execute OCR Gateway

        # 7. Record Raw OCR Result
        ocr_result = OCRResult(
            prescription_image_id=presc_image.id,
            engine=ocr_output.engine,
            model_version=ocr_output.model_version,
            raw_text=ocr_output.raw_text,
            confidence=ocr_output.confidence,
            status=ocr_output.status,
            processed_at=datetime.now(timezone.utc),
        )
        db.add(ocr_result)
        db.flush()

        # 8. Conservative Entity Extraction
        candidates = extract_medication_entities(ocr_output.raw_text)

        # 9. Create Medication Records with STRICT PENDING Status
        created_candidates: List[ExtractedMedicationCandidate] = []
        for cand in candidates:
            med_name = cand.medicine_name.value or "Unknown Medicine"
            dosage_str = cand.dosage.value if cand.dosage else "Unspecified"
            instruction_str = cand.instructions.value if cand.instructions else None

            med = Medication(
                patient_id=patient.id,
                prescription_id=prescription.id,
                medicine_name=med_name,
                dosage=dosage_str,
                route=None,
                instructions=instruction_str,
                verification_status="PENDING",  # NEVER auto-verified
            )
            db.add(med)
            db.flush()

            cand.id = med.id
            created_candidates.append(cand)

        # 10. Health Timeline Event
        timeline_event = HealthTimelineEvent(
            patient_id=patient.id,
            event_type="PRESCRIPTION_UPLOADED",
            reference_id=prescription.id,
            event_time=datetime.now(timezone.utc),
            metadata_={
                "summary": f"Prescription uploaded via {ocr_output.engine}. {len(created_candidates)} candidate medication(s) extracted (PENDING verification)."
            },
        )
        db.add(timeline_event)

        db.commit()

    except Exception:
        db.rollback()
        if os.path.isfile(file_path):
            os.remove(file_path)
        raise

    return PrescriptionUploadResponse(
        prescription_id=prescription.id,
        image_id=presc_image.id,
        source=prescription.source,
        verification_status=prescription.verification_status,
        prescribed_date=prescription.prescribed_date,
        ocr_engine=ocr_output.engine,
        confidence=ocr_output.confidence,
        raw_text=ocr_output.raw_text,
        extracted_medications=created_candidates,
    )


def list_patient_prescriptions(
    db: Session,
    patient: PatientProfile,
) -> List[PrescriptionSummaryResponse]:
    """List all prescriptions for a patient."""
    prescriptions = (
        db.query(Prescription)
        .filter(Prescription.patient_id == patient.id)
        .order_by(Prescription.created_at.desc())
        .all()
    )

    summaries = []
    for p in prescriptions:
        med_count = db.query(Medication).filter(Medication.prescription_id == p.id).count()
        summaries.append(
            PrescriptionSummaryResponse(
                id=p.id,
                patient_id=p.patient_id,
                source=p.source,
                status=p.status,
                verification_status=p.verification_status,
                prescribed_date=p.prescribed_date,
                created_at=p.created_at,
                medications_count=med_count,
            )
        )
    return summaries


def get_prescription_detail(
    db: Session,
    patient: PatientProfile,
    prescription_id: uuid.UUID,
) -> PrescriptionDetailResponse:
    """Get full details of a prescription including images, OCR text, and medications."""
    p = (
        db.query(Prescription)
        .filter(Prescription.id == prescription_id, Prescription.patient_id == patient.id)
        .first()
    )
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription record not found.",
        )

    images = [
        PrescriptionImageResponse.model_validate(img) for img in p.images
    ]
    
    ocr_results = []
    for img in p.images:
        for res in img.ocr_results:
            ocr_results.append(OCRResultResponse.model_validate(res))

    medications = [
        {
            "id": str(m.id),
            "medicine_name": m.medicine_name,
            "dosage": m.dosage,
            "route": m.route,
            "instructions": m.instructions,
            "verification_status": m.verification_status,
            "created_at": m.created_at.isoformat(),
        }
        for m in p.medications
    ]

    return PrescriptionDetailResponse(
        id=p.id,
        patient_id=p.patient_id,
        source=p.source,
        status=p.status,
        verification_status=p.verification_status,
        prescribed_date=p.prescribed_date,
        created_at=p.created_at,
        images=images,
        ocr_results=ocr_results,
        medications=medications,
    )
