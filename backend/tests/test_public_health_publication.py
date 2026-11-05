from unittest.mock import Mock
import pytest
from app.db import publish_public_health as module


def test_publication_checks_text_not_review_flag(monkeypatch):
    page=Mock();page.extract_text.return_value="Reported cases in 2024: 100.\nReporting was incomplete."
    monkeypatch.setattr(module,"PdfReader",lambda path:Mock(pages=[page]))
    passage={"page":1,"content":"Reported cases in 2024: 100. Reporting was incomplete.","verbatim_verified":True}
    module.verify_pdf_passages("unused",[passage])
    with pytest.raises(ValueError,match="not verbatim"):
        module.verify_pdf_passages("unused",[passage | {"content":"Reported cases in 2024: 1000."}])
    with pytest.raises(ValueError,match="nonexistent"):
        module.verify_pdf_passages("unused",[passage | {"page":2}])


def test_empty_extraction_cannot_be_approved(monkeypatch):
    page=Mock();page.extract_text.return_value=""
    monkeypatch.setattr(module,"PdfReader",lambda path:Mock(pages=[page]))
    with pytest.raises(ValueError,match="not verbatim"):
        module.verify_pdf_passages("unused",[{"page":1,"content":"Invented evidence","verbatim_verified":True}])


def test_review_metadata_changes_publication_identity():
    source={"geography":"India","reporting_end":"2016-12-31"}
    passages=[{"page":1,"content":"Synthetic evidence"}]
    assert module.publication_hash(source,passages)==module.publication_hash(dict(reversed(list(source.items()))),passages)
    assert module.publication_hash(source,passages)!=module.publication_hash(source | {"reporting_end":"2024-12-31"},passages)
