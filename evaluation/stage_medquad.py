"""Stage licensed MedQuAD documents; never promote to live RAG or train a model."""
import hashlib
import json
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / '.model-cache/research/MedQuAD'
DEST = ROOT / '.model-cache/research/medquad-staged'
COLLECTIONS = ('5_NIDDK_QA', '8_NHLBI_QA_XML', '9_CDC_QA')
TOPICS = ('diabet', 'asthma', 'blood pressure', 'hypertension', 'anemia',
          'anaemia', 'diarr', 'kidney', 'nutrition', 'infection', 'hepatitis',
          'heart', 'lung', 'sleep', 'digest', 'stomach', 'bladder', 'bowel')
QTYPES = {'information', 'symptoms', 'causes', 'risk factors', 'prevention'}


def read_document(path):
    data = ET.parse(path).getroot()
    title = (data.findtext('Focus') or '').strip()
    url = data.attrib.get('url', '').strip()
    if not title or not url or not any(topic in title.lower() for topic in TOPICS):
        return None
    pairs = []
    for pair in data.findall('./QAPairs/QAPair'):
        question = pair.find('Question')
        answer = ' '.join((pair.findtext('Answer') or '').split())
        if question is None or question.attrib.get('qtype', '').lower() not in QTYPES or not answer:
            continue
        pairs.append({'question': ' '.join(''.join(question.itertext()).split()),
                      'answer': answer, 'question_type': question.attrib.get('qtype')})
    if not pairs:
        return None
    group = hashlib.sha256(title.casefold().encode()).hexdigest()
    bucket = int(group[:8], 16) % 10
    return {'title': title, 'publisher': data.attrib.get('source'), 'source_url': url,
            'file_sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'dataset_file': path.relative_to(DATASET).as_posix(), 'license': 'CC BY 4.0',
            'reuse_reference': 'https://github.com/abachaa/MedQuAD',
            'publication_date': None, 'currency_status': 'NOT_VERIFIED',
            'clinical_review': 'PENDING', 'indian_applicability_review': 'PENDING',
            'review_status': 'STAGED_NOT_APPROVED', 'indexed': False,
            'focus_group': group,
            'research_split': 'test' if bucket == 0 else 'validation' if bucket == 1 else 'development',
            'qa_pairs': pairs}


def main():
    revision = subprocess.check_output(['git', '-C', str(DATASET), 'rev-parse', 'HEAD'], text=True).strip()
    DEST.mkdir(parents=True, exist_ok=True)
    records, titles, content_hashes = [], set(), set()
    for collection in COLLECTIONS:
        for path in sorted((DATASET / collection).glob('*.xml')):
            record = read_document(path)
            if record is None or record['title'].casefold() in titles:
                continue
            content_hash = hashlib.sha256(json.dumps(record['qa_pairs'], sort_keys=True).encode()).hexdigest()
            if content_hash in content_hashes:
                continue
            titles.add(record['title'].casefold())
            content_hashes.add(content_hash)
            record['dataset_revision'] = revision
            filename = record['focus_group'] + '.json'
            (DEST / filename).write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding='utf-8')
            records.append({key: value for key, value in record.items() if key != 'qa_pairs'} | {'qa_count': len(record['qa_pairs']), 'staged_file': filename})
    report = {'dataset': 'MedQuAD', 'revision': revision, 'attribution':
              'Asma Ben Abacha and Dina Demner-Fushman, A Question-Entailment Approach to Question Answering, BMC Bioinformatics 2019, CC BY 4.0.',
              'staged_documents': len(records), 'qa_pairs': sum(row['qa_count'] for row in records),
              'indexed_documents': 0, 'training_performed': False,
              'excluded_collections': ['10_MPlus_ADAM_QA', '11_MPlusDrugs_QA', '12_MPlusHerbsSupplements_QA'],
              'published_test_set_used': False, 'records': records}
    (ROOT / 'evaluation/medquad_staging_manifest.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({key: value for key, value in report.items() if key != 'records'}))


if __name__ == '__main__':
    main()
