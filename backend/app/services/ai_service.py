"""
MedGuide AI — AI Service (M4.3)
================================
Grounded RAG + AI Health Companion pipeline.

Architecture (v1.1 spec):
  Input Validation
    → Language Resolution (explicit → langdetect → EN)
    → Safety / Red-Flag Gate (deterministic, no LLM)
       ├─ RED FLAG: deterministic emergency response
       └─ NORMAL: Query Embedding (384-d multilingual)
           → pgvector cosine search (top 10 candidates)
           → Threshold filter (similarity ≥ RAG_SIMILARITY_THRESHOLD)
           → Evidence Sufficiency Gate
              ├─ NO EVIDENCE: Refusal (localized)
              └─ SUFFICIENT: Grounded Prompt Builder
                  → AIGateway (Ollama / Groq / Mock)
                  → LLM Output Validator (citation + safety check)
                  → Localized Response + SourceCitation list

Conversation memory: last N=5 turns for conversational context.
Medical facts always from RAG — never from conversation history.

All thresholds configurable via environment variables:
  RAG_SIMILARITY_THRESHOLD=0.55   (provisional; calibrate with dev benchmark)
  RAG_TOP_K_CANDIDATES=10
  RAG_TOP_K_CONTEXT=4
  CONVERSATION_HISTORY_TURNS=5
"""

import logging
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.conversations import Conversation, ConversationMessage
from app.models.knowledge import KnowledgeChunk, MedicalDocument
from app.models.profiles import PatientProfile
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    ResponseType,
    SourceCitation,
)
from app.services.ai_gateway import AIGateway, AIGatewayError, create_ai_gateway
from app.services.knowledge_service import generate_embedding

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration (via environment variables)
# ---------------------------------------------------------------------------
RAG_SIMILARITY_THRESHOLD = float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.55"))
RAG_TOP_K_CANDIDATES = int(os.getenv("RAG_TOP_K_CANDIDATES", "10"))
RAG_TOP_K_CONTEXT = int(os.getenv("RAG_TOP_K_CONTEXT", "4"))
CONVERSATION_HISTORY_TURNS = int(os.getenv("CONVERSATION_HISTORY_TURNS", "5"))
MAX_HISTORY_TOKENS = int(os.getenv("MAX_HISTORY_TOKENS", "1000"))

# ---------------------------------------------------------------------------
# M4.3.2 — Safety / Red-Flag Gate (Deterministic)
# ---------------------------------------------------------------------------
# Patterns sourced from M3 deterministic triage rules.
# No new medical rules invented here. Conservative superset for safety gate.
_RED_FLAG_PATTERNS = [
    r"\bchest\s+pain\b",
    r"\bsevere\s+(chest|abdominal|head)\b",
    r"\bdifficult(y)?\s+(breath|breathing)\b",
    r"\bshortness\s+of\s+breath\b",
    r"\bunconscious\b",
    r"\bblack(ed)?\s+out\b",
    r"\bsevere\s+bleed(ing)?\b",
    r"\bhemorrhage\b",
    r"\bseizure\b",
    r"\bstroke\b",
    r"\banaphyla(xis|ctic)\b",
    r"\bsevere\s+(allergic|reaction)\b",
    r"\bpoison(ing|ed)?\b",
    r"\boverdose\b",
    r"\bsevere\s+burn\b",
    r"\bnot\s+breath(ing)?\b",
    r"\bno\s+pulse\b",
    r"\bheart\s+attack\b",
    r"\baltered\s+(mental|consciousness|state)\b",
    # Hindi patterns
    r"\bসীনায়\s+ব্যথা\b",
    r"\bसीने\s+(में)?\s+दर्द\b",
    r"\bसांस\s+(नहीं|लेने\s+में)\b",
    # Telugu patterns
    r"\bఛాతీ\s+నొప్పి\b",
    r"\bఊపిరి\s+అందడం\s+లేదు\b",
]
_RED_FLAG_RE = [re.compile(p, re.IGNORECASE) for p in _RED_FLAG_PATTERNS]


def detect_red_flags(message: str) -> List[str]:
    """Deterministic red-flag detection. Returns list of matched patterns."""
    return [
        p.pattern for p in _RED_FLAG_RE if p.search(message)
    ]


# ---------------------------------------------------------------------------
# M4.3.1 — Language Resolution
# ---------------------------------------------------------------------------
SUPPORTED_LANGUAGES = {"en", "hi", "te"}


def resolve_language(requested: Optional[str], message: str) -> str:
    """
    Priority: explicit param → langdetect → EN default.
    Explicit parameter is trusted if it is a supported code.
    """
    if requested and requested.lower() in SUPPORTED_LANGUAGES:
        return requested.lower()

    try:
        from langdetect import detect as langdetect_detect
        detected = langdetect_detect(message)
        if detected in SUPPORTED_LANGUAGES:
            return detected
    except Exception:
        pass

    return "en"


# ---------------------------------------------------------------------------
# M4.3.1 — Response type classification (deterministic, pre-retrieval)
# ---------------------------------------------------------------------------
_EMERGENCY_WORDS = {"emergency", "severe", "unconscious", "bleeding", "overdose",
                    "seizure", "stroke", "anaphylaxis", "ambulance", "911", "112"}
_SYMPTOM_WORDS = {"symptom", "sign", "feel", "feeling", "pain", "ache", "fever",
                  "cough", "rash", "nausea", "vomit", "diarrhea", "fatigue"}
_MEDICATION_WORDS = {"medicine", "drug", "medication", "tablet", "dose", "dosage",
                     "treatment", "therapy", "prescription", "mg", "mg/kg"}
_INFORMATIONAL_WORDS = {"what", "how", "why", "explain", "define", "tell me about",
                        "what is", "what are", "describe"}


def classify_response_type(message: str, red_flags: List[str]) -> ResponseType:
    """Classify query type deterministically before retrieval."""
    if red_flags:
        return ResponseType.EMERGENCY

    msg_lower = message.lower()
    words = set(re.findall(r'\b\w+\b', msg_lower))

    if words & _EMERGENCY_WORDS:
        return ResponseType.EMERGENCY
    if words & _MEDICATION_WORDS:
        return ResponseType.MEDICATION_INFO
    if words & _SYMPTOM_WORDS:
        return ResponseType.SYMPTOM_GUIDANCE
    return ResponseType.INFORMATIONAL


# ---------------------------------------------------------------------------
# M4.3.1 — pgvector RAG Retrieval Engine
# ---------------------------------------------------------------------------
def retrieve_relevant_chunks(
    db: Session,
    query: str,
    top_k_candidates: int = RAG_TOP_K_CANDIDATES,
    top_k_context: int = RAG_TOP_K_CONTEXT,
    similarity_threshold: float = RAG_SIMILARITY_THRESHOLD,
) -> List[Dict[str, Any]]:
    """
    Two-stage retrieval:
      1. Embed query and retrieve top_k_candidates from pgvector (cosine similarity)
      2. Filter by similarity_threshold, return top_k_context strongest matches

    Returns list of dicts with chunk content and metadata.
    """
    query_embedding = generate_embedding(query)
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    # pgvector cosine distance: 1 - cosine_similarity
    # Lower distance = more similar
    # similarity = 1 - distance
    sql = text("""
        SELECT
            kc.id AS chunk_id,
            kc.document_id,
            kc.content,
            kc.metadata,
            md.title,
            md.publisher,
            md.source_reference AS source_url,
            md.language,
            md.publication_date,
            md.version,
            1 - (kc.embedding <=> CAST(:embedding AS vector)) AS similarity
        FROM knowledge_chunks kc
        JOIN medical_documents md ON kc.document_id = md.id
        WHERE md.review_status = 'APPROVED'
        ORDER BY kc.embedding <=> CAST(:embedding AS vector)
        LIMIT :limit
    """)

    rows = db.execute(
        sql,
        {"embedding": embedding_str, "limit": top_k_candidates},
    ).fetchall()

    # Filter by threshold and take top_k_context
    filtered = [
        {
            "chunk_id": row.chunk_id,
            "document_id": row.document_id,
            "content": row.content,
            "metadata": row.metadata or {},
            "title": row.title,
            "publisher": row.publisher,
            "source_url": row.source_url,
            "language": row.language,
            "publication_date": str(row.publication_date) if row.publication_date else None,
            "similarity": float(row.similarity),
        }
        for row in rows
        if float(row.similarity) >= similarity_threshold
    ]

    # Sort descending by similarity, take top_k_context
    filtered.sort(key=lambda x: x["similarity"], reverse=True)
    return filtered[:top_k_context]


# ---------------------------------------------------------------------------
# M4.3.2 — Evidence sufficiency gate
# ---------------------------------------------------------------------------
def is_sufficient_evidence(chunks: List[Dict[str, Any]]) -> bool:
    return len(chunks) > 0


# ---------------------------------------------------------------------------
# M4.3.7 — Conversation memory (short-term context)
# ---------------------------------------------------------------------------
def get_conversation_history(
    db: Session,
    conversation: Conversation,
    max_turns: int = CONVERSATION_HISTORY_TURNS,
) -> List[Dict[str, str]]:
    """
    Load last N message pairs from conversation for conversational context.
    Medical facts come from RAG — history provides conversational context only.
    """
    messages = (
        db.query(ConversationMessage)
        .filter(ConversationMessage.conversation_id == conversation.id)
        .order_by(ConversationMessage.created_at.desc())
        .limit(max_turns * 2)
        .all()
    )
    messages.reverse()
    return [
        {"role": "assistant" if m.sender_type == "AI_COMPANION" else "user",
         "content": m.content[:300]}
        for m in messages
    ]


def format_history_for_prompt(history: List[Dict[str, str]]) -> str:
    """Format conversation history into prompt-injectable text (token-bounded)."""
    if not history:
        return ""
    lines = []
    total_chars = 0
    for turn in reversed(history):
        role = "User" if turn["role"] == "user" else "Assistant"
        line = f"{role}: {turn['content']}"
        total_chars += len(line)
        if total_chars > MAX_HISTORY_TOKENS * 4:  # ~4 chars/token
            break
        lines.insert(0, line)
    return "\n".join(lines) if lines else ""


# ---------------------------------------------------------------------------
# M4.3.4 — Grounded prompt builder
# ---------------------------------------------------------------------------
SYSTEM_PROMPT_TEMPLATE = """You are MedGuide AI, a multilingual primary healthcare information assistant for rural communities in India.

CRITICAL SAFETY RULES — FOLLOW EXACTLY:
1. Answer STRICTLY AND ONLY using the Verified Medical Context provided below.
2. Do NOT use any outside medical knowledge from your training data.
3. If the context does not contain enough information, say: "The provided medical guidelines do not contain sufficient information to answer this question."
4. Include in-text citations like [1], [2] corresponding to the numbered sources below.
5. ONLY cite source numbers that appear in the context below. Never invent a citation.
6. Respond in {language_name}.
7. NEVER claim to diagnose, prescribe medication, or change prescribed dosages.
8. NEVER tell a patient to stop prescribed medication.
9. NEVER claim to be a doctor or replace professional medical advice.
10. If emergency symptoms are mentioned, always recommend immediate emergency care."""

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "te": "Telugu (తెలుగు)",
}

CONTEXT_TEMPLATE = """
--- VERIFIED MEDICAL CONTEXT ---
{context_blocks}
--- END OF VERIFIED CONTEXT ---

CONVERSATION HISTORY (for context only — do not use as medical source):
{history}

USER QUESTION: {question}

INSTRUCTIONS: Answer using ONLY the verified context above. Cite sources with [1], [2] etc. 
Respond in {language_name}."""


def build_grounded_prompt(
    query: str,
    chunks: List[Dict[str, Any]],
    language: str,
    history: str,
) -> Tuple[str, str]:
    """
    Build system prompt and user prompt with injected RAG context.
    Returns (system_prompt, user_prompt).
    """
    language_name = LANGUAGE_NAMES.get(language, "English")
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(language_name=language_name)

    context_blocks = []
    for i, chunk in enumerate(chunks, start=1):
        meta = chunk.get("metadata", {})
        page = meta.get("page_number", "N/A")
        section = meta.get("section_title", "")
        block = (
            f"[{i}] Document: {chunk['title']} | "
            f"Publisher: {chunk['publisher']} | "
            f"Page: {page}"
        )
        if section:
            block += f" | Section: {section[:80]}"
        block += f"\n    URL: {chunk.get('source_url', 'N/A')}"
        block += f"\n    Content: {chunk['content'][:600]}"
        context_blocks.append(block)

    user_prompt = CONTEXT_TEMPLATE.format(
        context_blocks="\n\n".join(context_blocks),
        history=history if history else "(No prior conversation)",
        question=query,
        language_name=language_name,
    )
    return system_prompt, user_prompt


# ---------------------------------------------------------------------------
# M4.3.5 — Citation builder
# ---------------------------------------------------------------------------
def build_citations(chunks: List[Dict[str, Any]]) -> List[SourceCitation]:
    """Build SourceCitation list from retrieved chunks."""
    citations = []
    for i, chunk in enumerate(chunks, start=1):
        meta = chunk.get("metadata", {})
        citations.append(
            SourceCitation(
                citation_id=i,
                document_id=uuid.UUID(str(chunk["document_id"])),
                chunk_id=uuid.UUID(str(chunk["chunk_id"])),
                title=chunk["title"],
                publisher=chunk["publisher"],
                publication_date=chunk.get("publication_date"),
                page_number=meta.get("page_number"),
                section_title=meta.get("section_title"),
                source_url=chunk.get("source_url"),
            )
        )
    return citations


# ---------------------------------------------------------------------------
# M4.3.6 — LLM Output Validator
# ---------------------------------------------------------------------------
_DANGEROUS_PATTERNS = [
    (r"\byou\s+should\s+stop\s+(taking|your)\b", "Unsafe: recommending stopping medication"),
    (r"\bstop\s+(taking|your)\s+\w+\b", "Unsafe: recommending stopping medication"),
    (r"\bincrease\s+(your\s+)?(dose|dosage)\b", "Unsafe: recommending dose change"),
    (r"\bdecrease\s+(your\s+)?(dose|dosage)\b", "Unsafe: recommending dose change"),
    (r"\bI\s+diagnose\b", "Unsafe: claiming diagnosis"),
    (r"\byou\s+(have|are\s+suffering\s+from)\s+(cancer|diabetes|hypertension|tuberculosis|malaria)\b",
     "Unsafe: stating diagnosis"),
    (r"\bprescribe\b", "Unsafe: prescribing language"),
    (r"\bI\s+(am|am\s+a)\s+(doctor|physician|clinician)\b", "Unsafe: doctor identity claim"),
]
_DANGEROUS_RE = [(re.compile(p, re.IGNORECASE), msg) for p, msg in _DANGEROUS_PATTERNS]


def validate_llm_output(
    response_text: str,
    chunks: List[Dict[str, Any]],
) -> Tuple[bool, Optional[str]]:
    """
    Validate LLM-generated response.
    Returns (is_valid, failure_reason).
    """
    # Check 1: Citation IDs in response don't exceed retrieved chunk count
    cited_ids = set(int(x) for x in re.findall(r'\[(\d+)\]', response_text))
    valid_ids = set(range(1, len(chunks) + 1))
    phantom = cited_ids - valid_ids
    if phantom:
        return False, f"Phantom citation IDs detected: {phantom}"

    # Check 2: Dangerous medical patterns
    for pattern_re, reason in _DANGEROUS_RE:
        if pattern_re.search(response_text):
            return False, reason

    return True, None


# ---------------------------------------------------------------------------
# M4.3.2 — Refusal message builder
# ---------------------------------------------------------------------------
def build_refusal_message(language: str, db: Session) -> str:
    """
    Build localized refusal message with publisher list derived from active corpus.
    Publishers derived from DB — not hard-coded.
    """
    publishers = [
        row[0] for row in
        db.query(MedicalDocument.publisher)
        .filter(MedicalDocument.review_status == "APPROVED")
        .distinct()
        .all()
    ]
    publisher_str = " / ".join(sorted(set(publishers))) if publishers else "verified medical sources"

    messages = {
        "en": (
            f"I could not find sufficient information in the verified medical sources "
            f"available to MedGuide AI ({publisher_str}) to answer your query. "
            "Please consult a qualified healthcare professional or visit your nearest "
            "primary health centre."
        ),
        "hi": (
            f"MedGuide AI के सत्यापित चिकित्सा स्रोतों ({publisher_str}) में "
            "आपकी पूछताछ के लिए पर्याप्त जानकारी नहीं मिली। "
            "कृपया किसी योग्य स्वास्थ्य देखभाल पेशेवर से परामर्श लें "
            "या अपने निकटतम प्राथमिक स्वास्थ्य केंद्र पर जाएं।"
        ),
        "te": (
            f"MedGuide AI ({publisher_str}) వద్ద అందుబాటులో ఉన్న "
            "ధృవీకరించబడిన వైద్య వనరులలో మీ ప్రశ్నకు సరిపడా సమాచారం లభించలేదు. "
            "దయచేసి అర్హత కలిగిన ఆరోగ్య సంరక్షణ నిపుణుడిని సంప్రదించండి "
            "లేదా మీకు సమీపంలోని ప్రాథమిక ఆరోగ్య కేంద్రాన్ని సందర్శించండి."
        ),
    }
    return messages.get(language, messages["en"])


# ---------------------------------------------------------------------------
# Emergency response builder (deterministic — no LLM)
# ---------------------------------------------------------------------------
def build_emergency_response(language: str, red_flags: List[str]) -> str:
    """
    Deterministic emergency escalation response.
    The LLM is NOT involved in emergency decisions.
    """
    messages = {
        "en": (
            "⚠️ IMPORTANT: The symptoms you described may require immediate medical attention. "
            "Please contact emergency medical services or go to your nearest hospital immediately. "
            "Do not delay seeking care. If in India, call 108 (national ambulance) or 112 (emergency)."
        ),
        "hi": (
            "⚠️ महत्वपूर्ण: आपने जो लक्षण बताए हैं उन्हें तत्काल चिकित्सा ध्यान की आवश्यकता हो सकती है। "
            "कृपया आपातकालीन चिकित्सा सेवाओं से संपर्क करें या तुरंत निकटतम अस्पताल जाएं। "
            "भारत में: 108 (एम्बुलेंस) या 112 (आपातकाल) पर कॉल करें।"
        ),
        "te": (
            "⚠️ ముఖ్యమైనది: మీరు వివరించిన లక్షణాలకు తక్షణ వైద్య సహాయం అవసరం కావచ్చు. "
            "వెంటనే అత్యవసర వైద్య సేవలను సంప్రదించండి లేదా సమీపంలోని ఆసుపత్రికి వెళ్ళండి. "
            "భారతదేశంలో: 108 (అంబులెన్స్) లేదా 112 (అత్యవసర) కి కాల్ చేయండి."
        ),
    }
    return messages.get(language, messages["en"])


# ---------------------------------------------------------------------------
# M4.3.9 — Main pipeline entry point
# ---------------------------------------------------------------------------
def process_ai_chat_query(
    db: Session,
    patient_profile: PatientProfile,
    req: AIChatRequest,
    gateway: Optional[AIGateway] = None,
) -> AIChatResponse:
    """
    Complete Grounded RAG + AI Health Companion pipeline.
    See module docstring for full architecture.
    """
    # Step 1: Language resolution
    language = resolve_language(req.language, req.message)

    # Step 2: Get or create conversation
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
            language=language,
            status="ACTIVE",
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Step 3: Save user message
    user_msg = ConversationMessage(
        conversation_id=conversation.id,
        sender_type="PATIENT",
        content=req.message,
    )
    db.add(user_msg)
    db.commit()

    # Step 4: Safety / Red-Flag Gate (deterministic — before any retrieval or LLM)
    red_flags = detect_red_flags(req.message)
    response_type = classify_response_type(req.message, red_flags)

    if response_type == ResponseType.EMERGENCY:
        ai_response_text = build_emergency_response(language, red_flags)
        _save_ai_message(db, conversation, ai_response_text, language, 0, True)
        return AIChatResponse(
            conversation_id=conversation.id,
            message=ai_response_text,
            language=language,
            response_type=ResponseType.EMERGENCY,
            refusal_triggered=False,
            red_flags=red_flags,
            sources=[],
        )

    # Step 5: RAG Retrieval (two-stage: top-K candidates → threshold filter)
    chunks = retrieve_relevant_chunks(
        db=db,
        query=req.message,
        top_k_candidates=RAG_TOP_K_CANDIDATES,
        top_k_context=RAG_TOP_K_CONTEXT,
        similarity_threshold=RAG_SIMILARITY_THRESHOLD,
    )
    logger.info(
        f"[RAG] Query retrieved {len(chunks)} chunks "
        f"(threshold={RAG_SIMILARITY_THRESHOLD}, top_k={RAG_TOP_K_CANDIDATES})"
    )

    # Step 6: Evidence sufficiency gate
    if not is_sufficient_evidence(chunks):
        refusal_text = build_refusal_message(language, db)
        _save_ai_message(db, conversation, refusal_text, language, 0, False)
        return AIChatResponse(
            conversation_id=conversation.id,
            message=refusal_text,
            language=language,
            response_type=ResponseType.REFUSAL,
            refusal_triggered=True,
            red_flags=[],
            sources=[],
        )

    # Step 7: Conversation memory (last 5 turns, for context only)
    history = get_conversation_history(db, conversation, max_turns=CONVERSATION_HISTORY_TURNS)
    history_text = format_history_for_prompt(history)

    # Step 8: Build grounded prompt
    system_prompt, user_prompt = build_grounded_prompt(
        query=req.message,
        chunks=chunks,
        language=language,
        history=history_text,
    )

    # Step 9: LLM generation via AIGateway
    if gateway is None:
        gateway = create_ai_gateway()

    try:
        raw_response = gateway.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=800,
            temperature=0.2,
        )
        logger.info(f"[AIGateway] Generated via {gateway.provider_name}")
    except AIGatewayError as e:
        logger.error(f"[AIGateway] Generation failed: {e}")
        # Fail safely — return refusal rather than error
        refusal_text = build_refusal_message(language, db)
        _save_ai_message(db, conversation, refusal_text, language, len(chunks), False)
        return AIChatResponse(
            conversation_id=conversation.id,
            message=refusal_text,
            language=language,
            response_type=ResponseType.REFUSAL,
            refusal_triggered=True,
            red_flags=[],
            sources=build_citations(chunks),
        )

    # Step 10: Output validation (citation + safety check)
    is_valid, failure_reason = validate_llm_output(raw_response, chunks)
    if not is_valid:
        logger.warning(f"[OutputValidator] Response failed validation: {failure_reason}")
        refusal_text = build_refusal_message(language, db)
        _save_ai_message(db, conversation, refusal_text, language, len(chunks), False)
        return AIChatResponse(
            conversation_id=conversation.id,
            message=refusal_text,
            language=language,
            response_type=ResponseType.REFUSAL,
            refusal_triggered=True,
            red_flags=[],
            sources=build_citations(chunks),
        )

    # Step 11: Build citations and return final grounded response
    citations = build_citations(chunks)
    _save_ai_message(db, conversation, raw_response, language, len(chunks), False)

    return AIChatResponse(
        conversation_id=conversation.id,
        message=raw_response,
        language=language,
        response_type=response_type,
        refusal_triggered=False,
        red_flags=[],
        sources=citations,
    )


def _save_ai_message(
    db: Session,
    conversation: Conversation,
    content: str,
    language: str,
    sources_count: int,
    is_emergency: bool,
) -> None:
    """Save AI companion response to conversation history."""
    ai_msg = ConversationMessage(
        conversation_id=conversation.id,
        sender_type="AI_COMPANION",
        content=content,
        metadata_={
            "language": language,
            "sources_count": sources_count,
            "is_emergency": is_emergency,
            "rag_grounded": sources_count > 0,
        },
    )
    db.add(ai_msg)
    db.commit()
