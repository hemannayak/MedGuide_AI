"""Read-only held-out topic retrieval smoke test, not clinical validation.

Run from backend: .venv/Scripts/python.exe -m app.db.evaluate_patient_education
"""
import json
import time
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy import text
from app.db.session import SessionLocal
from app.services.ai_service import retrieve_relevant_chunks

CASES = [
    ('en', 'How does dengue spread from one person to another?', 'dengue'),
    ('en', 'Can scabies spread through close skin contact?', 'scabies'),
    ('en', 'What causes ringworm on the skin?', 'ringworm'),
    ('en', 'How do people catch hepatitis A?', 'hepatitis-a'),
    ('en', 'How does tuberculosis spread through the air?', 'tuberculosis'),
    ('en', 'What can I do to feel better with a common cold?', 'common-cold-care'),
    ('en', 'Why is safe drinking water important?', 'drinking-water'),
    ('en', 'How can I wash my hands properly?', 'handwashing'),
    ('hi', 'डेंगू कैसे फैलता है?', 'dengue'),
    ('hi', 'तपेदिक हवा से कैसे फैलता है?', 'tuberculosis'),
    ('te', 'డెంగ్యూ ఎలా వ్యాపిస్తుంది?', 'dengue'),
    ('te', 'చేతులు సబ్బుతో ఎలా కడుక్కోవాలి?', 'handwashing'),
]


def main():
    rows = []
    with SessionLocal() as db:
        counts = db.execute(text('SELECT (SELECT count(*) FROM medical_documents) AS documents, (SELECT count(*) FROM knowledge_chunks) AS chunks')).mappings().one()
        for language, query, topic in CASES:
            start = time.perf_counter()
            hits = retrieve_relevant_chunks(db, query, top_k_candidates=20, top_k_context=5)
            rows.append({'language': language, 'query': query, 'expected_topic': topic,
                         'topic_hit_at_5': any(h['metadata'].get('topic') == topic for h in hits),
                         'latency_ms': round((time.perf_counter()-start)*1000, 2),
                         'hits': [{'title': h['title'], 'topic': h['metadata'].get('topic'), 'similarity': round(h['similarity'], 4), 'chunk_id': str(h['chunk_id'])} for h in hits]})
    result = {'evaluated_at': datetime.now(timezone.utc).isoformat(), 'corpus': dict(counts),
              'method': 'Direct multilingual retrieval, 12 held-out topic probes; no LLM or translation bridge; not clinical accuracy or representative benchmark.',
              'topic_hits_at_5': sum(r['topic_hit_at_5'] for r in rows), 'cases': len(rows), 'results': rows}
    out = Path(__file__).resolve().parents[3]/'docs/testing/patient-education-retrieval-20261023.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k != 'results'}))


if __name__ == '__main__':
    main()
