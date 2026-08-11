import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AlertResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    alert_type: str
    severity: str
    source: str
    status: str
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class AlertUpdateRequest(BaseModel):
    status: str = Field(..., description="Target alert status: ACKNOWLEDGED, RESOLVED")
