import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SymptomSubmitRequest(BaseModel):
    input_type: str = Field(default="text", description="Input format: text or speech")
    text: str = Field(..., description="Reported symptom narrative text")
    language: str = Field(default="en", description="Language code (en, te, hi)")


class SymptomSubmitResponse(BaseModel):
    symptom_record_id: uuid.UUID
    status: str = "RECORDED"
    reported_at: datetime


class SymptomAnalyzeRequest(BaseModel):
    symptom_record_id: uuid.UUID


class SymptomAnalyzeResponse(BaseModel):
    symptom_record_id: uuid.UUID
    risk_level: str  # ROUTINE, URGENT, EMERGENCY
    red_flags: List[str]
    guidance: str
    escalation_required: bool
    created_alert_id: Optional[uuid.UUID] = None
