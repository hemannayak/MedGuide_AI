from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, security_scheme
from fastapi.security import HTTPAuthorizationCredentials
from app.services.session_service import revoke_access_token
from app.models.users import User
from app.schemas.auth import (
    OTPLoginRequest,
    OTPRegisterRequest,
    OTPRequest,
    OTPVerifyRequest,
    StandardResponse,
    TokenResponseData,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponseData,
)
from app.services.auth_service import authenticate_user, register_patient_user
from app.services.otp_service import (
    login_with_otp,
    register_with_otp,
    request_otp,
    verify_otp_internal,
)

router = APIRouter()


@router.post(
    "/otp/request",
    response_model=StandardResponse,
    summary="Request a 6-digit OTP code for mobile phone authentication",
)
def request_phone_otp(
    req: OTPRequest,
    db: Session = Depends(get_db),
) -> Any:
    data = request_otp(db, req.phone_number, req.purpose)
    return StandardResponse(
        success=True,
        data=data,
        message="Verification code sent successfully",
    )


@router.post(
    "/otp/verify",
    response_model=StandardResponse,
    summary="Verify a received OTP code without consuming it immediately",
)
def verify_phone_otp(
    req: OTPVerifyRequest,
    db: Session = Depends(get_db),
) -> Any:
    verify_otp_internal(db, req.phone_number, req.otp_code, req.purpose)
    return StandardResponse(
        success=True,
        data={"verified": True, "phone_number": req.phone_number},
        message="Code verified successfully",
    )


@router.post(
    "/otp/register",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new patient account using verified mobile OTP",
)
def register_patient_otp(
    req: OTPRegisterRequest,
    db: Session = Depends(get_db),
) -> Any:
    user, token = register_with_otp(db, req)
    return StandardResponse(
        success=True,
        data=TokenResponseData(
            access_token=token,
            token_type="bearer",
            user=UserResponseData(
                id=user.id,
                login_identifier=user.login_identifier,
                role=user.role.name,
                created_at=user.created_at,
            ),
        ),
        message="Account created and verified successfully",
    )


@router.post(
    "/otp/login",
    response_model=StandardResponse,
    summary="Authenticate patient account using mobile OTP",
)
def login_patient_otp(
    req: OTPLoginRequest,
    db: Session = Depends(get_db),
) -> Any:
    user, token = login_with_otp(db, req)
    return StandardResponse(
        success=True,
        data=TokenResponseData(
            access_token=token,
            token_type="bearer",
            user=UserResponseData(
                id=user.id,
                login_identifier=user.login_identifier,
                role=user.role.name,
                created_at=user.created_at,
            ),
        ),
        message="Login successful",
    )


@router.post(
    "/register",
    response_model=StandardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new patient account",
)
def register(
    req: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> Any:
    user = register_patient_user(db, req)
    return StandardResponse(
        success=True,
        data={
            "user_id": user.id,
            "role": user.role.name,
        },
        message="Patient registered successfully",
    )


@router.post(
    "/login",
    response_model=StandardResponse,
    summary="Authenticate user credentials and obtain access token",
)
def login(
    req: UserLoginRequest,
    db: Session = Depends(get_db),
) -> Any:
    user, token = authenticate_user(db, req.login_identifier, req.password)
    return StandardResponse(
        success=True,
        data=TokenResponseData(
            access_token=token,
            token_type="bearer",
            user=UserResponseData(
                id=user.id,
                login_identifier=user.login_identifier,
                role=user.role.name,
                created_at=user.created_at,
            ),
        ),
        message="Login successful",
    )



@router.post(
    "/logout",
    response_model=StandardResponse,
    summary="Logout user session",
)
def logout(
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Any:
    revoke_access_token(db, current_user.id, credentials.credentials)
    return StandardResponse(
        success=True,
        data=None,
        message="Logged out successfully",
    )


@router.get(
    "/me",
    response_model=StandardResponse,
    summary="Get current authenticated user profile and role",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    return StandardResponse(
        success=True,
        data=UserResponseData(
            id=current_user.id,
            login_identifier=current_user.login_identifier,
            role=current_user.role.name,
            created_at=current_user.created_at,
        ),
    )
