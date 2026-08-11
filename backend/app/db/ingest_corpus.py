"""
MedGuide AI — Official Medical Corpus Ingestion Script
=======================================================
Idempotent one-time script to ingest all 4 verified official PDF documents
into the PostgreSQL pgvector knowledge base.

Ingestion order:
  1. WHO Hypertension Guidelines 2021    (already in DB — will be skipped)
  2. ICMR STW Paediatric & EPTB 2022    (already in DB — will be skipped)
  3. WHO Guidelines for Malaria 2025    (NEW — will be ingested)
  4. WHO PEN Guidelines 2020            (NEW — will be ingested, large PDF ~644 pages)

Also updates publication_date and version on all 4 MedicalDocument records.

Usage (from project root):
  backend\\.venv\\Scripts\\python.exe backend/app/db/ingest_corpus.py

Provenance chain:
  Official Publisher -> Authentic PDF -> SHA-256 -> Page/Section -> Chunk -> 384-d Embedding -> pgvector
"""

import os
import sys
from datetime import date
from pathlib import Path

# Force UTF-8 output on Windows to avoid cp1252 encoding errors
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Script is at: backend/app/db/ingest_corpus.py
# BACKEND_DIR = backend/
# PROJECT_ROOT = project root (one level above backend)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))
os.chdir(str(PROJECT_ROOT))  # PDF paths are relative to project root

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from app.db.session import SessionLocal
from app.models.knowledge import MedicalDocument
from app.services.knowledge_service import ingest_official_medical_document

# ---------------------------------------------------------------------------
# AUTHORITATIVE CORPUS — SOURCE_METADATA_REGISTER.md v4.3
# All document_ids are stable UUIDs fixed at first ingestion.
# ---------------------------------------------------------------------------
OFFICIAL_CORPUS = [
    {
        "doc_metadata": {
            "document_id": "d4a4b5c6-7d8e-9f0a-1b2c-3d4e5f6a7b8c",
            "title": "Guideline for the Pharmacological Treatment of Hypertension in Adults",
            "publisher": "World Health Organization",
            "source_url": "https://www.who.int/publications/i/item/9789240033986",
            "language": "en",
            "provenance_status": "VERIFIED_OFFICIAL_DOCUMENT",
            "publication_date": date(2021, 1, 1),
            "version": "2021",
            "license": "CC BY-NC-SA 3.0 IGO",
        },
        "pdf_path": "docs/data/medical_guidelines/WHO_Hypertension_Guidelines_2021.pdf",
        "sha256": "57f6376d5c9bc4ea6c44873625547c8a5443d5a6ad8c8c422733681563db05fb",
    },
    {
        "doc_metadata": {
            "document_id": "d3a3b4c5-6d7e-8f9a-0b1c-2d3e4f5a6b7c",
            "title": "Standard Treatment Workflows of India: Paediatric Tuberculosis",
            "publisher": "Indian Council of Medical Research",
            "source_url": "https://www.icmr.gov.in/icmrobject/custom_data/pdf/downloadable-books/ICMR_STW_PTB_EPTB.pdf",
            "language": "en",
            "provenance_status": "VERIFIED_OFFICIAL_DOCUMENT",
            "publication_date": date(2022, 1, 1),
            "version": "2022",
            "license": "Government of India Official Publication",
        },
        "pdf_path": "docs/data/medical_guidelines/ICMR_STW_Paediatric_EPTB_2022.pdf",
        "sha256": "95f06c22b936875baf358853e598e4425dfc667d1857fae8d64c9d3884490ad2",
    },
    {
        "doc_metadata": {
            "document_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "title": "WHO Guidelines for Malaria",
            "publisher": "World Health Organization",
            "source_url": "https://doi.org/10.2471/B09514",
            "language": "en",
            "provenance_status": "VERIFIED_OFFICIAL_DOCUMENT",
            "publication_date": date(2025, 8, 13),
            "version": "13 August 2025",
            "license": "CC BY-NC-SA 3.0 IGO",
        },
        "pdf_path": "docs/data/medical_guidelines/WHO_Guidelines_for_Malaria_2025.pdf",
        "sha256": "41c1cb923973ab0d5556d83951ec43374d200c60e4c21a196007dd3c9151ce72",
    },
    {
        "doc_metadata": {
            "document_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
            "title": "Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care",
            "publisher": "World Health Organization",
            "source_url": "https://www.who.int/publications/i/item/9789240002876",
            "language": "en",
            "provenance_status": "VERIFIED_OFFICIAL_DOCUMENT",
            "publication_date": date(2020, 1, 1),
            "version": "2020",
            "license": "CC BY-NC-SA 3.0 IGO",
        },
        "pdf_path": "docs/data/medical_guidelines/WHO_PEN_Guidelines_2020.pdf",
        "sha256": "25c2761500d7c839aa3622a96481542f53f3b56348cc429931cc4c963ef17b1d",
    },
]


def verify_sha256(pdf_path: str, expected_hash: str) -> bool:
    """Verify PDF file matches its registered SHA-256 hash before ingestion."""
    import hashlib
    sha256 = hashlib.sha256()
    with open(pdf_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    actual = sha256.hexdigest().lower()
    return actual == expected_hash.lower()


def update_provenance_metadata(db, doc_id: str, pub_date: date, version: str) -> None:
    """Populate publication_date and version on an existing MedicalDocument record."""
    doc = db.query(MedicalDocument).filter(
        MedicalDocument.id == doc_id
    ).first()
    if doc:
        doc.publication_date = pub_date
        doc.version = version
        db.add(doc)
    else:
        print(f"  [WARN] Could not find document {doc_id} to update metadata.")


def run_ingestion():
    print("=" * 70)
    print("MedGuide AI — Official Medical Corpus Ingestion")
    print("=" * 70)
    print()

    db = SessionLocal()
    total_ingested = 0
    total_skipped = 0
    total_chunks = 0
    results = []

    try:
        for item in OFFICIAL_CORPUS:
            meta = item["doc_metadata"]
            pdf_path = item["pdf_path"]
            expected_sha256 = item["sha256"]
            title = meta["title"]

            print(f"[DOC] {title}")
            print(f"      Publisher : {meta['publisher']}")
            print(f"      PDF Path  : {pdf_path}")

            # 1. Verify file exists
            if not Path(pdf_path).exists():
                print(f"  [ERROR] PDF not found at path: {pdf_path}")
                print(f"          Skipping — do not ingest missing file.")
                results.append({"title": title, "status": "ERROR_FILE_NOT_FOUND", "chunks": 0})
                print()
                continue

            # 2. Verify SHA-256 before ingestion (provenance guard)
            print(f"      Verifying SHA-256 hash...")
            if not verify_sha256(pdf_path, expected_sha256):
                print(f"  [ERROR] SHA-256 MISMATCH — file may be corrupted or tampered.")
                print(f"          Expected: {expected_sha256}")
                print(f"          Refusing to ingest.")
                results.append({"title": title, "status": "ERROR_HASH_MISMATCH", "chunks": 0})
                print()
                continue

            print(f"      SHA-256   : VERIFIED [OK]")

            # 3. Ingest (duplicate-safe)
            print(f"      Ingesting... (this may take several minutes for large PDFs)")
            result = ingest_official_medical_document(db, meta, pdf_path)
            status = result["status"]

            if status == "SUCCESS":
                chunks = result["chunks_generated"]
                total_chunks += chunks
                total_ingested += 1
                print(f"      Status    : SUCCESS -- {chunks} chunks ingested, {result['pages_extracted']} pages")
            elif status == "SKIPPED_DUPLICATE":
                total_skipped += 1
                print(f"      Status    : SKIPPED (already in database)")
            else:
                print(f"      Status    : {status}")

            results.append({"title": title, "status": status, "chunks": result.get("chunks_generated", 0)})

            # 4. Always update publication_date and version (idempotent)
            update_provenance_metadata(
                db,
                meta["document_id"],
                meta["publication_date"],
                meta["version"],
            )
            db.commit()
            print()

        # Final DB verification
        print("=" * 70)
        print("FINAL CORPUS VERIFICATION")
        print("=" * 70)

        from app.models.knowledge import KnowledgeChunk
        docs_count = db.query(MedicalDocument).filter(
            MedicalDocument.review_status == "APPROVED"
        ).count()
        chunks_count = db.query(KnowledgeChunk).count()
        docs_with_pubdate = db.query(MedicalDocument).filter(
            MedicalDocument.publication_date.isnot(None)
        ).count()
        docs_with_version = db.query(MedicalDocument).filter(
            MedicalDocument.version.isnot(None)
        ).count()

        import psycopg
        from dotenv import load_dotenv
        host = os.getenv("POSTGRES_SERVER", "127.0.0.1")
        port = os.getenv("POSTGRES_PORT", "5432")
        user = os.getenv("POSTGRES_USER", "postgres")
        password = os.getenv("POSTGRES_PASSWORD", "")
        dbname = os.getenv("POSTGRES_DB", "medguide_ai_dev")
        connstring = f"host={host} port={port} user={user} password={password} dbname={dbname}"

        with psycopg.connect(connstring) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM knowledge_chunks WHERE embedding IS NOT NULL;")
                with_embed = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM knowledge_chunks WHERE embedding IS NULL;")
                without_embed = cur.fetchone()[0]
                cur.execute("""
                    SELECT document_id, COUNT(*) as cnt
                    FROM knowledge_chunks GROUP BY document_id ORDER BY document_id;
                """)
                chunk_by_doc = cur.fetchall()
                cur.execute("""
                    SELECT md.title, md.publisher, md.publication_date, md.version, COUNT(kc.id) as chunks
                    FROM medical_documents md
                    LEFT JOIN knowledge_chunks kc ON kc.document_id = md.id
                    WHERE md.review_status = 'APPROVED'
                    GROUP BY md.id, md.title, md.publisher, md.publication_date, md.version
                    ORDER BY md.created_at;
                """)
                doc_details = cur.fetchall()

        print(f"\nApproved MedicalDocuments : {docs_count}")
        print(f"Total KnowledgeChunks     : {chunks_count}")
        print(f"Chunks with embeddings    : {with_embed}")
        print(f"Chunks WITHOUT embeddings : {without_embed}")
        print(f"Docs with publication_date: {docs_with_pubdate}")
        print(f"Docs with version         : {docs_with_version}")
        print()
        print("Per-document breakdown:")
        for d in doc_details:
            print(f"  [{d[1]}]")
            print(f"    Title   : {d[0]}")
            print(f"    Pub Date: {d[2]}  Version: {d[3]}")
            print(f"    Chunks  : {d[4]}")
            print()

        # Assertions
        print("ASSERTIONS:")
        assert docs_count == 4, f"Expected 4 documents, got {docs_count}"
        print(f"  [PASS] docs_count == 4")
        assert chunks_count > 0, "Expected chunks > 0"
        print(f"  [PASS] chunks_count > 0 ({chunks_count})")
        assert without_embed == 0, f"Expected 0 chunks without embedding, got {without_embed}"
        print(f"  [PASS] all chunks have embeddings")
        assert docs_with_pubdate == 4, f"Expected 4 docs with publication_date, got {docs_with_pubdate}"
        print(f"  [PASS] all 4 docs have publication_date")
        assert docs_with_version == 4, f"Expected 4 docs with version, got {docs_with_version}"
        print(f"  [PASS] all 4 docs have version")

        print()
        print("=" * 70)
        print("INGESTION COMPLETE — CORPUS IS AUTHORITATIVE AND VERIFIED")
        print("=" * 70)
        print(f"  Newly ingested : {total_ingested}")
        print(f"  Skipped (dup)  : {total_skipped}")
        print(f"  New chunks     : {total_chunks}")
        print(f"  Total chunks   : {chunks_count}")

    except Exception as e:
        print(f"\n[FATAL ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    run_ingestion()
