import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class FollowUpCreateRequest(BaseModel):
    patient_id: uuid.UUID
    reason: str = Field(..., description="Reason for care follow-up")
    scheduled_at: datetime = Field(..., description="Target follow-up timestamp")
    notes: Optional[str] = Field(None, description="Clinical notes")


class FollowUpUpdateRequest(BaseModel):
    status: Optional[str] = Field(None, description="Status: PENDING, COMPLETED, CANCELLED")
    notes: Optional[str] = Field(None, description="Updated notes")


class FollowUpResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    healthcare_worker_id: Optional[uuid.UUID] = None
    reason: str
    scheduled_at: datetime
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
