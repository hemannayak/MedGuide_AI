import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class HealthTimelineEventResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    event_type: str
    reference_id: Optional[uuid.UUID] = None
    event_time: datetime
    metadata_: Optional[Dict[str, Any]] = Field(None, validation_alias="metadata_", serialization_alias="metadata")
    created_at: datetime
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int


class PaginatedTimelineResponse(BaseModel):
    success: bool = True
    data: List[HealthTimelineEventResponse]
    pagination: PaginationMeta
