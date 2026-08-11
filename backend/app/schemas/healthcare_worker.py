import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.patient import PatientProfileResponse


class HealthcareWorkerProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    worker_type: str
    organization: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PatientSummaryResponse(BaseModel):
    patient_id: uuid.UUID
    display_name: str
    summary_text: str
    reported_symptom_count: int
    active_medication_count: int
    open_alert_count: int
    generated_at: datetime
