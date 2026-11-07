"""Short-lived DB sessions for voice auth, consent and existing chat orchestration."""
import uuid

from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.api.deps import get_current_user
from app.db.session import SessionLocal
from app.models.conversations import Conversation
from app.schemas.ai import AIChatRequest
from app.services.ai_service import process_ai_chat_query, detect_red_flags
from app.services.consent_service import require_patient_consent
from app.services.patient_service import get_patient_profile_by_user


def _profile(db, token):
    user = get_current_user(HTTPAuthorizationCredentials(scheme='Bearer', credentials=token), db)
    return get_patient_profile_by_user(db, user)


def check_voice_access(token: str, conversation_id: uuid.UUID, spoken=False):
    with SessionLocal() as db:
        profile = _profile(db, token)
        require_patient_consent(db, profile, 'SPEECH_PROCESSING')
        if spoken:
            require_patient_consent(db, profile, 'SPOKEN_GUIDANCE')
        if not db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.patient_id == profile.id).first():
            raise HTTPException(status_code=404, detail='Conversation not found')


def open_voice_conversation(token, conversation_id, language):
    with SessionLocal() as db:
        profile = _profile(db, token)
        require_patient_consent(db, profile, 'SPEECH_PROCESSING')
        if conversation_id:
            conversation = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.patient_id == profile.id).first()
            if not conversation:
                raise HTTPException(status_code=404, detail='Conversation not found')
        else:
            conversation = Conversation(patient_id=profile.id, language=language, status='ACTIVE')
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
        return str(profile.id), conversation.id


def answer_voice_turn(token, conversation_id, message, language):
    """Called on a worker thread; no DB session crosses thread boundaries."""
    with SessionLocal() as db:
        profile = _profile(db, token)
        require_patient_consent(db, profile, 'SPEECH_PROCESSING')
        if not db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.patient_id == profile.id).first():
            raise HTTPException(status_code=404, detail='Conversation not found')
        if not detect_red_flags(message):
            require_patient_consent(db, profile, 'AI_PROCESSING')
        return process_ai_chat_query(db, profile, AIChatRequest(message=message, language=language, conversation_id=conversation_id))
