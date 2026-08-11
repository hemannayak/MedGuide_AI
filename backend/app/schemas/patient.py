import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PatientProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    display_name: str
    date_of_birth: Optional[date] = None
    preferred_language: str
    contact_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PatientProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = Field(None, description="Updated display name")
    date_of_birth: Optional[date] = Field(None, description="Updated date of birth")
    preferred_language: Optional[str] = Field(None, description="Updated language (en, te, hi)")
    contact_reference: Optional[str] = Field(None, description="Updated contact number/ref")
