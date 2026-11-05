"""Scoped population evidence search; no individual risk prediction."""
from sqlalchemy import text
from app.services.knowledge_service import generate_embedding


def search_care_access(db, request):
    """Programme descriptions, never live facility availability or epidemiology."""
    vector = generate_embedding(request.query)
    rows = db.execute(text("""
        SELECT kc.id AS chunk_id, kc.document_id, kc.content, kc.metadata,
               md.title, md.publisher, md.source_reference AS source_url,
               1 - (kc.embedding <=> CAST(:vector AS vector)) AS similarity
        FROM knowledge_chunks kc JOIN medical_documents md ON md.id = kc.document_id
        WHERE md.review_status = 'APPROVED_SERVICE_NAVIGATION'
          AND kc.metadata->>'scope' = 'service_navigation'
          AND lower(kc.metadata->>'geography') = lower(:geography)
          AND (:population_setting = 'all' OR kc.metadata->>'population_setting' = :population_setting)
        ORDER BY kc.embedding <=> CAST(:vector AS vector)
        LIMIT :limit
    """), dict(vector=str(vector), geography=request.geography,
               population_setting=request.population_setting, limit=request.limit)).mappings().all()
    return [dict(row) for row in rows if float(row["similarity"]) >= 0.4]


def search_public_health(db, request):
    vector = generate_embedding(request.query)
    rows = db.execute(text("""
        SELECT kc.id AS chunk_id, kc.document_id, kc.content, kc.metadata,
               md.title, md.publisher, md.source_reference AS source_url,
               1 - (kc.embedding <=> CAST(:vector AS vector)) AS similarity
        FROM knowledge_chunks kc JOIN medical_documents md ON md.id = kc.document_id
        WHERE md.review_status = 'APPROVED_SURVEILLANCE'
          AND kc.metadata->>'scope' = 'population_surveillance'
          AND lower(kc.metadata->>'geography') = lower(:geography)
          AND (:population_setting = 'all' OR kc.metadata->>'population_setting' = :population_setting)
          AND kc.metadata->>'reporting_start' <= :period_end
          AND kc.metadata->>'reporting_end' >= :period_start
        ORDER BY kc.embedding <=> CAST(:vector AS vector)
        LIMIT :limit
    """), dict(vector=str(vector), geography=request.geography, population_setting=request.population_setting,
               period_start=request.period_start.isoformat(), period_end=request.period_end.isoformat(),
               limit=request.limit)).mappings().all()
    return [dict(row) for row in rows if float(row["similarity"]) >= 0.4]
