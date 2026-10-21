import uuid
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator, AwareDatetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
import re


class MedicationScheduleCreateRequest(BaseModel):
    frequency: str = Field(..., min_length=1, max_length=100, description="Frequency copied from the prescription")
    schedule_data: Dict[str, Any] = Field(..., description="Structured timing data e.g. {'times': ['08:00', '20:00']}")
    start_date: date
    end_date: Optional[date] = None
    timezone: str = Field(default="UTC")

    @model_validator(mode="after")
    def validate_schedule(self):
        times = self.schedule_data.get("times")
        if not isinstance(times, list) or not times or not all(isinstance(t, str) and re.fullmatch(r"(?:[01]\d|2[0-3]):[0-5]\d", t) for t in times):
            raise ValueError("Schedule requires times in HH:MM format")
        if len(times) != len(set(times)):
            raise ValueError("Schedule times must be unique")
        if self.end_date and self.end_date < self.start_date:
            raise ValueError("End date must not precede start date")
        try:
            ZoneInfo(self.timezone)
        except (ZoneInfoNotFoundError, ValueError):
            raise ValueError("Use a valid IANA timezone") from None
        if not self.frequency.strip():
            raise ValueError("Frequency must be provided from the prescription")
        return self


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
    scheduled_at: AwareDatetime
    status: Literal["TAKEN", "MISSED", "SKIPPED"]
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
