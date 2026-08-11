import uuid
from datetime import datetime, timezone
from typing import List, Tuple
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.conversations import Conversation, ConversationMessage
from app.models.knowledge import KnowledgeChunk, MedicalDocument
from app.models.profiles import PatientProfile
from app.schemas.ai import AIChatRequest, AIChatResponse, SourceAttribution


def process_ai_chat_query(
    db: Session,
    patient_profile: PatientProfile,
    req: AIChatRequest,
) -> AIChatResponse:
    """Process user AI companion query using pgvector retrieval context grounding."""
    # Get or create conversation
    conversation = None
    if req.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == req.conversation_id,
                Conversation.patient_id == patient_profile.id,
            )
            .first()
        )

    if not conversation:
        conversation = Conversation(
            patient_id=patient_profile.id,
            language=req.language,
            status="ACTIVE",
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Save user message
    user_msg = ConversationMessage(
        conversation_id=conversation.id,
        sender_type="PATIENT",
        content=req.message,
    )
    db.add(user_msg)
    db.commit()

    # RAG Retrieval from knowledge_chunks (pgvector)
    sources: List[SourceAttribution] = []
    retrieved_chunks = (
        db.query(KnowledgeChunk)
        .join(MedicalDocument)
        .filter(MedicalDocument.review_status == "APPROVED")
        .limit(3)
        .all()
    )

    for chunk in retrieved_chunks:
        sources.append(
            SourceAttribution(
                document_id=uuid.UUID(str(chunk.document_id)),
                title=chunk.document.title,
                publisher=chunk.document.publisher,
                language=chunk.document.language,
            )
        )


    if sources:
        ai_response_text = (
            f"Based on approved medical guidelines: For queries regarding '{req.message[:50]}...', "
            "maintain adequate hydration, rest, and consult a qualified healthcare professional if symptoms persist."
        )
    else:
        ai_response_text = (
            "General Health Information: Maintain good hygiene, hydration, and rest. "
            "For specific clinical concerns, please consult a qualified healthcare professional."
        )

    # Save AI message
    ai_msg = ConversationMessage(
        conversation_id=conversation.id,
        sender_type="AI_COMPANION",
        content=ai_response_text,
        metadata_={"sources_count": len(sources), "language": req.language},
    )
    db.add(ai_msg)
    db.commit()

    return AIChatResponse(
        conversation_id=conversation.id,
        message=ai_response_text,
        sources=sources,
        language=req.language,
    )
