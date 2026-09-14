"""
MedGuide AI — Controlled RAG Quality Validation Harness
Evaluates retrieval and generation quality on the existing 6,760 corpus vectors.
NO production changes. Read-only diagnostic execution.
"""
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

sys.stdout.reconfigure(encoding='utf-8')
BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import text
from app.db.session import SessionLocal
from app.services.knowledge_service import generate_embedding
from app.services.ai_gateway import OllamaGateway, create_ai_gateway
from app.core.triage import evaluate_symptom_triage

# ---------------------------------------------------------------------------
# 1. EXPANDED 30-QUERY CONTROLLED EVALUATION DATASET
# (10 English, 10 Hindi, 10 Telugu - Semantically Aligned Across 4 Documents)
# ---------------------------------------------------------------------------
# Corpus Documents:
DOC_HTN = "Guideline for the Pharmacological Treatment of Hypertension in Adults"
DOC_MAL = "WHO Guidelines for Malaria"
DOC_TB  = "Standard Treatment Workflows of India: Paediatric Tuberculosis"
DOC_PEN = "Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care"

# 10 core clinical questions covered in the 4 corpus documents
CORE_QUESTIONS = [
    # Q1 (Hypertension)
    {
        "id": "HTN-1",
        "topic": "Hypertension first-line drugs",
        "expected_doc": DOC_HTN,
        "en": "What are the first-line pharmacological treatments for hypertension in adults?",
        "hi": "वयस्कों में उच्च रक्तचाप (हाई बीपी) के इलाज के लिए प्राथमिक दवाएं कौन सी हैं?",
        "te": "పెద్దవారిలో హై బీపీ నియంత్రణకు ప్రాథమికంగా ఏ మందులు సూచిస్తారు?",
        "en_trans_hi": "What are the primary medications for the treatment of high blood pressure in adults?",
        "en_trans_te": "Which medications are primarily prescribed to control high BP in adults?"
    },
    # Q2 (Hypertension)
    {
        "id": "HTN-2",
        "topic": "Blood pressure treatment threshold",
        "expected_doc": DOC_HTN,
        "en": "At what blood pressure threshold should pharmacological treatment be initiated in adults?",
        "hi": "वयस्कों में किस रक्तचाप स्तर पर दवाओं द्वारा उपचार शुरू किया जाना चाहिए?",
        "te": "పెద్దవారిలో ఏ రక్తపోటు స్థాయి వద్ద ఔషధ చికిత్స ప్రారంభించాలి?",
        "en_trans_hi": "At what blood pressure level should drug treatment be started in adults?",
        "en_trans_te": "At what blood pressure level should drug treatment be started in adults?"
    },
    # Q3 (Malaria)
    {
        "id": "MAL-1",
        "topic": "Uncomplicated falciparum malaria treatment",
        "expected_doc": DOC_MAL,
        "en": "What is the recommended treatment for uncomplicated P. falciparum malaria?",
        "hi": "फाल्सीपेरम मलेरिया के बुखार के लिए डब्ल्यूएचओ द्वारा अनुशंसित उपचार क्या है?",
        "te": "ఫాల్సిపారమ్ మలేరియా జ్వరానికి సిఫార్సు చేయబడిన చికిత్స ఏమిటి?",
        "en_trans_hi": "What is the WHO recommended treatment for falciparum malaria fever?",
        "en_trans_te": "What is the recommended treatment for falciparum malaria fever?"
    },
    # Q4 (Malaria)
    {
        "id": "MAL-2",
        "topic": "Severe malaria emergency management",
        "expected_doc": DOC_MAL,
        "en": "What is the recommended medicine for the initial treatment of severe malaria?",
        "hi": "गंभीर मलेरिया के प्रारंभिक उपचार के लिए कौन सी दवा की सिफारिश की जाती है?",
        "te": "తీవ్రమైన మలేరియా అత్యవసర చికిత్సకు సిఫార్సు చేయబడిన ఔషధం ఏమిటి?",
        "en_trans_hi": "Which medicine is recommended for the initial treatment of severe malaria?",
        "en_trans_te": "What is the recommended medicine for emergency treatment of severe malaria?"
    },
    # Q5 (Paediatric TB)
    {
        "id": "TB-1",
        "topic": "Paediatric pulmonary TB duration",
        "expected_doc": DOC_TB,
        "en": "What is the standard treatment duration for paediatric pulmonary tuberculosis?",
        "hi": "बच्चों में फेफड़ों की टीबी का इलाज कितने समय तक चलना चाहिए?",
        "te": "పిల్లలలో ఊపిరితిత్తుల క్షయ (టీబీ) వ్యాధి చికిత్స కాల వ్యవధి ఎంత?",
        "en_trans_hi": "How long should pulmonary TB treatment last in children?",
        "en_trans_te": "What is the duration of treatment for pulmonary tuberculosis (TB) in children?"
    },
    # Q6 (Paediatric TB)
    {
        "id": "TB-2",
        "topic": "TB meningitis corticosteroids",
        "expected_doc": DOC_TB,
        "en": "Should children with tuberculosis meningitis receive adjuvant corticosteroids?",
        "hi": "क्या टीबी मेनिनजाइटिस से पीड़ित बच्चों को कॉर्टिकोस्टेरॉइड्स दवा दी जानी चाहिए?",
        "te": "టీబీ మెనింజైటిస్ ఉన్న పిల్లలకు కార్టికోస్టెరాయిడ్స్ మందులు ఇవ్వవచ్చా?",
        "en_trans_hi": "Should children suffering from TB meningitis be given corticosteroid medicines?",
        "en_trans_te": "Can corticosteroid medicines be given to children with TB meningitis?"
    },
    # Q7 (Paediatric TB)
    {
        "id": "TB-3",
        "topic": "Paediatric TB diagnostic specimen",
        "expected_doc": DOC_TB,
        "en": "How is gastric aspirate collected for paediatric tuberculosis diagnosis?",
        "hi": "बच्चों में टीबी के निदान के लिए गैस्ट्रिक एस्पिरेट कैसे एकत्र किया जाता है?",
        "te": "పిల్లలలో టీబీ నిర్ధారణ కొరకు గ్యాస్ట్రిక్ ఆస్పిరేట్ ఎలా సేకరిస్తారు?",
        "en_trans_hi": "How is gastric aspirate collected for diagnosis of TB in children?",
        "en_trans_te": "How is gastric aspirate collected for diagnosis of TB in children?"
    },
    # Q8 (WHO PEN)
    {
        "id": "PEN-1",
        "topic": "Acute asthma exacerbation at primary care",
        "expected_doc": DOC_PEN,
        "en": "How is acute asthma exacerbation treated in primary health care centers?",
        "hi": "प्राथमिक स्वास्थ्य केंद्र में अस्थमा के तीव्र दौरे का उपचार कैसे किया जाता है?",
        "te": "ప్రాథమిక ఆరోగ్య కేంద్రంలో ఆస్తమా తీవ్రమైనప్పుడు ఏ చికిత్స చేయాలి?",
        "en_trans_hi": "How is an acute asthma attack treated in a primary health center?",
        "en_trans_te": "What treatment should be given when asthma becomes severe at a primary health center?"
    },
    # Q9 (WHO PEN)
    {
        "id": "PEN-2",
        "topic": "Cardiovascular risk assessment in primary care",
        "expected_doc": DOC_PEN,
        "en": "How is total cardiovascular risk assessed in primary care using WHO charts?",
        "hi": "प्राथमिक स्वास्थ्य देखभाल में हृदय रोग जोखिम का आकलन कैसे किया जाता है?",
        "te": "ప్రాథమిక వైద్యంలో గుండె జబ్బుల ముప్పును ఎలా అంచనా వేస్తారు?",
        "en_trans_hi": "How is cardiovascular risk assessed in primary healthcare?",
        "en_trans_te": "How is heart disease risk assessed in primary healthcare?"
    },
    # Q10 (WHO PEN)
    {
        "id": "PEN-3",
        "topic": "Type 2 diabetes primary care management",
        "expected_doc": DOC_PEN,
        "en": "What are the lifestyle and pharmacological interventions for type 2 diabetes in primary care?",
        "hi": "प्राथमिक स्तर पर टाइप 2 मधुमेह (डायबिटीज) के प्रबंधन के उपाय क्या हैं?",
        "te": "ప్రాథమిక ఆరోగ్య కేంద్రంలో టైప్ 2 డయాబెటిస్ నియంత్రణకు ఏ చర్యలు సూచిస్తారు?",
        "en_trans_hi": "What are the measures for management of type 2 diabetes at the primary level?",
        "en_trans_te": "What measures are recommended to control type 2 diabetes at a primary health center?"
    },
]

def run_retrieval(db, query_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Retrieve top_k chunks using genuine ONNX MiniLM query embedding."""
    emb = generate_embedding(query_text)
    emb_str = "[" + ",".join(str(float(x)) for x in emb) + "]"
    sql = text("""
        SELECT kc.id AS chunk_id,
               md.title AS doc_title,
               kc.chunk_index,
               kc.content,
               1 - (kc.embedding <=> CAST(:emb AS vector)) AS similarity
        FROM knowledge_chunks kc
        JOIN medical_documents md ON md.id = kc.document_id
        WHERE md.review_status = 'APPROVED'
        ORDER BY kc.embedding <=> CAST(:emb AS vector)
        LIMIT :top_k
    """)
    rows = db.execute(sql, {"emb": emb_str, "top_k": top_k}).fetchall()
    results = []
    for r in rows:
        results.append({
            "chunk_id": str(r.chunk_id),
            "doc_title": str(r.doc_title),
            "chunk_index": int(r.chunk_index),
            "content": str(r.content),
            "similarity": float(r.similarity),
        })
    return results

def compute_metrics(retrieval_records: List[Dict[str, Any]]) -> Dict[str, Any]:
    n = len(retrieval_records)
    if n == 0:
        return {}
    r1 = sum(1 for r in retrieval_records if r["rank_first_match"] == 1) / n
    r3 = sum(1 for r in retrieval_records if r["rank_first_match"] is not None and r["rank_first_match"] <= 3) / n
    r5 = sum(1 for r in retrieval_records if r["rank_first_match"] is not None and r["rank_first_match"] <= 5) / n
    mrr = sum(1.0 / r["rank_first_match"] for r in retrieval_records if r["rank_first_match"] is not None) / n
    mean_sim = sum(r["top_similarity"] for r in retrieval_records) / n
    return {
        "recall_1": round(r1 * 100, 2),
        "recall_3": round(r3 * 100, 2),
        "recall_5": round(r5 * 100, 2),
        "mrr": round(mrr, 4),
        "mean_top_similarity": round(mean_sim, 4),
    }

def main():
    db = SessionLocal()
    print("="*70)
    print("MEDGUIDE AI — RAG QUALITY & CROSS-LINGUAL VALIDATION")
    print("="*70)
    
    # -----------------------------------------------------------------------
    # Run Retrieval on 10 English, 10 Hindi, 10 Telugu Queries
    # -----------------------------------------------------------------------
    en_records, hi_records, te_records = [], [], []
    hi_trans_records, te_trans_records = [], []

    detailed_retrievals = {"en": [], "hi": [], "te": []}

    for item in CORE_QUESTIONS:
        expected = item["expected_doc"]
        qid = item["id"]

        # 1. English
        t0 = time.time()
        en_res = run_retrieval(db, item["en"], top_k=5)
        en_dur = time.time() - t0
        en_rank = next((idx + 1 for idx, r in enumerate(en_res) if r["doc_title"] == expected), None)
        rec_en = {
            "id": qid,
            "query": item["en"],
            "expected_doc": expected,
            "top_similarity": en_res[0]["similarity"] if en_res else 0.0,
            "rank_first_match": en_rank,
            "results": en_res,
            "latency_ms": en_dur * 1000
        }
        en_records.append(rec_en)
        detailed_retrievals["en"].append(rec_en)

        # 2. Hindi
        t0 = time.time()
        hi_res = run_retrieval(db, item["hi"], top_k=5)
        hi_dur = time.time() - t0
        hi_rank = next((idx + 1 for idx, r in enumerate(hi_res) if r["doc_title"] == expected), None)
        rec_hi = {
            "id": qid,
            "query": item["hi"],
            "expected_doc": expected,
            "top_similarity": hi_res[0]["similarity"] if hi_res else 0.0,
            "rank_first_match": hi_rank,
            "results": hi_res,
            "latency_ms": hi_dur * 1000
        }
        hi_records.append(rec_hi)
        detailed_retrievals["hi"].append(rec_hi)

        # 3. Telugu
        t0 = time.time()
        te_res = run_retrieval(db, item["te"], top_k=5)
        te_dur = time.time() - t0
        te_rank = next((idx + 1 for idx, r in enumerate(te_res) if r["doc_title"] == expected), None)
        rec_te = {
            "id": qid,
            "query": item["te"],
            "expected_doc": expected,
            "top_similarity": te_res[0]["similarity"] if te_res else 0.0,
            "rank_first_match": te_rank,
            "results": te_res,
            "latency_ms": te_dur * 1000
        }
        te_records.append(rec_te)
        detailed_retrievals["te"].append(rec_te)

        # 4. Translation Ablation (Hindi translated -> EN)
        hi_trans_res = run_retrieval(db, item["en_trans_hi"], top_k=5)
        hi_trans_rank = next((idx + 1 for idx, r in enumerate(hi_trans_res) if r["doc_title"] == expected), None)
        hi_trans_records.append({
            "id": qid,
            "orig_query": item["hi"],
            "trans_query": item["en_trans_hi"],
            "expected_doc": expected,
            "orig_rank": hi_rank,
            "trans_rank": hi_trans_rank,
            "orig_sim": hi_res[0]["similarity"] if hi_res else 0.0,
            "trans_sim": hi_trans_res[0]["similarity"] if hi_trans_res else 0.0,
        })

        # 5. Translation Ablation (Telugu translated -> EN)
        te_trans_res = run_retrieval(db, item["en_trans_te"], top_k=5)
        te_trans_rank = next((idx + 1 for idx, r in enumerate(te_trans_res) if r["doc_title"] == expected), None)
        te_trans_records.append({
            "id": qid,
            "orig_query": item["te"],
            "trans_query": item["en_trans_te"],
            "expected_doc": expected,
            "orig_rank": te_rank,
            "trans_rank": te_trans_rank,
            "orig_sim": te_res[0]["similarity"] if te_res else 0.0,
            "trans_sim": te_trans_res[0]["similarity"] if te_trans_res else 0.0,
        })

    # Summary Metrics
    m_en = compute_metrics(en_records)
    m_hi = compute_metrics(hi_records)
    m_te = compute_metrics(te_records)

    print("\n--- RETRIEVAL METRICS (Genuine ONNX paraphrase-multilingual-MiniLM-L12-v2) ---")
    print(f"English: Recall@1: {m_en['recall_1']}%, Recall@3: {m_en['recall_3']}%, Recall@5: {m_en['recall_5']}%, MRR: {m_en['mrr']}, Mean Sim: {m_en['mean_top_similarity']}")
    print(f"Hindi  : Recall@1: {m_hi['recall_1']}%, Recall@3: {m_hi['recall_3']}%, Recall@5: {m_hi['recall_5']}%, MRR: {m_hi['mrr']}, Mean Sim: {m_hi['mean_top_similarity']}")
    print(f"Telugu : Recall@1: {m_te['recall_1']}%, Recall@3: {m_te['recall_3']}%, Recall@5: {m_te['recall_5']}%, MRR: {m_te['mrr']}, Mean Sim: {m_te['mean_top_similarity']}")

    # -----------------------------------------------------------------------
    # Failure Analysis Classification
    # -----------------------------------------------------------------------
    # Classification taxonomy:
    # A: Correct source, wrong chunk
    # B: Correct topic, wrong document (e.g. Hypertension mentioned in PEN vs WHO HTN)
    # C: Semantically related but insufficient evidence
    # D: Completely irrelevant retrieval
    # E: Language mismatch (Cross-lingual alignment drift)
    # F: Query formulation issue
    # G: Ground-truth ambiguity
    # H: Other
    failures = []
    for lang, recs in [("English", en_records), ("Hindi", hi_records), ("Telugu", te_records)]:
        for r in recs:
            if r["rank_first_match"] != 1:
                # Classify
                top_doc = r["results"][0]["doc_title"] if r["results"] else "None"
                expected = r["expected_doc"]
                
                # Check cross-document overlap (e.g. PEN covers diabetes/hypertension/asthma)
                if (expected == DOC_HTN and top_doc == DOC_PEN) or (expected == DOC_PEN and top_doc == DOC_HTN):
                    cat = "B. Correct topic, secondary document (Topic overlap between WHO PEN & Specific Guideline)"
                elif lang in ["Hindi", "Telugu"] and r["rank_first_match"] is None:
                    cat = "E. Cross-lingual representation gap (Multilingual vector alignment drift)"
                elif r["rank_first_match"] is not None and r["rank_first_match"] <= 5:
                    cat = "A. Correct source in top-k, but rank > 1"
                else:
                    cat = "D. Irrelevant or distant retrieval"
                
                failures.append({
                    "lang": lang,
                    "id": r["id"],
                    "query": r["query"],
                    "expected": expected,
                    "top_doc": top_doc,
                    "rank": r["rank_first_match"],
                    "top_sim": r["top_similarity"],
                    "classification": cat
                })

    # -----------------------------------------------------------------------
    # Qwen Generation Test on Retrieved Context (1 EN, 1 HI, 1 TE)
    # -----------------------------------------------------------------------
    print("\n--- RUNNING QWEN GENERATION AUDIT ---")
    gateway = OllamaGateway(model="qwen3:4b", base_url="http://localhost:11434")

    qwen_evals = []
    for lang_key, sample_idx in [("en", 0), ("hi", 2), ("te", 0)]:
        sample = detailed_retrievals[lang_key][sample_idx]
        context_chunks = sample["results"][:2]
        context_text = "\n\n".join([f"[{i+1}] Source: {c['doc_title']}\nExcerpt: {c['content'][:400]}" for i, c in enumerate(context_chunks)])
        
        sys_prompt = f"You are MedGuide AI, a primary healthcare assistant. Answer strictly based on the verified medical context below in {lang_key.upper()}. Never prescribe independent medications or claim definitive diagnosis. Return JSON with keys: answer, safety_disclaimer, citations."
        user_prompt = f"--- VERIFIED MEDICAL CONTEXT ---\n{context_text}\n\nPatient Query: {sample['query']}"
        
        t0 = time.time()
        try:
            gen_resp = gateway.generate(system_prompt=sys_prompt, user_prompt=user_prompt, max_tokens=300, temperature=0.2, format="json")
        except Exception as e:
            gen_resp = f"Error: {e}"
        gen_dur = time.time() - t0
        
        qwen_evals.append({
            "language": lang_key,
            "query": sample["query"],
            "expected_doc": sample["expected_doc"],
            "retrieved_top_doc": sample["results"][0]["doc_title"],
            "generation_time_s": round(gen_dur, 2),
            "response": gen_resp
        })

    # -----------------------------------------------------------------------
    # Deterministic Triage Safety Verification
    # -----------------------------------------------------------------------
    print("\n--- DETERMINISTIC TRIAGE ISOLATION AUDIT ---")
    emergency_cases = [
        ("EN-Emergency", "I have chest pain and shortness of breath", "EMERGENCY"),
        ("HI-Emergency", "मेरे सीने में दर्द हो रहा है और सांस लेने में तकलीफ है", "EMERGENCY"),
        ("TE-Emergency", "నాకు ఛాతి నొప్పి మరియు శ్వాస తీసుకోవడం కష్టం గా ఉంది", "EMERGENCY"),
        ("EN-Routine", "I have mild sore throat and slight cough for 1 day", "ROUTINE"),
    ]
    triage_results = []
    for tag, text_input, exp_level in emergency_cases:
        t0 = time.perf_counter()
        risk_level, red_flags, guidance, escalation_required = evaluate_symptom_triage(text_input)
        dur_us = (time.perf_counter() - t0) * 1_000_000  # microseconds
        triage_results.append({
            "tag": tag,
            "input": text_input,
            "expected_level": exp_level,
            "actual_level": risk_level,
            "red_flags": red_flags,
            "action": guidance,
            "latency_us": round(dur_us, 2),
            "isolated_from_llm": True
        })

    # -----------------------------------------------------------------------
    # Latency Profile Measurement
    # -----------------------------------------------------------------------
    latency_profile = {
        "en": {
            "embedding_ms": round(detailed_retrievals["en"][0]["latency_ms"], 2),
            "qwen_gen_s": qwen_evals[0]["generation_time_s"] if len(qwen_evals) > 0 else 0.0,
        },
        "hi": {
            "embedding_ms": round(detailed_retrievals["hi"][0]["latency_ms"], 2),
            "qwen_gen_s": qwen_evals[1]["generation_time_s"] if len(qwen_evals) > 1 else 0.0,
        },
        "te": {
            "embedding_ms": round(detailed_retrievals["te"][0]["latency_ms"], 2),
            "qwen_gen_s": qwen_evals[2]["generation_time_s"] if len(qwen_evals) > 2 else 0.0,
        }
    }

    # Save all raw results
    output_data = {
        "metrics": {
            "english": m_en,
            "hindi": m_hi,
            "telugu": m_te
        },
        "detailed_retrievals": detailed_retrievals,
        "translation_ablation": {
            "hindi": hi_trans_records,
            "telugu": te_trans_records
        },
        "failures": failures,
        "qwen_evaluations": qwen_evals,
        "triage_verification": triage_results,
        "latency_profile": latency_profile
    }

    out_file = Path(__file__).resolve().parent / "rag_quality_validation_results.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    print(f"\nAll results persisted to {out_file}")
    db.close()

if __name__ == "__main__":
    main()
