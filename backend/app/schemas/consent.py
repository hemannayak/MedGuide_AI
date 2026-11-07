import uuid
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field


class ConsentGrantRequest(BaseModel):
    consent_type: Literal["AI_PROCESSING", "SPEECH_PROCESSING", "DATA_SHARING", "SPOKEN_GUIDANCE"]
    version: Literal["1.0"] = "1.0"
    status: Literal["GRANTED"] = "GRANTED"


class SpokenGuidanceChoice(BaseModel):
    enabled: bool


class ConsentWithdrawRequest(BaseModel):
    status: Literal["WITHDRAWN"] = "WITHDRAWN"


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
