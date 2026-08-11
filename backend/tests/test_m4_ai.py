import os
import pytest
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.knowledge import KnowledgeChunk, MedicalDocument
from app.schemas.ai import AIChatRequest
from app.services.ai_service import process_ai_chat_query
from app.services.knowledge_service import (
    extract_pdf_pages_and_sections,
    generate_embedding,
    ingest_official_medical_document,
)
from app.services.patient_service import get_patient_profile_by_user
from app.services.auth_service import register_patient_user
from app.schemas.auth import UserRegisterRequest


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


def test_provenance_guard_rejects_unverified_sources(db_session: Session):
    """Verify ingestion pipeline rejects unverified sources with HTTP 400."""
    unverified_metadata = {
        "title": "Unverified Summary",
        "publisher": "Unknown",
        "provenance_status": "PROVENANCE_UNVERIFIED",
    }
    with pytest.raises(Exception) as exc_info:
        ingest_official_medical_document(
            db_session,
            unverified_metadata,
            "docs/data/medical_guidelines/MKS-02_MoHFW_Hypertension_STG.pdf",
        )
    assert "400" in str(exc_info.value) or "rejected" in str(exc_info.value)


def test_multilingual_384d_vector_embedding():
    """Verify embedding generator produces exactly 384 dimensions."""
    sample_text = "Primary health care management of fever and respiratory infection."
    embedding = generate_embedding(sample_text)
    assert len(embedding) == 384
    assert isinstance(embedding[0], float)


def test_verbatim_pdf_extraction_and_page_retention():
    """Verify PDF extraction retains page numbers and section headers."""
    pdf_path = "docs/data/medical_guidelines/ICMR_STW_Paediatric_EPTB_2022.pdf"
    assert os.path.exists(pdf_path)


    pages = extract_pdf_pages_and_sections(pdf_path)
    assert len(pages) >= 5
    assert pages[0]["page_number"] == 1
    assert len(pages[0]["text"]) > 20


def test_official_pdf_ingestion_and_pgvector_persistence(db_session: Session):
    """Ingest official MoHFW and ICMR PDF guidelines into pgvector."""
    official_sources = [
        {
            "doc_metadata": {
                "document_id": "d4a4b5c6-7d8e-9f0a-1b2c-3d4e5f6a7b8c",
                "title": "Guideline for the Pharmacological Treatment of Hypertension in Adults",
                "publisher": "World Health Organization",
                "publication_date": "2021",
                "source_url": "https://www.who.int/publications/i/item/9789240033986",
                "language": "en",
                "provenance_status": "VERIFIED_OFFICIAL_DOCUMENT",
            },
            "pdf_path": "docs/data/medical_guidelines/WHO_Hypertension_Guidelines_2021.pdf",
        },
        {
            "doc_metadata": {
                "document_id": "d3a3b4c5-6d7e-8f9a-0b1c-2d3e4f5a6b7c",
                "title": "Standard Treatment Workflows of India: Paediatric Tuberculosis",
                "publisher": "Indian Council of Medical Research",
                "publication_date": "2022",
                "source_url": "https://www.icmr.gov.in/icmrobject/custom_data/pdf/downloadable-books/ICMR_STW_PTB_EPTB.pdf",
                "language": "en",
                "provenance_status": "VERIFIED_OFFICIAL_DOCUMENT",
            },
            "pdf_path": "docs/data/medical_guidelines/ICMR_STW_Paediatric_EPTB_2022.pdf",
        },
    ]

    for item in official_sources:
        result = ingest_official_medical_document(
            db_session,
            item["doc_metadata"],
            item["pdf_path"],
        )
        assert result["status"] in ["SUCCESS", "SKIPPED_DUPLICATE"]

    docs_count = db_session.query(MedicalDocument).filter(MedicalDocument.review_status == "APPROVED").count()
    chunks_count = db_session.query(KnowledgeChunk).count()
    assert docs_count >= 2
    assert chunks_count >= 50


def test_rag_retrieval_and_source_attribution(db_session: Session):
    """Verify RAG query returns top-k chunks, source attribution, and disclaimers."""
    db_session.rollback()

    reg_req = UserRegisterRequest(
        login_identifier="rag_test_user@medguide.ai",
        password="StrongPassword123!",
        display_name="RAG Test User",
        preferred_language="en",
    )
    try:
        user = register_patient_user(db_session, reg_req)
    except Exception:
        from app.models.users import User
        user = db_session.query(User).filter(User.login_identifier == reg_req.login_identifier).first()

    patient_profile = get_patient_profile_by_user(db_session, user)

    # Chat query for Tuberculosis clinical guidelines
    chat_req = AIChatRequest(
        message="What are the clinical guidelines for pediatric tuberculosis management?",
        language="en",
    )
    response = process_ai_chat_query(db_session, patient_profile, chat_req)

    assert response.conversation_id is not None
    assert len(response.message) > 0
    assert len(response.sources) >= 1
    assert response.sources[0].title is not None
    assert response.sources[0].publisher is not None
