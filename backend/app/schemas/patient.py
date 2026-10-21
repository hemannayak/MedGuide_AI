import uuid
from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


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
    display_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Updated display name")
    date_of_birth: Optional[date] = Field(None, description="Updated date of birth")
    preferred_language: Optional[Literal["en", "hi", "te"]] = Field(None, description="Updated language (en, te, hi)")
    contact_reference: Optional[str] = Field(None, max_length=255, description="Updated contact number/ref")

    @field_validator('date_of_birth')
    @classmethod
    def not_future(cls, value):
        if value is not None and value > date.today(): raise ValueError('Date of birth cannot be in the future')
        return value

    @model_validator(mode='after')
    def required_account_values(self):
        if 'display_name' in self.model_fields_set:
            if self.display_name is None or not self.display_name.strip(): raise ValueError('Display name cannot be blank')
            self.display_name = self.display_name.strip()
        if 'preferred_language' in self.model_fields_set and self.preferred_language is None: raise ValueError('Language cannot be null')
        return self
