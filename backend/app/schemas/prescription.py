import uuid
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class FieldConfidence(BaseModel):
    """Field value alongside entity-level confidence score."""
    value: Optional[str] = Field(None, description="Extracted textual value")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Field-level extraction confidence score")


class ExtractedMedicationCandidate(BaseModel):
    """Conservative medication candidate extracted from prescription OCR."""
    id: Optional[uuid.UUID] = Field(None, description="Created medication database record ID")
    medicine_name: FieldConfidence = Field(..., description="Medicine brand/generic name")
    dosage: Optional[FieldConfidence] = Field(None, description="Dosage/strength if explicitly present in OCR text")
    frequency: Optional[FieldConfidence] = Field(None, description="Dosage frequency if explicitly present in OCR text")
    instructions: Optional[FieldConfidence] = Field(None, description="Specific instructions if explicitly present in OCR text")
    verification_status: str = Field("PENDING", description="Verification status (always PENDING on extraction)")


class OCRResultResponse(BaseModel):
    """Metadata and raw text results from OCR extraction."""
    id: uuid.UUID
    engine: str
    model_version: str
    raw_text: str
    confidence: Optional[float] = None
    status: str
    processed_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PrescriptionImageResponse(BaseModel):
    """Prescription image metadata."""
    id: uuid.UUID
    storage_reference: str
    file_type: str
    file_size: int
    checksum: Optional[str] = None
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PrescriptionUploadResponse(BaseModel):
    """Response returned upon prescription image upload and OCR processing."""
    prescription_id: uuid.UUID
    image_id: uuid.UUID
    source: str
    verification_status: str
    prescribed_date: Optional[date] = None
    ocr_engine: str
    confidence: Optional[float] = None
    raw_text: str
    extracted_medications: List[ExtractedMedicationCandidate]
    message: str = "Prescription processed. Extracted medications are PENDING and require human verification."


class PrescriptionSummaryResponse(BaseModel):
    """Summary item for prescription list."""
    id: uuid.UUID
    patient_id: uuid.UUID
    source: str
    status: str
    verification_status: str
    prescribed_date: Optional[date] = None
    created_at: datetime
    medications_count: int = 0
    model_config = ConfigDict(from_attributes=True)


class PrescriptionDetailResponse(BaseModel):
    """Full prescription details with images, OCR results, and linked medications."""
    id: uuid.UUID
    patient_id: uuid.UUID
    source: str
    status: str
    verification_status: str
    prescribed_date: Optional[date] = None
    created_at: datetime
    images: List[PrescriptionImageResponse] = []
    ocr_results: List[OCRResultResponse] = []
    medications: List[Dict[str, Any]] = []
    model_config = ConfigDict(from_attributes=True)
