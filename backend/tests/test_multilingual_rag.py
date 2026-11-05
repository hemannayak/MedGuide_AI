"""
MedGuide AI — Multilingual RAG Architecture Tests (Option C: Dual Retrieval with Fallback & Rerank)
===================================================================================================
Tests covering:
  1. Direct Telugu retrieval (strong match bypasses translation)
  2. Weak Telugu retrieval triggers translation bridge
  3. English retrieval fallback produces correct chunks
  4. Evidence merge & deduplication
  5. Reranking by combined weighted score (0.4 direct + 0.6 English)
  6. Preservation of original Telugu query
  7. Emergency input bypassing translation/RAG/LLM
  8. Sarvam unavailable / network failure behavior
  9. Offline behavior when translation is disabled (DisabledTranslationGateway)
  10. English behavior remains unchanged (100% direct)
  11. Hindi behavior remains unchanged (strong direct bypasses translation)
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy.orm import Session

from app.models.conversations import Conversation, ConversationMessage
from app.models.profiles import PatientProfile
from app.schemas.ai import AIChatRequest, ResponseType
from app.services.ai_service import (
    RAG_SIMILARITY_THRESHOLD,
    RAG_TRANSLATION_TRIGGER_THRESHOLD,
    process_ai_chat_query,
    retrieve_multilingual_chunks,
    retrieve_relevant_chunks,
)
from app.services.translation_service import (
    DisabledTranslationGateway,
    MockTranslationGateway,
    SarvamTranslationGateway,
    TranslationError,
    create_translation_gateway,
)


def _make_mock_chunk(
    chunk_id: Optional[str] = None,
    similarity: float = 0.75,
    title: str = "WHO Guidelines for Malaria",
    content: str = "Artemisinin-based combination therapy is recommended for malaria.",
) -> dict:
    return {
        "chunk_id": uuid.UUID(chunk_id) if chunk_id else uuid.uuid4(),
        "document_id": uuid.uuid4(),
        "content": content,
        "metadata": {"page_number": 12, "section_title": "Treatment"},
        "title": title,
        "publisher": "World Health Organization",
        "source_url": "https://who.int/guideline.pdf",
        "language": "en",
        "publication_date": "2023-01-01",
        "similarity": similarity,
    }


def _setup_mock_db():
    db = MagicMock(spec=Session)
    def mock_add(obj):
        if hasattr(obj, "id") and getattr(obj, "id") is None:
            obj.id = uuid.uuid4()
    db.add.side_effect = mock_add

    def mock_query(model):
        q = MagicMock()
        q.filter.return_value = q
        q.distinct.return_value = q
        q.order_by.return_value = q
        q.limit.return_value = q
        q.first.return_value = None
        if model == ConversationMessage:
            q.all.return_value = []
        else:
            q.all.return_value = [("World Health Organization",)]
        return q

    db.query.side_effect = mock_query
    return db


# ---------------------------------------------------------------------------
# Test 1: Direct Telugu Retrieval with Strong Match (Bypasses Translation)
# ---------------------------------------------------------------------------
def test_direct_telugu_strong_match_bypasses_translation():
    db = _setup_mock_db()
    strong_chunk = _make_mock_chunk(similarity=0.78, title="Guideline for Hypertension")
    mock_trans_gw = MagicMock(spec=MockTranslationGateway)

    with patch("app.services.ai_service.retrieve_relevant_chunks", return_value=[strong_chunk]) as mock_ret:
        chunks = retrieve_multilingual_chunks(
            db=db,
            query="హైపర్ టెన్షన్ చికిత్స",
            language="te",
            translation_gateway=mock_trans_gw,
            trigger_threshold=0.65,
        )

        assert len(chunks) == 1
        assert chunks[0]["title"] == "Guideline for Hypertension"
        assert chunks[0]["similarity"] == 0.78
        # Translation bridge should NOT be called when direct similarity >= trigger_threshold
        mock_trans_gw.translate.assert_not_called()
        # Direct retrieval was called once with native query
        mock_ret.assert_called_once_with(
            db=db,
            query="హైపర్ టెన్షన్ చికిత్స",
            top_k_candidates=10,
            top_k_context=4,
            similarity_threshold=RAG_SIMILARITY_THRESHOLD,
        )


# ---------------------------------------------------------------------------
# Test 2: Weak Telugu Retrieval Triggers Translation Bridge
# ---------------------------------------------------------------------------
def test_weak_telugu_triggers_translation_bridge():
    db = _setup_mock_db()
    weak_chunk = _make_mock_chunk(similarity=0.48, title="Weak Candidate")
    strong_en_chunk = _make_mock_chunk(similarity=0.82, title="WHO Guidelines for Malaria")

    mock_trans_gw = MagicMock(spec=MockTranslationGateway)
    mock_trans_gw.translate.return_value = "How is falciparum malaria transmitted?"

    def side_effect_retrieve(db, query, **kwargs):
        if "మలేరియా" in query:
            return [weak_chunk]
        elif "malaria" in query.lower():
            return [strong_en_chunk]
        return []

    with patch("app.services.ai_service.retrieve_relevant_chunks", side_effect=side_effect_retrieve):
        chunks = retrieve_multilingual_chunks(
            db=db,
            query="ఫాల్సిపారమ్ మలేరియా ఎలా వ్యాపిస్తుంది?",
            language="te",
            translation_gateway=mock_trans_gw,
            trigger_threshold=0.65,
        )

        # Translation should have been invoked
        mock_trans_gw.translate.assert_called_once_with(
            "ఫాల్సిపారమ్ మలేరియా ఎలా వ్యాపిస్తుంది?",
            source_language="te",
            target_language="en",
        )
        assert len(chunks) == 2
        # Top chunk should be the strong English match after reranking
        assert chunks[0]["title"] == "WHO Guidelines for Malaria"


# ---------------------------------------------------------------------------
# Test 3: English Retrieval Fallback Produces Correct Chunks
# ---------------------------------------------------------------------------
def test_english_retrieval_fallback_produces_correct_chunks():
    db = _setup_mock_db()
    en_chunk = _make_mock_chunk(similarity=0.85, title="Paediatric Tuberculosis Workflow")

    mock_trans_gw = MockTranslationGateway({
        "టీబీ చికిత్స": "TB treatment workflow in children"
    })

    def side_effect_retrieve(db, query, **kwargs):
        if "టీబీ" in query:
            return []  # Direct Telugu yielded 0 results
        elif "TB" in query:
            return [en_chunk]
        return []

    with patch("app.services.ai_service.retrieve_relevant_chunks", side_effect=side_effect_retrieve):
        chunks = retrieve_multilingual_chunks(
            db=db,
            query="టీబీ చికిత్స",
            language="te",
            translation_gateway=mock_trans_gw,
        )

        assert len(chunks) == 1
        assert chunks[0]["title"] == "Paediatric Tuberculosis Workflow"
        assert chunks[0]["similarity"] == 0.85


# ---------------------------------------------------------------------------
# Test 4: Evidence Merge & Deduplication
# ---------------------------------------------------------------------------
def test_evidence_merge_and_deduplication():
    db = _setup_mock_db()
    shared_id = uuid.uuid4()
    
    # Direct candidate
    chunk_direct = _make_mock_chunk(chunk_id=str(shared_id), similarity=0.52, title="Shared Malaria Chunk")
    # English candidate (same chunk ID, higher similarity)
    chunk_en = _make_mock_chunk(chunk_id=str(shared_id), similarity=0.88, title="Shared Malaria Chunk")
    # Unique English candidate
    unique_en = _make_mock_chunk(similarity=0.79, title="Unique Malaria Chunk")

    mock_trans_gw = MagicMock()
    mock_trans_gw.translate.return_value = "Translated English Query"

    def side_effect_retrieve(db, query, **kwargs):
        if query == "Telugu Query":
            return [chunk_direct]
        elif query == "Translated English Query":
            return [chunk_en, unique_en]
        return []

    with patch("app.services.ai_service.retrieve_relevant_chunks", side_effect=side_effect_retrieve):
        chunks = retrieve_multilingual_chunks(
            db=db,
            query="Telugu Query",
            language="te",
            translation_gateway=mock_trans_gw,
        )

        # Total 2 unique chunks (deduplicated by chunk_id)
        assert len(chunks) == 2
        chunk_ids = [c["chunk_id"] for c in chunks]
        assert len(set(chunk_ids)) == 2
        # Max similarity should be preserved on the shared chunk
        shared_res = next(c for c in chunks if c["chunk_id"] == shared_id)
        assert shared_res["similarity"] == 0.88


# ---------------------------------------------------------------------------
# Test 5: Reranking by Combined Weighted Score (0.4 direct + 0.6 English)
# ---------------------------------------------------------------------------
def test_reranking_by_combined_score():
    db = _setup_mock_db()
    
    id_a = uuid.uuid4()
    id_b = uuid.uuid4()
    
    # Chunk A: in both direct (0.60) and English (0.70) -> combined = (0.60*0.4) + (0.70*0.6) = 0.24 + 0.42 = 0.66
    chunk_a_direct = _make_mock_chunk(chunk_id=str(id_a), similarity=0.60, title="Chunk A")
    chunk_a_en = _make_mock_chunk(chunk_id=str(id_a), similarity=0.70, title="Chunk A")
    
    # Chunk B: only in English (0.80) -> combined = 0.80 * 0.6 = 0.48
    chunk_b_en = _make_mock_chunk(chunk_id=str(id_b), similarity=0.80, title="Chunk B")

    mock_trans_gw = MagicMock()
    mock_trans_gw.translate.return_value = "En Query"

    def side_effect_retrieve(db, query, **kwargs):
        if query == "Te Query":
            return [chunk_a_direct]
        else:
            return [chunk_a_en, chunk_b_en]

    with patch("app.services.ai_service.retrieve_relevant_chunks", side_effect=side_effect_retrieve):
        chunks = retrieve_multilingual_chunks(
            db=db,
            query="Te Query",
            language="te",
            translation_gateway=mock_trans_gw,
        )

        # Chunk A has higher combined score (0.66 > 0.48) so it must be rank 1
        assert len(chunks) == 2
        assert chunks[0]["chunk_id"] == id_a
        assert chunks[1]["chunk_id"] == id_b


# ---------------------------------------------------------------------------
# Test 6: Preservation of Original Telugu Query
# ---------------------------------------------------------------------------
def test_preservation_of_original_telugu_query():
    db = _setup_mock_db()
    patient_profile = MagicMock(spec=PatientProfile)
    patient_profile.id = uuid.uuid4()

    te_query = "పిల్లలలో పల్మనరీ టీబీ చికిత్స ఎన్ని నెలలు కొనసాగించాలి?"
    req = AIChatRequest(message=te_query, language="te")

    mock_chunk = _make_mock_chunk(similarity=0.80)
    mock_gateway = MagicMock()
    mock_gateway.provider_name = "mock"
    mock_gateway.generate.return_value = '{"answer": "చికిత్స 6 నెలలు కొనసాగించాలి [1]."}'

    with patch("app.services.ai_service.retrieve_relevant_chunks", return_value=[mock_chunk]):
        with patch("app.services.ai_service.create_ai_gateway", return_value=mock_gateway):
            response = process_ai_chat_query(db, patient_profile, req, gateway=mock_gateway)

            assert response.language == "te"
            # Verify system received the exact original Telugu query
            call_args = mock_gateway.generate.call_args[1]
            assert te_query in call_args["user_prompt"]


# ---------------------------------------------------------------------------
# Test 7: Emergency Input Bypasses Translation, RAG, and LLM
# ---------------------------------------------------------------------------
def test_emergency_bypasses_translation_and_rag():
    db = _setup_mock_db()
    patient_profile = MagicMock(spec=PatientProfile)
    patient_profile.id = uuid.uuid4()

    # Telugu emergency query: acute chest pain
    req = AIChatRequest(message="తీవ్రమైన ఛాతి నొప్పి మరియు ఊపిరి అందడం లేదు", language="te")

    mock_gateway = MagicMock()
    mock_trans_gw = MagicMock()

    with patch("app.services.ai_service.retrieve_multilingual_chunks") as mock_rag:
        response = process_ai_chat_query(
            db,
            patient_profile,
            req,
            gateway=mock_gateway,
            translation_gateway=mock_trans_gw,
        )

        # Neither RAG, nor Translation, nor LLM should be invoked
        mock_rag.assert_not_called()
        mock_trans_gw.translate.assert_not_called()
        mock_gateway.generate.assert_not_called()

        assert response.response_type == ResponseType.EMERGENCY
        assert "108" in response.message
        assert "112" in response.message
        assert len(response.sources) == 0


# ---------------------------------------------------------------------------
# Test 8: Sarvam Unavailable / Network Error Behavior (Graceful Fallback)
# ---------------------------------------------------------------------------
def test_sarvam_unavailable_graceful_fallback():
    db = _setup_mock_db()
    direct_chunk = _make_mock_chunk(similarity=0.55, title="Local Direct Chunk")

    # Sarvam gateway throws TranslationError due to network timeout / unconfigured key
    failing_gw = SarvamTranslationGateway(api_key="")

    with patch("app.services.ai_service.retrieve_relevant_chunks", return_value=[direct_chunk]):
        chunks = retrieve_multilingual_chunks(
            db=db,
            query="మలేరియా నివారణ ఎలా?",
            language="te",
            translation_gateway=failing_gw,
        )

        # Weak unrelated matches must not be used as medical evidence.
        assert chunks == []


# ---------------------------------------------------------------------------
# Test 9: Offline Behavior When Translation is Disabled
# ---------------------------------------------------------------------------
def test_offline_disabled_translation_behavior():
    db = _setup_mock_db()
    direct_chunk = _make_mock_chunk(similarity=0.50, title="Offline Local Chunk")
    disabled_gw = DisabledTranslationGateway()

    assert disabled_gw.is_online is False

    with patch("app.services.ai_service.retrieve_relevant_chunks", return_value=[direct_chunk]):
        chunks = retrieve_multilingual_chunks(
            db=db,
            query="ఆస్తమా నివారణ",
            language="te",
            translation_gateway=disabled_gw,
        )

        # Translation unavailability must not promote weak evidence.
        assert chunks == []


# ---------------------------------------------------------------------------
# Test 10: English Behavior Remains Unchanged (100% Direct)
# ---------------------------------------------------------------------------
def test_english_behavior_remains_unchanged():
    db = _setup_mock_db()
    en_chunk = _make_mock_chunk(similarity=0.88, title="Hypertension Guideline")
    mock_trans_gw = MagicMock()

    with patch("app.services.ai_service.retrieve_relevant_chunks", return_value=[en_chunk]) as mock_ret:
        chunks = retrieve_multilingual_chunks(
            db=db,
            query="What is the first-line medication for hypertension in adults?",
            language="en",
            translation_gateway=mock_trans_gw,
        )

        assert len(chunks) == 1
        assert chunks[0]["similarity"] == 0.88
        # English must NEVER invoke translation
        mock_trans_gw.translate.assert_not_called()
        mock_ret.assert_called_once()


# ---------------------------------------------------------------------------
# Test 11: Hindi Behavior Remains Unchanged (Strong Direct Bypasses Translation)
# ---------------------------------------------------------------------------
def test_hindi_behavior_remains_unchanged():
    db = _setup_mock_db()
    # Hindi queries natively score ~0.74 in empirical benchmarks
    hi_chunk = _make_mock_chunk(similarity=0.74, title="WHO Guidelines for Malaria")
    mock_trans_gw = MagicMock()

    with patch("app.services.ai_service.retrieve_relevant_chunks", return_value=[hi_chunk]) as mock_ret:
        chunks = retrieve_multilingual_chunks(
            db=db,
            query="मलेरिया की रोकथाम के लिए क्या उपाय हैं?",
            language="hi",
            translation_gateway=mock_trans_gw,
            trigger_threshold=0.65,
        )

        assert len(chunks) == 1
        assert chunks[0]["title"] == "WHO Guidelines for Malaria"
        # Hindi similarity 0.74 >= 0.65 -> translation is bypassed
        mock_trans_gw.translate.assert_not_called()
        mock_ret.assert_called_once()
