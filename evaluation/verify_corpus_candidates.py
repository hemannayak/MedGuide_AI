"""Verify candidate WHO source availability; never auto-approve or ingest."""
import argparse
import hashlib
import json
import re
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
import httpx

TOPICS = [
    'hypertension', 'diabetes', 'asthma', 'chronic-obstructive-pulmonary-disease-(copd)',
    'diarrhoeal-disease', 'pneumonia', 'malaria', 'tuberculosis', 'dengue-and-severe-dengue',
    'anaemia', 'malnutrition', 'healthy-diet', 'food-safety', 'drinking-water', 'sanitation',
    'depression', 'anxiety-disorders', 'maternal-mortality', 'newborn-mortality',
    'infant-and-young-child-feeding', 'burns', 'rabies', 'snakebite-envenoming', 'epilepsy',
    'oral-health', 'mental-disorders',
]


def verify(topic):
    url = f'https://www.who.int/news-room/fact-sheets/detail/{topic}'
    row = {'topic': topic, 'source_url': url, 'publisher': 'World Health Organization',
           'content_kind': 'patient_education_fact_sheet', 'review_status': 'CANDIDATE',
           'license_status': 'REUSE_TERMS_REVIEW_REQUIRED', 'indexed': False}
    try:
        response = httpx.get(url, follow_redirects=True, timeout=30)
        row['http_status'] = response.status_code
        title = re.search(r'<title[^>]*>(.*?)</title>', response.text, re.S | re.I)
        row['title'] = re.sub(r'\s+', ' ', title.group(1)).strip() if title else None
        row['resolved_url'] = str(response.url)
        row['html_sha256'] = hashlib.sha256(response.content).hexdigest()
        row['available'] = response.status_code == 200 and bool(row['title']) and 'page not found' not in row['title'].lower()
    except httpx.HTTPError:
        row['available'] = False
        row['error'] = 'network_or_timeout'
    return row


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', action='store_true')
    if not parser.parse_args().run:
        parser.error('Pass --run to verify public source URLs')
    with ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(verify, TOPICS))
    target = Path(__file__).resolve().parents[1] / 'docs/data/corpus_expansion_candidates.json'
    target.write_text(json.dumps({'verified_at_utc': datetime.now(timezone.utc).isoformat(),
                                 'not_active_corpus': True, 'sources': rows}, indent=2), encoding='utf-8')
    print(json.dumps({'candidates': len(rows), 'available': sum(row['available'] for row in rows),
                      'unavailable_topics': [row['topic'] for row in rows if not row['available']],
                      'approved_or_indexed': 0}))
