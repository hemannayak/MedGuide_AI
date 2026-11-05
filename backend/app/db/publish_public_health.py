"""Publish explicitly reviewed evidence using existing relational knowledge tables.

Usage: python -m app.db.publish_public_health path/to/reviewed-manifest.json
The manifest supplies exact reviewed passages; raw PDF extraction is not approval.
"""
import argparse
import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from pypdf import PdfReader
from sqlalchemy import text
from app.db.session import SessionLocal
from app.models.knowledge import MedicalDocument, KnowledgeChunk
from app.services.knowledge_service import generate_embedding, EMBEDDING_MODEL, EMBEDDING_REVISION
from app.services.public_health_sources import validate_public_health_source


def validate_passages(source, passages):
    validate_public_health_source(source)
    if not passages:
        raise ValueError("Reviewed passages required")
    for passage in passages:
        if not isinstance(passage.get("page"), int) or passage["page"] < 1:
            raise ValueError("Source page required")
        content = passage.get("content", "")
        if not 180 <= len(content) <= 1800:
            raise ValueError("Passage length must be 180–1800 characters")
        if not passage.get("section_title") or not passage.get("verbatim_verified"):
            raise ValueError("Verbatim passage review required")


def publish(manifest):
    # Validate the whole batch before opening a write transaction.
    for item in manifest:
        validate_passages(item["source"], item["passages"])
        path = Path(item["local_pdf"]).resolve()
        if hashlib.sha256(path.read_bytes()).hexdigest() != item["source"]["sha256"]:
            raise ValueError("Reviewed publication bytes changed")
        verify_pdf_passages(path, item["passages"])
    added = 0
    with SessionLocal() as db, db.begin():
        db.execute(text("SELECT pg_advisory_xact_lock(746928312)"))
        for item in manifest:
            source, passages = item["source"], item["passages"]
            category = "SURVEILLANCE" if source["scope"] == "population_surveillance" else "SERVICE_NAVIGATION"
            approved_status = "APPROVED_" + category
            # Passage selection is itself versioned: changed review cannot silently reuse an old index.
            selection_hash = publication_hash(source, passages)
            identity = source["source_url"] + "#" + source["sha256"] + "#" + selection_hash
            doc_id = uuid.uuid5(uuid.NAMESPACE_URL, identity)
            existing = db.get(MedicalDocument, doc_id)
            if existing:
                if len(existing.chunks) != len(passages):
                    raise ValueError("Existing publication is incomplete")
                continue
            # Retain old evidence and IDs for historical citations, but do not return
            # superseded reviews as active results. Separate publication URLs remain independent.
            db.query(MedicalDocument).filter(
                MedicalDocument.source_reference == source["source_url"],
                MedicalDocument.review_status == approved_status,
            ).update({"review_status": "SUPERSEDED_" + category}, synchronize_session=False)
            # This scoped corpus is intentionally not exposed to the patient clinical pool.
            document = MedicalDocument(id=doc_id, title=source["title"], publisher=source["publisher"],
                source_reference=source["source_url"], version=selection_hash[:32], language="en",
                topic=source["scope"], license=source["license"][:100],
                review_status=approved_status, last_reviewed_at=datetime.now(timezone.utc))
            db.add(document); db.flush()
            for index, passage in enumerate(passages):
                metadata = dict(source, page_number=passage["page"], section_title=passage["section_title"],
                    selection_sha256=selection_hash, embedding_model=EMBEDDING_MODEL,
                    embedding_revision=EMBEDDING_REVISION, embedding_dimensions=384)
                db.add(KnowledgeChunk(document_id=doc_id, chunk_index=index, content=passage["content"],
                                      embedding=generate_embedding(passage["content"]), metadata_=metadata))
            added += 1
    return {"documents_added": added, "scopes": sorted({item["source"]["scope"] for item in manifest})}


def publication_hash(source, passages):
    # Retrieval-affecting metadata is evidence, not an incidental file timestamp.
    return hashlib.sha256(json.dumps({"source": source, "passages": passages},
                                    sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()


def verify_pdf_passages(path, passages):
    """Verify source/page binding independently of a human review flag.

    Only whitespace is normalized. Numbers, punctuation and wording cannot be
    changed by the manifest. Scanned/unextractable pages require a separate
    reviewed OCR workflow and are deliberately rejected here.
    """
    reader = PdfReader(path)
    extracted = {}
    for passage in passages:
        page_index = passage["page"] - 1
        if page_index >= len(reader.pages):
            raise ValueError("Passage references a nonexistent page")
        if page_index not in extracted:
            page = reader.pages[page_index]
            variants = [page.extract_text() or ""]
            try:
                variants.append(page.extract_text(extraction_mode="layout") or "")
            except (KeyError, ValueError):
                pass  # Plain extraction still has to prove the exact passage.
            extracted[page_index] = [" ".join(value.split()) for value in variants]
        content = " ".join(passage["content"].split())
        if not content or not any(content in value for value in extracted[page_index]):
            raise ValueError("Passage is not verbatim text on its claimed PDF page")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    args = parser.parse_args()
    print(json.dumps(publish(json.loads(args.manifest.read_text(encoding="utf-8")))))
