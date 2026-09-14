import sys
import os

eval_dir = os.path.abspath(os.path.dirname(__file__))
project_root = os.path.abspath(os.path.join(eval_dir, ".."))
backend_dir = os.path.join(project_root, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import time
import json
import httpx

from app.db.session import SessionLocal
from app.models.knowledge import KnowledgeChunk
from app.services.knowledge_service import generate_embedding
from app.services.ai_gateway import OllamaGateway, build_ollama_chat_payload, extract_ollama_message_content

base_url = 'http://localhost:11434'
model = 'qwen3:4b'

prompts = [
    ('EN1', 'en', 'What are first-line medications for hypertension in adults? Provide 3 concise points.'),
    ('EN2', 'en', 'Patient reports high fever and severe headache. What basic guidance and warning signs apply?'),
    ('HI1', 'hi', 'मलेरिया के मुख्य लक्षण और प्राथमिक देखभाल क्या हैं? संक्षेप में बताएं।'),
    ('HI2', 'hi', 'हाई ब्लड प्रेशर (उच्च रक्तचाप) को नियंत्रित करने के 3 आसान उपाय बताएं।'),
    ('TE1', 'te', 'మలేరియా నివారణకు తీసుకోవాల్సిన 3 ముఖ్యమైన జాగ్రత్తలు ఏమిటి?'),
    ('TE2', 'te', 'అధిక రక్తపోటు నియంత్రణకు జీవనశైలి మార్పులు ఏమిటి?')
]

print('====================================================', flush=True)
print('RUNNING PART 5: QWEN3:4B NON-THINKING BENCHMARK', flush=True)
print('====================================================', flush=True)

benchmark_results = []

for pid, lang, ptext in prompts:
    print(f'Testing {pid} ({lang})...', flush=True)
    sys_prompt = 'You are MedGuide AI. Provide preliminary healthcare guidance grounded in clinical guidelines. Keep answers clear, accurate, and concise.'
    
    payload = build_ollama_chat_payload(
        model=model,
        system_prompt=sys_prompt,
        user_prompt=ptext,
        max_tokens=220,
        temperature=0.2
    )
    
    t0 = time.time()
    try:
        resp = httpx.post(f'{base_url}/api/chat', json=payload, timeout=90.0).json()
        lat = time.time() - t0
        eval_count = resp.get('eval_count', 0)
        eval_dur = resp.get('eval_duration', 0) / 1e9
        rate = eval_count / max(eval_dur, 0.001)
        content = extract_ollama_message_content(resp)
        thinking = resp.get('message', {}).get('thinking', '')
    except Exception as e:
        lat = -1
        eval_count = 0
        rate = 0
        content = str(e)
        thinking = ''

    benchmark_results.append({
        'id': pid,
        'lang': lang,
        'prompt': ptext,
        'latency_s': round(lat, 2),
        'tokens': eval_count,
        'rate_tok_s': round(rate, 1),
        'content_len': len(content),
        'thinking_exposed': '<think>' in content or bool(thinking),
        'has_content': len(content.strip()) > 0,
        'preview': content[:200].replace('\n', ' ')
    })
    print(f'  Done: Latency={lat:.2f}s, Tokens={eval_count}, Rate={rate:.1f} tok/s, ContentLen={len(content)}', flush=True)

out_bench_path = os.path.join(eval_dir, 'qwen3_non_thinking_benchmark.json')
with open(out_bench_path, 'w', encoding='utf-8') as f:
    json.dump(benchmark_results, f, indent=2, ensure_ascii=False)
print(f'Saved benchmark to: {out_bench_path}', flush=True)

print('\n--- PART 6: END-TO-END RAG TEST ---', flush=True)
db = SessionLocal()
rag_queries = [
    ('EN_RAG1', 'en', 'What are recommended first-line drugs for hypertension?'),
    ('EN_RAG2', 'en', 'What are warning signs for severe malaria?'),
    ('HI_RAG1', 'hi', 'मलेरिया के मुख्य लक्षण और उपचार क्या हैं?'),
    ('HI_RAG2', 'hi', 'उच्च रक्तचाप का प्राथमिक उपचार क्या है?'),
    ('TE_RAG1', 'te', 'మలేరియా చికిత్స మరియు ముఖ్య లక్షణాలు ఏమిటి?'),
    ('TE_RAG2', 'te', 'అధిక రక్తపోటు నియంత్రణకు మొదటి వరుస ఔషధాలు ఏమిటి?')
]

rag_results = []
gateway = OllamaGateway(model=model, base_url=base_url)

for qid, lang, query in rag_queries:
    print(f'Running RAG Query {qid} ({lang}): "{query}"', flush=True)
    t0 = time.time()
    q_vec = generate_embedding(query)
    
    # Retrieve top-2 chunks from pgvector
    matches = (
        db.query(KnowledgeChunk, KnowledgeChunk.embedding.cosine_distance(q_vec).label('dist'))
        .order_by('dist')
        .limit(2)
        .all()
    )
    
    retrieval_lat = time.time() - t0
    
    context_blocks = []
    top_doc = 'Unknown'
    top_sim = 0.0
    for idx, (chunk, dist) in enumerate(matches):
        sim = 1.0 - dist
        if idx == 0:
            top_sim = sim
            top_doc = chunk.document.title if chunk.document else 'Unknown'
        pg = chunk.metadata_.get('page_number', '?') if chunk.metadata_ else '?'
        context_blocks.append(f'[{idx+1}] Document: {top_doc} (Page {pg})\nContent: {chunk.content[:250]}')
        
    rag_context = '\n\n'.join(context_blocks)
    
    sys_prompt = (
        f'You are MedGuide AI. Answer the patient query grounded strictly in the provided medical context. '
        f'Respond in {lang}. Cite source references [1] where applicable. Be concise and accurate.'
    )
    user_prompt = f'Context:\n{rag_context}\n\nPatient Query: {query}'
    
    t_llm = time.time()
    try:
        response_text = gateway.generate(
            system_prompt=sys_prompt,
            user_prompt=user_prompt,
            max_tokens=220,
            temperature=0.2
        )
        llm_lat = time.time() - t_llm
        total_lat = time.time() - t0
    except Exception as e:
        response_text = f'ERROR: {e}'
        llm_lat = -1
        total_lat = time.time() - t0
        
    rag_results.append({
        'qid': qid,
        'lang': lang,
        'query': query,
        'retrieved_doc': top_doc,
        'similarity': round(top_sim, 4),
        'evidence_snippet': matches[0][0].content[:150] if matches else '',
        'response': response_text,
        'retrieval_latency_s': round(retrieval_lat, 2),
        'llm_latency_s': round(llm_lat, 2),
        'total_latency_s': round(total_lat, 2)
    })
    print(f'  RAG Complete: Sim={top_sim:.4f}, TotalLat={total_lat:.2f}s (LLM={llm_lat:.2f}s)', flush=True)
    print(f'  Response Preview: {response_text[:120].replace(chr(10), " ")}', flush=True)

db.close()

out_rag_path = os.path.join(eval_dir, 'qwen3_rag_e2e_results.json')
with open(out_rag_path, 'w', encoding='utf-8') as f:
    json.dump(rag_results, f, indent=2, ensure_ascii=False)
print(f'Saved RAG results to: {out_rag_path}', flush=True)

print('\nALL BENCHMARKS COMPLETED SUCCESSFULLY!', flush=True)
