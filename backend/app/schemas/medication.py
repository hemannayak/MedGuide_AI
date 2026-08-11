import uuid
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class MedicationScheduleCreateRequest(BaseModel):
    frequency: str = Field(..., description="Schedule frequency (e.g., ONCE_DAILY, TWICE_DAILY)")
    schedule_data: Dict[str, Any] = Field(..., description="Structured timing data e.g. {'times': ['08:00', '20:00']}")
    start_date: date
    end_date: Optional[date] = None
    timezone: str = Field(default="UTC")


class MedicationScheduleResponse(BaseModel):
    id: uuid.UUID
    medication_id: uuid.UUID
    frequency: str
    schedule_data: Dict[str, Any]
    start_date: date
    end_date: Optional[date] = None
    timezone: str
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class MedicationCreateRequest(BaseModel):
    medicine_name: str = Field(..., description="Name of medicine")
    dosage: str = Field(..., description="Dosage (e.g. 500mg)")
    route: Optional[str] = Field(None, description="Route e.g. Oral")
    instructions: Optional[str] = Field(None, description="Special instructions")
    prescription_id: Optional[uuid.UUID] = Field(None, description="Optional associated prescription ID")


class MedicationResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    prescription_id: Optional[uuid.UUID] = None
    medicine_name: str
    dosage: str
    route: Optional[str] = None
    instructions: Optional[str] = None
    verification_status: str
    created_at: datetime
    updated_at: datetime
    schedules: List[MedicationScheduleResponse] = []
    model_config = ConfigDict(from_attributes=True)


class MedicationAdherenceRecordRequest(BaseModel):
    scheduled_at: datetime = Field(..., description="Scheduled intake timestamp")
    status: str = Field(..., description="Intake status: TAKEN, MISSED, SKIPPED")
    source: str = Field(default="PATIENT_REPORTED", description="Reporting source")


class MedicationAdherenceResponse(BaseModel):
    id: uuid.UUID
    medication_schedule_id: uuid.UUID
    scheduled_at: datetime
    recorded_at: datetime
    status: str
    source: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
