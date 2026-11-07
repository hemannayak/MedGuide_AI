"""Acquire 29 official patient-education resources; explicit separate indexing step.

Run from repository root: backend/.venv/Scripts/python.exe -m app.db.expand_patient_education
with PYTHONPATH=backend, or execute this file directly.
"""
from pathlib import Path
import sys,hashlib,json,uuid,argparse
from datetime import datetime,timezone
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'backend'))
import httpx
from app.services.publisher_articles import extract_cdc_article,section_chunks

SOURCES=[
 ('common-cold','common-cold/about/index.html'),('influenza','flu/about/index.html'),
 ('covid-19','covid/about/index.html'),('rsv','rsv/about/index.html'),
 ('dengue','dengue/about/index.html'),('malaria','malaria/about/index.html'),
 ('chikungunya','chikungunya/about/index.html'),('rabies','rabies/about/index.html'),
 ('tetanus','tetanus/about/index.html'),('measles','measles/about/index.html'),
 ('chickenpox','chickenpox/about/index.html'),('pertussis','pertussis/about/index.html'),
 ('handwashing','clean-hands/about/index.html'),('food-safety','food-safety/about/index.html'),
 ('drinking-water','drinking-water/about/index.html'),('heat-illness','heat-health/about/index.html'),
 ('diabetes','diabetes/about/index.html'),('asthma','asthma/about/index.html'),
 ('tuberculosis','tb/about/index.html'),('hiv','hiv/about/index.html'),
 ('hepatitis-a','hepatitis-a/about/index.html'),('hepatitis-b','hepatitis-b/about/index.html'),
 ('hepatitis-c','hepatitis-c/about/index.html'),('scabies','scabies/about/index.html'),
 ('ringworm','ringworm/about/index.html'),('head-lice','lice/about/head-lice.html'),
 ('norovirus','norovirus/about/index.html'),('iron-nutrition','infant-toddler-nutrition/vitamins-minerals/iron.html'),
 ('common-cold-care','common-cold/treatment/index.html'),
]
OUT=ROOT/'docs/data/patient_education_2026_10'
MODEL='sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
REVISION='e8f8c211226b894fcb81acc59f3b34ba3efd5f42'
POLICY='https://www.cdc.gov/other/agencymaterials.html'

def index_reviewed():
    """Append versioned educational evidence; preserve existing documents/history."""
    from app.db.session import SessionLocal
    from app.models.knowledge import MedicalDocument,KnowledgeChunk
    from app.services.knowledge_service import generate_embedding
    from sqlalchemy import text
    manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
    if manifest['verified']<25:raise ValueError('At least 25 technically verified resources are required')
    count=0;chunks_written=0; indexed=[]
    # One transaction and advisory lock prevent partially published batches and duplicate races.
    with SessionLocal() as db,db.begin():
        db.execute(text('SELECT pg_advisory_xact_lock(746928311)'))
        for topic,_ in SOURCES:
            path=OUT/f'{topic}.json'
            if not path.exists():continue
            source=json.loads(path.read_text(encoding='utf-8'))
            archived=(OUT/f'{topic}.html').read_bytes()
            if hashlib.sha256(archived).hexdigest()!=source['html_sha256']:raise ValueError('Archived source hash mismatch')
            extracted=extract_cdc_article(archived.decode('utf-8'))
            if extracted['content_sha256']!=source['content_sha256']:raise ValueError('Source extraction changed; review again')
            doc_id=uuid.uuid5(uuid.NAMESPACE_URL,source['source_url']+'#'+source['content_sha256'])
            indexed.append((topic, str(doc_id)))
            existing=db.get(MedicalDocument,doc_id)
            if existing:
                if not existing.chunks:raise ValueError('Previously indexed version has no chunks')
                continue
            doc=MedicalDocument(id=doc_id,title=source['title'],publisher='CDC — source freely available; no CDC/HHS/U.S. Government endorsement',
                source_reference=source['resolved_url'],language='en',topic=topic,
                license='Public-domain agency text; see recorded reuse conditions',version=source['content_sha256'][:16],
                review_status='APPROVED',last_reviewed_at=datetime.now(timezone.utc))
            db.add(doc);db.flush()
            for chunk in section_chunks(extracted):
                if len(chunk['content'])<40:continue
                metadata={k:source[k] for k in ['topic','source_url','retrieved_at','jurisdiction','reuse_basis','clinical_review','html_sha256','content_sha256','extractor']}
                metadata.update({'section_title':chunk['section_title'],'chunk_sha256':chunk['content_sha256'],
                    'embedding_model':MODEL,'embedding_revision':REVISION,'embedding_dimensions':384,
                    'scope':'general_patient_education','review_kind':'publisher/provenance/extraction technical review; not local clinical validation'})
                db.add(KnowledgeChunk(document_id=doc_id,chunk_index=chunk['chunk_index'],content=chunk['content'],
                    embedding=generate_embedding(chunk['content']),metadata_=metadata));chunks_written+=1
            count+=1
        db.flush()
    # This marker is written only after a committed transaction, never on acquisition.
    report={'committed_at':datetime.now(timezone.utc).isoformat(),'documents_added':count,'chunks_added':chunks_written,
            'model':MODEL,'revision':REVISION,'preserved_existing_corpus':True,'clinical_validation':False}
    # Preserve the original import evidence across idempotent reruns.
    with (OUT/'index_runs.jsonl').open('a',encoding='utf-8') as log:
        log.write(json.dumps(report)+'\n')
    if not (OUT/'index_report.json').exists():
        (OUT/'index_report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    ids=dict(indexed)
    for row in manifest['sources']:
        if row['topic'] in ids:
            row.update(indexed=True,document_id=ids[row['topic']])
            path=OUT/(row['topic']+'.json')
            source=json.loads(path.read_text(encoding='utf-8'))
            source.update(indexed=True,document_id=ids[row['topic']])
            path.write_text(json.dumps(source,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    return report

def acquire():
    OUT.mkdir(parents=True,exist_ok=True)
    rows=[]
    with httpx.Client(timeout=35,follow_redirects=True) as client:
        # Policy was inspected through the web research tool. Its legacy URL
        # may reject scripted retrieval; do not bypass the publisher's controls.
        policy=client.get(POLICY)
        (OUT/'reuse_policy_review.json').write_text(json.dumps({'url':POLICY,'script_http_status':policy.status_code,
            'reviewed_via':'Official CDC policy page read with web research tool on 2026-10-23',
            'conditions':['Text only; exclude explicit third-party copyright restrictions','Preserve substantive text',
                          'Attribute CDC, link free source, state no endorsement','No logos/images; no India-specific clinical approval claimed']},indent=2),encoding='utf-8')
        if policy.status_code==200:(OUT/'reuse_policy.html').write_bytes(policy.content)
        for topic,path in SOURCES:
            url='https://www.cdc.gov/'+path
            row={'topic':topic,'source_url':url,'publisher':'Centers for Disease Control and Prevention',
                 'jurisdiction':'United States; general education only, not India-specific treatment policy',
                 'reuse_basis':POLICY,'reuse_status':'PUBLIC_DOMAIN_TEXT_WITH_ATTRIBUTION_AND_NONENDORSEMENT',
                 'clinical_review':'NOT_CLINICALLY_VALIDATED_FOR_INDIAN_DEPLOYMENT','indexed':False}
            try:
                r=client.get(url);r.raise_for_status()
                if urlsplit(str(r.url)).hostname!='www.cdc.gov':raise ValueError('Unexpected publisher redirect')
                article=extract_cdc_article(r.text)
                chunks=section_chunks(article)
                row.update(article);row.update({'resolved_url':str(r.url),'retrieved_at':datetime.now(timezone.utc).isoformat(),
                  'html_sha256':hashlib.sha256(r.content).hexdigest(),'chunks':chunks,'status':'TECHNICALLY_VERIFIED_EDUCATION_SOURCE'})
                (OUT/f'{topic}.html').write_bytes(r.content)
                (OUT/f'{topic}.json').write_text(json.dumps(row,ensure_ascii=False,indent=2),encoding='utf-8')
                print(topic,len(chunks),'chunks',flush=True)
            except (httpx.HTTPError,ValueError) as error:
                row['status']='ACQUISITION_FAILED';row['error']=type(error).__name__;print(topic,'FAILED',flush=True)
            rows.append({k:v for k,v in row.items() if k not in {'chunks','sections'}})
    manifest={'model':MODEL,'count':len(rows),'verified':sum(r['status']=='TECHNICALLY_VERIFIED_EDUCATION_SOURCE' for r in rows),'sources':rows}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    return manifest

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--acquire',action='store_true')
    parser.add_argument('--index-reviewed-education',action='store_true')
    args=parser.parse_args()
    if args.acquire:
        result=acquire();print(json.dumps({'verified':result['verified'],'requested':result['count']}))
    elif args.index_reviewed_education:print(json.dumps(index_reviewed()))
    else:parser.error('Use --acquire or --index-reviewed-education explicitly')
