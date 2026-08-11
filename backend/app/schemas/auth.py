import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegisterRequest(BaseModel):
    login_identifier: str = Field(..., description="Email or username login identifier")
    password: str = Field(..., min_length=8, description="User password (min 8 chars)")
    display_name: str = Field(..., description="Full display name of patient")
    preferred_language: str = Field(default="en", description="Preferred language code (en, te, hi)")


class UserLoginRequest(BaseModel):
    login_identifier: str = Field(..., description="Email or username login identifier")
    password: str = Field(..., description="User password")


class UserResponseData(BaseModel):
    id: uuid.UUID
    login_identifier: str
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TokenResponseData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponseData


class StandardResponse(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    message: Optional[str] = "Operation completed successfully"
