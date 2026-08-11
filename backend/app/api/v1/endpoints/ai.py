from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.conversations import Conversation
from app.models.users import User
from app.schemas.ai import AIChatRequest, ConversationResponse
from app.schemas.auth import StandardResponse
from app.services.ai_service import process_ai_chat_query
from app.services.patient_service import get_patient_profile_by_user

router = APIRouter()


@router.post(
    "/chat",
    response_model=StandardResponse,
    summary="AI companion health query with RAG retrieval grounding",
)
def ai_chat(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    res = process_ai_chat_query(db, profile, req)
    return StandardResponse(
        success=True,
        data=res,
    )


@router.get(
    "/conversations",
    response_model=StandardResponse,
    summary="List patient AI companion conversations",
)
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    conversations = (
        db.query(Conversation)
        .filter(Conversation.patient_id == profile.id)
        .order_by(Conversation.started_at.desc())
        .all()
    )
    return StandardResponse(
        success=True,
        data=[ConversationResponse.model_validate(c) for c in conversations],
    )


@router.get(
    "/conversations/{conversation_id}",
    response_model=StandardResponse,
    summary="Get single conversation history",
)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    profile = get_patient_profile_by_user(db, current_user)
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.patient_id == profile.id,
        )
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    return StandardResponse(
        success=True,
        data=ConversationResponse.model_validate(conv),
    )
