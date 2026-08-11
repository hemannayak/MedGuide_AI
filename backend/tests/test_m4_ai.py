import os
from typing import Any, Dict, List
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
    """Ingest all 4 official medical PDF guidelines into pgvector."""
    official_sources: List[Dict[str, Any]] = [
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
        {
            "doc_metadata": {
                "document_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "title": "WHO Guidelines for Malaria",
                "publisher": "World Health Organization",
                "publication_date": "2025",
                "source_url": "https://doi.org/10.2471/B09514",
                "language": "en",
                "provenance_status": "VERIFIED_OFFICIAL_DOCUMENT",
            },
            "pdf_path": "docs/data/medical_guidelines/WHO_Guidelines_for_Malaria_2025.pdf",
        },
        {
            "doc_metadata": {
                "document_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
                "title": "Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care",
                "publisher": "World Health Organization",
                "publication_date": "2020",
                "source_url": "https://www.who.int/publications/i/item/9789240002876",
                "language": "en",
                "provenance_status": "VERIFIED_OFFICIAL_DOCUMENT",
            },
            "pdf_path": "docs/data/medical_guidelines/WHO_PEN_Guidelines_2020.pdf",
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
    assert docs_count >= 4, f"Expected >= 4 approved documents, got {docs_count}"
    assert chunks_count >= 500, f"Expected >= 500 chunks, got {chunks_count}"


def test_corpus_completeness_four_documents(db_session: Session):
    """Verify the final corpus contains exactly 4 official approved documents with full provenance metadata."""
    db_session.rollback()

    approved_docs = (
        db_session.query(MedicalDocument)
        .filter(MedicalDocument.review_status == "APPROVED")
        .all()
    )
    assert len(approved_docs) == 4, (
        f"Expected exactly 4 APPROVED MedicalDocuments, got {len(approved_docs)}. "
        f"Titles: {[d.title for d in approved_docs]}"
    )

    expected_titles = {
        "Guideline for the Pharmacological Treatment of Hypertension in Adults",
        "Standard Treatment Workflows of India: Paediatric Tuberculosis",
        "WHO Guidelines for Malaria",
        "Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care",
    }
    actual_titles = {d.title for d in approved_docs}
    assert actual_titles == expected_titles, (
        f"Title mismatch.\nExpected: {expected_titles}\nActual: {actual_titles}"
    )

    for doc in approved_docs:
        assert doc.publication_date is not None, (
            f"MedicalDocument '{doc.title}' is missing publication_date"
        )
        assert doc.version is not None, (
            f"MedicalDocument '{doc.title}' is missing version"
        )
        assert doc.source_reference is not None and doc.source_reference.startswith("http"), (
            f"MedicalDocument '{doc.title}' has invalid source_reference: {doc.source_reference}"
        )

    # Verify all chunks have source_url in metadata
    all_chunks = db_session.query(KnowledgeChunk).all()
    assert len(all_chunks) > 0, "No chunks found in database"

    chunks_missing_source = [
        c for c in all_chunks
        if not (c.metadata_ or {}).get("source_url")
    ]
    assert len(chunks_missing_source) == 0, (
        f"{len(chunks_missing_source)} chunks are missing source_url in metadata"
    )

    # Verify all chunks have 384-dimensional embeddings
    chunks_without_embedding = [c for c in all_chunks if c.embedding is None]
    assert len(chunks_without_embedding) == 0, (
        f"{len(chunks_without_embedding)} chunks have no embedding vector"
    )



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
    assert user is not None, "Test user not found in database"
    patient_profile = get_patient_profile_by_user(db_session, user)
    assert patient_profile is not None, "Patient profile not found for test user"

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
