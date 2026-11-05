"""Real pgvector filtering with synthetic rows rolled back after the test."""
import uuid
from app.models.knowledge import MedicalDocument, KnowledgeChunk
from app.schemas.public_health import CareAccessSearch, PublicHealthSearch
from app.services import public_health_retrieval


def test_surveillance_search_respects_scope_geography_and_period(db_session, monkeypatch):
    vector = [1.0] + [0.0] * 383
    monkeypatch.setattr(public_health_retrieval, "generate_embedding", lambda q: vector)
    geography = "SYN-" + str(uuid.uuid4())
    ids = []
    for status, place, start, end in [
        ("APPROVED_SURVEILLANCE", geography, "2024-01-01", "2024-12-31"),
        ("APPROVED", geography, "2024-01-01", "2024-12-31"),
        ("APPROVED_SURVEILLANCE", "SYN-other-region", "2024-01-01", "2024-12-31"),
        ("APPROVED_SURVEILLANCE", geography, "2016-01-01", "2016-12-31"),
    ]:
        doc=MedicalDocument(title="SYN validation only",publisher="SYN",review_status=status)
        db_session.add(doc);db_session.flush();ids.append(doc.id)
        db_session.add(KnowledgeChunk(document_id=doc.id,chunk_index=0,content="SYN evidence, not real health data",
            embedding=vector,metadata_={"scope":"population_surveillance","geography":place,
                                       "reporting_start":start,"reporting_end":end}))
    db_session.flush()
    request=PublicHealthSearch(query="SYN",geography=geography,period_start="2024-01-01",period_end="2024-12-31")
    results=public_health_retrieval.search_public_health(db_session,request)
    assert [row["document_id"] for row in results]==[ids[0]]
    request.population_setting = "rural"
    assert public_health_retrieval.search_public_health(db_session,request)==[]
    rural_chunk=db_session.query(KnowledgeChunk).filter(KnowledgeChunk.document_id==ids[0]).one()
    rural_chunk.metadata_=dict(rural_chunk.metadata_,population_setting="rural")
    db_session.flush()
    assert [row["document_id"] for row in public_health_retrieval.search_public_health(db_session,request)]==[ids[0]]


def test_care_access_excludes_other_scopes_and_superseded_sources(db_session, monkeypatch):
    vector = [1.0] + [0.0] * 383
    monkeypatch.setattr(public_health_retrieval, "generate_embedding", lambda q: vector)
    place = "SYN-" + str(uuid.uuid4())
    ids = []
    for status, scope, setting in [
        ('APPROVED_SERVICE_NAVIGATION', 'service_navigation', 'rural'),
        ('SUPERSEDED_SERVICE_NAVIGATION', 'service_navigation', 'rural'),
        ('APPROVED_SURVEILLANCE', 'population_surveillance', 'rural'),
        ('APPROVED', 'service_navigation', 'rural'),
        ('APPROVED_SERVICE_NAVIGATION', 'service_navigation', 'urban'),
    ]:
        doc = MedicalDocument(title='SYN care navigation test', publisher='SYN', review_status=status)
        db_session.add(doc); db_session.flush(); ids.append(doc.id)
        db_session.add(KnowledgeChunk(document_id=doc.id, chunk_index=0, content='SYN test only',
            embedding=vector, metadata_={'scope': scope, 'geography': place, 'population_setting': setting}))
    db_session.flush()
    req = CareAccessSearch(query='SYN services', geography=place, population_setting='rural')
    assert [r['document_id'] for r in public_health_retrieval.search_care_access(db_session, req)] == ids[:1]
    req.geography = 'SYN-other-place'
    assert public_health_retrieval.search_care_access(db_session, req) == []
