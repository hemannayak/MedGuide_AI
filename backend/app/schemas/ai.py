import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Response type classification — deterministic, not LLM-assigned
# ---------------------------------------------------------------------------
class ResponseType(str, Enum):
    INFORMATIONAL = "INFORMATIONAL"
    SYMPTOM_GUIDANCE = "SYMPTOM_GUIDANCE"
    MEDICATION_INFO = "MEDICATION_INFO"
    EMERGENCY = "EMERGENCY"
    REFUSAL = "REFUSAL"
    OUT_OF_SCOPE = "OUT_OF_SCOPE"


# ---------------------------------------------------------------------------
# Source citation — full provenance traceability chain
# ---------------------------------------------------------------------------
class SourceCitation(BaseModel):
    """
    Full traceability chain:
    citation_id → chunk_id → document_id → page_number → section_title
                → source_url → official publisher PDF → SHA-256
    """
    citation_id: int
    document_id: uuid.UUID
    chunk_id: uuid.UUID
    title: str
    publisher: str
    publication_date: Optional[str] = None
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    source_url: Optional[str] = None


# ---------------------------------------------------------------------------
# AI Chat Request / Response
# ---------------------------------------------------------------------------
class AIChatRequest(BaseModel):
    message: str = Field(..., description="User query text", min_length=1, max_length=2000)
    language: Optional[str] = Field(
        default=None,
        description="Language code: en | hi | te. If omitted, auto-detected.",
    )
    conversation_id: Optional[uuid.UUID] = Field(
        None,
        description="Existing conversation ID for context continuity",
    )


class AIChatResponse(BaseModel):
    conversation_id: uuid.UUID
    message: str
    language: str
    response_type: ResponseType
    refusal_triggered: bool = False
    red_flags: List[str] = []
    sources: List[SourceCitation] = []
    disclaimer: str = (
        "MedGuide AI provides preliminary health information based on official "
        "medical guidelines. It is not a substitute for professional medical advice, "
        "diagnosis, or treatment."
    )


# ---------------------------------------------------------------------------
# Backward compatibility — legacy SourceAttribution alias
# ---------------------------------------------------------------------------
class SourceAttribution(BaseModel):
    document_id: uuid.UUID
    title: str
    publisher: str
    language: str


# ---------------------------------------------------------------------------
# Conversation history schemas (existing — unchanged)
# ---------------------------------------------------------------------------
class ConversationMessageResponse(BaseModel):
    id: uuid.UUID
    sender_type: str
    content: str
    metadata_: Optional[Dict[str, Any]] = Field(
        None,
        validation_alias="metadata_",
        serialization_alias="metadata",
    )
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
