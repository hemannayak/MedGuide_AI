from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.users import User
from app.schemas.auth import (
    StandardResponse,
    TokenResponseData,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponseData,
)
from app.services.auth_service import authenticate_user, register_patient_user

router = APIRouter()


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
) -> Any:
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
