import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ConsentGrantRequest(BaseModel):
    consent_type: str = Field(..., description="Consent scope type e.g. DATA_SHARING, AI_PROCESSING")
    version: str = Field(default="1.0", description="Policy document version")
    status: str = Field(default="GRANTED", description="Consent status")


class ConsentWithdrawRequest(BaseModel):
    status: str = Field(default="WITHDRAWN", description="Target consent status")


class ConsentResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    consent_type: str
    status: str
    version: str
    granted_at: Optional[datetime] = None
    withdrawn_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
