import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SourceAttribution(BaseModel):
    document_id: uuid.UUID
    title: str
    publisher: str
    language: str


class AIChatRequest(BaseModel):
    message: str = Field(..., description="User query text")
    language: str = Field(default="en", description="Language code (en, te, hi)")
    conversation_id: Optional[uuid.UUID] = Field(None, description="Existing conversation ID")


class AIChatResponse(BaseModel):
    conversation_id: uuid.UUID
    message: str
    sources: List[SourceAttribution] = []
    language: str = "en"


class ConversationMessageResponse(BaseModel):
    id: uuid.UUID
    sender_type: str
    content: str
    metadata_: Optional[Dict[str, Any]] = Field(None, validation_alias="metadata_", serialization_alias="metadata")
    created_at: datetime
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)



class ConversationResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    language: str
    status: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    messages: List[ConversationMessageResponse] = []
    model_config = ConfigDict(from_attributes=True)
