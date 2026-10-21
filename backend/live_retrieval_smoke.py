"""Opt-in candidate encoder smoke check against a sample of public KB chunks.

This is not a retrieval accuracy or clinical validation benchmark.
"""
import argparse
import json
import time
from pathlib import Path

from sqlalchemy import select
from huggingface_hub import model_info
from app.db.session import SessionLocal
from app.models.knowledge import MedicalDocument, KnowledgeChunk
from app.services.retrieval_encoder import CandidateEncoder, MODELS

QUERIES = {
    'en': 'What is high blood pressure?',
    'hi': 'उच्च रक्तचाप क्या है?',
    'te': 'అధిక రక్తపోటు అంటే ఏమిటి?',
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', action='store_true')
    parser.add_argument('--model', choices=MODELS, default='intfloat/multilingual-e5-small')
    args = parser.parse_args()
    if not args.run:
        parser.error('Pass --run to download a candidate model and read public KB chunks')
    samples = []
    with SessionLocal() as db:
        documents = db.scalars(select(MedicalDocument).where(
            MedicalDocument.review_status == 'APPROVED').order_by(MedicalDocument.id)).all()
        for document in documents:
            chunks = db.scalars(select(KnowledgeChunk).where(
                KnowledgeChunk.document_id == document.id).order_by(KnowledgeChunk.chunk_index).limit(12)).all()
            samples.extend({'chunk_id': str(chunk.id), 'title': document.title,
                'source_reference': document.source_reference, 'content': chunk.content} for chunk in chunks)
    if not samples:
        raise RuntimeError('No approved knowledge chunks available')
    revision = model_info(args.model).sha
    started = time.monotonic()
    encoder = CandidateEncoder(args.model, revision)
    passages = encoder.encode([sample['content'] for sample in samples], query=False)
    results = []
    for language, query in QUERIES.items():
        scores = passages @ encoder.encode([query], query=True)[0]
        indices = scores.argsort()[-3:][::-1]
        results.append({'language': language, 'synthetic_query': query,
            'top_matches': [{**{key: samples[int(i)][key] for key in
                ('chunk_id', 'title', 'source_reference')}, 'cosine_similarity': float(scores[i])}
                for i in indices]})
    report = {'model': args.model, 'revision': revision, 'sample_size': len(samples),
        'sampling': 'First twelve chunks per approved document; deliberately limited smoke check',
        'clinical_accuracy_evaluated': False, 'retrieval_accuracy_evaluated': False,
        'live_index_modified': False, 'seconds': round(time.monotonic() - started, 2), 'results': results}
    target = Path(__file__).resolve().parents[1] / 'evaluation' / 'retrieval_candidate_smoke.json'
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({key: report[key] for key in ('model', 'revision', 'sample_size', 'seconds')}))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Persist a failed check without database credentials or provider bodies.
        target = Path(__file__).resolve().parents[1] / 'evaluation' / 'retrieval_candidate_smoke.json'
        target.write_text(json.dumps({'status': 'FAILED', 'error_type': type(error).__name__,
            'clinical_accuracy_evaluated': False, 'retrieval_accuracy_evaluated': False,
            'live_index_modified': False}, indent=2), encoding='utf-8')
        print(f'Candidate smoke check failed: {type(error).__name__}')
        raise SystemExit(1)
