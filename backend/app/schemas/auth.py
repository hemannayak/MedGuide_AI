import uuid
from datetime import datetime
from typing import Any, Optional, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegisterRequest(BaseModel):
    login_identifier: str = Field(..., description="Email or username login identifier")
    password: str = Field(..., min_length=8, description="User password (min 8 chars)")
    display_name: str = Field(..., description="Full display name of patient")
    preferred_language: str = Field(default="en", description="Preferred language code (en, te, hi)")


class UserLoginRequest(BaseModel):
    login_identifier: str = Field(..., description="Email or username login identifier")
    password: str = Field(..., description="User password")


class OTPRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20, description="Mobile number with country code")
    purpose: Literal['LOGIN', 'REGISTER'] = Field(default="LOGIN", description="Purpose: LOGIN or REGISTER")


class OTPVerifyRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20, description="Mobile number with country code")
    otp_code: str = Field(..., min_length=4, max_length=8, description="Verification code received")
    purpose: Literal['LOGIN', 'REGISTER'] = Field(default="LOGIN", description="Purpose: LOGIN or REGISTER")


class OTPRegisterRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20, description="Mobile phone number")
    otp_code: str = Field(..., min_length=4, max_length=8, description="Verified or current OTP code")
    display_name: str = Field(..., min_length=1, max_length=80, description="Full display name of patient")
    preferred_language: str = Field(default="en", description="Preferred language code (en, te, hi)")
    email: Optional[str] = Field(default=None, description="Optional email address")


class OTPLoginRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20, description="Mobile phone number")
    otp_code: str = Field(..., min_length=4, max_length=8, description="Verification code")


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

