import uuid
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field, AwareDatetime


class FollowUpCreateRequest(BaseModel):
    patient_id: uuid.UUID
    reason: str = Field(..., min_length=1, max_length=255)
    scheduled_at: AwareDatetime
    notes: Optional[str] = Field(None, description="Clinical notes")


class FollowUpUpdateRequest(BaseModel):
    status: Optional[Literal["PENDING", "COMPLETED", "CANCELLED"]] = None
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
