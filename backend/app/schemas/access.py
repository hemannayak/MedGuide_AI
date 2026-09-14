import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class GrantAccessRequest(BaseModel):
    patient_id: uuid.UUID = Field(..., description="ID of patient profile to grant access to")
    access_type: str = Field(default="FULL_ACCESS", description="Access level (e.g., FULL_ACCESS, READ_ONLY)")
    notes: Optional[str] = Field(None, description="Clinical or administrative justification")


class RevokeAccessRequest(BaseModel):
    patient_id: uuid.UUID = Field(..., description="ID of patient profile to revoke access from")
    reason: Optional[str] = Field(None, description="Reason for access revocation")


class PatientWorkerAccessResponse(BaseModel):
    id: uuid.UUID
    healthcare_worker_profile_id: uuid.UUID
    patient_profile_id: uuid.UUID
    access_type: str
    status: str
    granted_at: datetime
    revoked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
