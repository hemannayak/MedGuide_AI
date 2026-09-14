"""
MedGuide AI — Baseline Diagnostic Runner (READ-ONLY)
Location: evaluation/run_baseline_diagnostic.py
"""

import os
import sys
import time
import json
import uuid
import platform
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

# Force UTF-8 on Windows standard streams
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

SCRIPTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPTS_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))
os.chdir(str(PROJECT_ROOT))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from sqlalchemy import text
from app.db.session import SessionLocal
from app.models.knowledge import MedicalDocument, KnowledgeChunk
from app.services.knowledge_service import generate_embedding
import app.services.ai_service as ais
from app.services.ai_service import (
    retrieve_relevant_chunks,
    build_grounded_prompt,
    build_citations,
    validate_llm_output,
)
from app.services.ai_gateway import create_ai_gateway


def collect_system_inventory() -> Dict[str, Any]:
    db = SessionLocal()
    
    conn: Any = db.connection()
    
    # 1. Versions
    py_ver = sys.version
    os_ver = platform.platform()
    
    # PostgreSQL & pgvector versions
    pg_ver = conn.execute(text("SELECT version();")).scalar()
    try:
        pgvector_ver = conn.execute(text("SELECT extversion FROM pg_extension WHERE extname = 'vector';")).scalar()
    except Exception as e:
        pgvector_ver = f"Error: {e}"

    # Embedding column dimension in DB
    dim_res = conn.execute(text("SELECT vector_dims(embedding) FROM knowledge_chunks LIMIT 1")).scalar()
    col_type = conn.execute(text("""
        SELECT data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'knowledge_chunks' AND column_name = 'embedding';
    """)).fetchall()

    # Index on embedding column
    indexes = conn.execute(text("""
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'knowledge_chunks';
    """)).fetchall()

    # Medical documents
    docs = db.query(MedicalDocument).all()
    doc_details = []
    for d in docs:
        c_count = db.query(KnowledgeChunk).filter(KnowledgeChunk.document_id == d.id).count()
        doc_details.append({
            "id": str(d.id),
            "title": d.title,
            "publisher": d.publisher,
            "publication_date": str(d.publication_date) if d.publication_date else None,
            "language": d.language,
            "review_status": d.review_status,
            "chunk_count": c_count,
            "source_reference": d.source_reference
        })

    # Total chunks
    total_chunks = db.query(KnowledgeChunk).count()

    # Ollama inspection
    ollama_info: Dict[str, Any] = {}
    try:
        req = urllib.request.Request("http://localhost:11434/api/show", data=json.dumps({"name": "qwen3:4b"}).encode(), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read())
            ollama_info = {
                "parameters": data.get("parameters"),
                "model_info": data.get("model_info"),
                "template": data.get("template")[:150] if data.get("template") else None
            }
    except Exception as e:
        ollama_info = {"error": str(e)}

    return {
        "python_version": py_ver,
        "os_platform": os_ver,
        "postgres_version": pg_ver,
        "pgvector_version": pgvector_ver,
        "embedding_db_dimension": dim_res,
        "embedding_col_type": [(r[0], r[1]) for r in col_type],
        "indexes": [(r[0], r[1]) for r in indexes],
        "total_documents": len(docs),
        "total_chunks": total_chunks,
        "documents": doc_details,
        "ollama_info": ollama_info,
    }


def run_detailed_retrieval_and_qwen_tests() -> List[Dict[str, Any]]:
    db = SessionLocal()
    ollama_gw = create_ai_gateway(provider="ollama", model="qwen3:4b")

    # 5 English, 5 Hindi, 5 Telugu queries
    test_queries = [
        # English (5)
        {"lang": "en", "id": "EN-1", "expected_doc": "Guideline for the Pharmacological Treatment of Hypertension in Adults", "q": "What are the first-line pharmacological treatments for hypertension in adults?"},
        {"lang": "en", "id": "EN-2", "expected_doc": "WHO Guidelines for Malaria", "q": "What is the recommended treatment for uncomplicated P. falciparum malaria?"},
        {"lang": "en", "id": "EN-3", "expected_doc": "Standard Treatment Workflows of India: Paediatric Tuberculosis", "q": "What is the treatment duration for paediatric pulmonary tuberculosis?"},
        {"lang": "en", "id": "EN-4", "expected_doc": "Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care", "q": "How is asthma acute exacerbation treated in primary health care centers?"},
        {"lang": "en", "id": "EN-5", "expected_doc": "Standard Treatment Workflows of India: Paediatric Tuberculosis", "q": "Should children with TB meningitis receive adjuvant corticosteroids?"},

        # Hindi (5)
        {"lang": "hi", "id": "HI-1", "expected_doc": "Guideline for the Pharmacological Treatment of Hypertension in Adults", "q": "वयस्कों में उच्च रक्तचाप (हाई बीपी) के लिए प्राथमिक दवाएं कौन सी हैं?"},
        {"lang": "hi", "id": "HI-2", "expected_doc": "WHO Guidelines for Malaria", "q": "फाल्सीपेरम मलेरिया के बुखार के लिए डब्ल्यूएचओ द्वारा अनुशंसित उपचार क्या है?"},
        {"lang": "hi", "id": "HI-3", "expected_doc": "Standard Treatment Workflows of India: Paediatric Tuberculosis", "q": "बच्चों में फेफड़ों की टीबी का इलाज कितने समय तक चलना चाहिए?"},
        {"lang": "hi", "id": "HI-4", "expected_doc": "Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care", "q": "प्राथमिक स्वास्थ्य केंद्र में अस्थमा के दौरे का इलाज कैसे किया जाता है?"},
        {"lang": "hi", "id": "HI-5", "expected_doc": "Standard Treatment Workflows of India: Paediatric Tuberculosis", "q": "क्या टीबी मेनिनजाइटिस से पीड़ित बच्चे को कॉर्टिकोस्टेरॉइड दवा दी जानी चाहिए?"},

        # Telugu (5)
        {"lang": "te", "id": "TE-1", "expected_doc": "Guideline for the Pharmacological Treatment of Hypertension in Adults", "q": "పెద్దవారిలో హై బీపీ నియంత్రణకు ప్రాథమికంగా ఏ మందులు సూచిస్తారు?"},
        {"lang": "te", "id": "TE-2", "expected_doc": "WHO Guidelines for Malaria", "q": "ఫాల్సిపారమ్ మలేరియా జ్వరానికి సిఫార్సు చేయబడిన చికిత్స ఏమిటి?"},
        {"lang": "te", "id": "TE-3", "expected_doc": "Standard Treatment Workflows of India: Paediatric Tuberculosis", "q": "పిల్లలలో ఊపిరితిత్తుల క్షయ (టీబీ) వ్యాధి చికిత్స కాల వ్యవధి ఎంత?"},
        {"lang": "te", "id": "TE-4", "expected_doc": "Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care", "q": "ప్రాథమిక ఆరోగ్య కేంద్రంలో ఆస్తమా తీవ్రమైనప్పుడు ఏ చికిత్స చేయాలి?"},
        {"lang": "te", "id": "TE-5", "expected_doc": "Standard Treatment Workflows of India: Paediatric Tuberculosis", "q": "టీబీ మెనింజైటిస్ ఉన్న పిల్లలకు కార్టికోస్టెరాయిడ్స్ మందులు ఇవ్వవచ్చా?"},
    ]

    results: List[Dict[str, Any]] = []

    for t in test_queries:
        lang = t["lang"]
        qid = t["id"]
        q = t["q"]
        expected = t["expected_doc"]

        # 1. Retrieval
        t_ret_0 = time.time()
        chunks = retrieve_relevant_chunks(db, q, top_k_candidates=10, top_k_context=5, similarity_threshold=0.0)
        dur_ret = (time.time() - t_ret_0) * 1000

        retrieved_items: List[Dict[str, Any]] = []
        for rank, c in enumerate(chunks, start=1):
            retrieved_items.append({
                "rank": rank,
                "chunk_id": str(c.get("chunk_id", "")),
                "document_title": str(c.get("title", "")),
                "similarity_score": round(float(c.get("similarity", 0.0)), 4),
                "content_preview": str(c.get("content", ""))[:200].replace("\n", " "),
                "is_match": c.get("title") == expected
            })

        hit_1 = len(retrieved_items) > 0 and retrieved_items[0]["is_match"]
        hit_3 = any(r["is_match"] for r in retrieved_items[:3])
        hit_5 = any(r["is_match"] for r in retrieved_items[:5])
        rank_first_match = next((r["rank"] for r in retrieved_items if r["is_match"]), None)

        # 2. Qwen Standalone (Test representative queries EN-1, HI-1, TE-1 for timing)
        should_run_llm = qid in ["EN-1", "EN-3", "HI-1", "HI-3", "TE-1", "TE-3"]
        
        dur_standalone = 0.0
        resp_standalone = "(Skipped for latency)"
        dur_rag = 0.0
        resp_rag = "(Skipped for latency)"

        if should_run_llm:
            sys_standalone = f"You are MedGuide AI, a primary healthcare assistant. Answer accurately in {lang}."
            usr_standalone = f"Question: {q}\nAnswer:"
            t_gen_0 = time.time()
            try:
                resp_standalone = ollama_gw.generate(system_prompt=sys_standalone, user_prompt=usr_standalone, max_tokens=150, temperature=0.3)
                dur_standalone = round(time.time() - t_gen_0, 2)
            except Exception as e:
                resp_standalone = f"ERROR: {e}"
                dur_standalone = round(time.time() - t_gen_0, 2)

            # 3. Qwen + RAG
            top3_chunks = chunks[:3]
            sys_rag, usr_rag = build_grounded_prompt(q, top3_chunks, language=lang, history="")
            t_gen_rag_0 = time.time()
            try:
                resp_rag = ollama_gw.generate(system_prompt=sys_rag, user_prompt=usr_rag, max_tokens=150, temperature=0.2)
                dur_rag = round(time.time() - t_gen_rag_0, 2)
            except Exception as e:
                resp_rag = f"ERROR: {e}"
                dur_rag = round(time.time() - t_gen_rag_0, 2)

        results.append({
            "id": qid,
            "language": lang,
            "query": q,
            "expected_document": expected,
            "retrieval_latency_ms": round(dur_ret, 2),
            "hit_at_1": hit_1,
            "hit_at_3": hit_3,
            "hit_at_5": hit_5,
            "reciprocal_rank": round(1.0 / rank_first_match, 4) if rank_first_match else 0.0,
            "retrieved_chunks": retrieved_items,
            "standalone_generation_sec": dur_standalone,
            "standalone_response": resp_standalone,
            "rag_generation_sec": dur_rag,
            "rag_context_passed": [r["content_preview"] for r in retrieved_items[:3]],
            "rag_response": resp_rag,
        })

    return results


if __name__ == "__main__":
    out_dir = PROJECT_ROOT / "evaluation"
    out_dir.mkdir(exist_ok=True)
    
    print("Collecting System Inventory...")
    inv = collect_system_inventory()
    with open(out_dir / "system_inventory.json", "w", encoding="utf-8") as f:
        json.dump(inv, f, indent=2, ensure_ascii=False)
    print("System Inventory Saved.")

    print("Running Multilingual Retrieval & Inference Tests...")
    test_results = run_detailed_retrieval_and_qwen_tests()
    with open(out_dir / "multilingual_test_results.json", "w", encoding="utf-8") as f:
        json.dump(test_results, f, indent=2, ensure_ascii=False)
    print("Multilingual Test Results Saved.")
