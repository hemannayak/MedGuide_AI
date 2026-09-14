"""
MedGuide AI — Controlled Multilingual RAG Architecture Decision Benchmark
Evaluates 20+ diverse Telugu clinical queries across 3 retrieval modes (Direct, Translated, Dual)
on the existing 6,760 corpus vectors.
NO production code changes. Read-only diagnostic execution.
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
from app.services.ai_gateway import OllamaGateway
from app.core.triage import evaluate_symptom_triage

DOC_HTN = "Guideline for the Pharmacological Treatment of Hypertension in Adults"
DOC_MAL = "WHO Guidelines for Malaria"
DOC_TB  = "Standard Treatment Workflows of India: Paediatric Tuberculosis"
DOC_PEN = "Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care"

# 20+ Diverse Telugu Queries across 9 categories
TELUGU_BENCHMARK_SET = [
    # 1. Disease Information
    {
        "id": "TE-INFO-1",
        "category": "Disease Information",
        "expected_doc": DOC_MAL,
        "te_query": "ఫాల్సిపారమ్ మలేరియా ఎలా వ్యాపిస్తుంది మరియు దాని తీవ్రత ఏమిటి?",
        "en_translation": "How is falciparum malaria transmitted and what is its severity?",
        "translation_quality": "faithful",
        "translation_notes": "Accurately conveys transmission and severity concepts."
    },
    {
        "id": "TE-INFO-2",
        "category": "Disease Information",
        "expected_doc": DOC_TB,
        "te_query": "చిన్నపిల్లలలో ప్రాథమిక పల్మనరీ క్షయవ్యాధి ఎలా నిర్ధారిస్తారు?",
        "en_translation": "How is primary pulmonary tuberculosis diagnosed in young children?",
        "translation_quality": "faithful",
        "translation_notes": "Accurate medical terms preserved."
    },
    # 2. Symptoms
    {
        "id": "TE-SYMP-1",
        "category": "Symptoms",
        "expected_doc": DOC_MAL,
        "te_query": "తీవ్రమైన మలేరియా జ్వరంలో కనిపించే ముఖ్య లక్షణాలు ఏమిటి?",
        "en_translation": "What are the main symptoms seen in severe malaria fever?",
        "translation_quality": "faithful",
        "translation_notes": "Preserves clinical focus on severe malaria symptoms."
    },
    {
        "id": "TE-SYMP-2",
        "category": "Symptoms",
        "expected_doc": DOC_PEN,
        "te_query": "ఆస్తమా అటాక్ వచ్చినప్పుడు రోగిలో ఎలాంటి శ్వాస ఇబ్బందులు ఉంటాయి?",
        "en_translation": "What breathing difficulties does a patient experience during an asthma attack?",
        "translation_quality": "faithful",
        "translation_notes": "Directly maps acute respiratory symptoms."
    },
    # 3. Treatment / General Management
    {
        "id": "TE-TREAT-1",
        "category": "Treatment / General Management",
        "expected_doc": DOC_HTN,
        "te_query": "పెద్దవారిలో హైపర్ టెన్షన్ చికిత్సకు మొదట ఇచ్చే మొదటి శ్రేణి మందులు ఏవి?",
        "en_translation": "What are the first-line medications given initially for the treatment of hypertension in adults?",
        "translation_quality": "faithful",
        "translation_notes": "Accurately targets first-line antihypertensives."
    },
    {
        "id": "TE-TREAT-2",
        "category": "Treatment / General Management",
        "expected_doc": DOC_MAL,
        "te_query": "గర్భిణీ స్త్రీలలో మొదటి త్రైమాసికంలో మలేరియా చికిత్సకు ఏ మందులు ఇవ్వకూడదు?",
        "en_translation": "Which medicines should not be given for malaria treatment in the first trimester of pregnant women?",
        "translation_quality": "faithful",
        "translation_notes": "Critical negation ('should not be given') accurately translated."
    },
    {
        "id": "TE-TREAT-3",
        "category": "Treatment / General Management",
        "expected_doc": DOC_TB,
        "te_query": "టీబీ మెనింజైటిస్ సోకిన పిల్లలకు కార్టికోస్టెరాయిడ్స్ ఎన్ని వారాలు ఇవ్వాలి?",
        "en_translation": "For how many weeks should corticosteroids be given to children infected with TB meningitis?",
        "translation_quality": "faithful",
        "translation_notes": "Duration and medication concepts preserved."
    },
    # 4. Duration
    {
        "id": "TE-DUR-1",
        "category": "Duration",
        "expected_doc": DOC_TB,
        "te_query": "పిల్లలలో పల్మనరీ టీబీ చికిత్స ఎన్ని నెలలు కొనసాగించాలి?",
        "en_translation": "How many months should pulmonary TB treatment be continued in children?",
        "translation_quality": "faithful",
        "translation_notes": "Accurate treatment timeframe query."
    },
    {
        "id": "TE-DUR-2",
        "category": "Duration",
        "expected_doc": DOC_MAL,
        "te_query": "సాధారణ మలేరియాకు ఆర్టెమిసినిన్ కాంబినేషన్ థెరపీ ఎన్ని రోజులు వాడాలి?",
        "en_translation": "For how many days should Artemisinin combination therapy be used for uncomplicated malaria?",
        "translation_quality": "faithful",
        "translation_notes": "Preserves drug regimen duration."
    },
    # 5. Risk Factors
    {
        "id": "TE-RISK-1",
        "category": "Risk Factors",
        "expected_doc": DOC_PEN,
        "te_query": "ప్రాథమిక ఆరోగ్య కేంద్రంలో గుండె జబ్బుల ముప్పు అంచనాకు ఏ రిస్క్ చార్టులు వాడతారు?",
        "en_translation": "Which risk charts are used at a primary health center to assess cardiovascular disease risk?",
        "translation_quality": "faithful",
        "translation_notes": "Directly maps WHO risk prediction chart protocol."
    },
    {
        "id": "TE-RISK-2",
        "category": "Risk Factors",
        "expected_doc": DOC_HTN,
        "te_query": "రక్తపోటు పెరగడానికి దారితీసే జీవనశైలి మరియు ఆహారపు అలవాట్లు ఏవి?",
        "en_translation": "What lifestyle and dietary habits lead to an increase in blood pressure?",
        "translation_quality": "faithful",
        "translation_notes": "Preserves dietary/lifestyle etiology concepts."
    },
    # 6. Prevention
    {
        "id": "TE-PREV-1",
        "category": "Prevention",
        "expected_doc": DOC_MAL,
        "te_query": "మలేరియా నివారణకు దోమతెరలు మరియు కీటకనాశని స్ప్రేల పాత్ర ఏమిటి?",
        "en_translation": "What is the role of mosquito nets and insecticide sprays in the prevention of malaria?",
        "translation_quality": "faithful",
        "translation_notes": "Preserves vector control terminology (ITNs, IRS)."
    },
    {
        "id": "TE-PREV-2",
        "category": "Prevention",
        "expected_doc": DOC_PEN,
        "te_query": "టైప్ 2 డయాబెటిస్ రాకుండా ప్రాథమిక స్థాయిలో ఎలాంటి జాగ్రత్తలు తీసుకోవాలి?",
        "en_translation": "What precautions should be taken at the primary level to prevent the onset of type 2 diabetes?",
        "translation_quality": "faithful",
        "translation_notes": "Preserves primary prevention intent."
    },
    # 7. Emergency-Related Wording
    {
        "id": "TE-EMERG-1",
        "category": "Emergency-Related Wording",
        "expected_doc": DOC_MAL,
        "te_query": "తీవ్రమైన మలేరియా వల్ల రోగి అపస్మారక స్థితికి వెళ్తే ప్రాథమికంగా ఏ ఇంజెక్షన్ ఇవ్వాలి?",
        "en_translation": "If a patient becomes unconscious due to severe malaria, which primary injection should be given?",
        "translation_quality": "faithful",
        "translation_notes": "Clinical emergency parenteral question."
    },
    {
        "id": "TE-EMERG-2",
        "category": "Emergency-Related Wording",
        "expected_doc": DOC_PEN,
        "te_query": "తీవ్రమైన ఆస్తమా ఎటాక్ వచ్చినప్పుడు నెబ్యులైజేషన్ లేదా సాల్బుటమాల్ ఎలా ఇవ్వాలి?",
        "en_translation": "When a severe asthma attack occurs, how should nebulization or salbutamol be administered?",
        "translation_quality": "faithful",
        "translation_notes": "Preserves acute drug and administration mode."
    },
    # 8. Colloquial / Rural Phrasing
    {
        "id": "TE-COLL-1",
        "category": "Colloquial / Rural Phrasing",
        "expected_doc": DOC_HTN,
        "te_query": "నాకు బీపీ బాగా పెరిగింది, తల తిరుగుతోంది, డాక్టర్ దగ్గరికి వెళ్లేలోపు ఏం చేయాలి?",
        "en_translation": "My blood pressure is very high and I feel dizzy, what should I do before going to the doctor?",
        "translation_quality": "minor terminology issue",
        "translation_notes": "Colloquial 'బీపీ బాగా పెరిగింది' mapped to high BP."
    },
    {
        "id": "TE-COLL-2",
        "category": "Colloquial / Rural Phrasing",
        "expected_doc": DOC_MAL,
        "te_query": "చలిజ్వరం వణికిస్తోంది, కీళ్ల నొప్పులు ఉన్నాయి, ఇది మలేరియా కావచ్చా?",
        "en_translation": "I have shivering chills and fever with joint pain, could this be malaria?",
        "translation_quality": "faithful",
        "translation_notes": "Colloquial 'చలిజ్వరం' mapped to shivering chills/fever."
    },
    {
        "id": "TE-COLL-3",
        "category": "Colloquial / Rural Phrasing",
        "expected_doc": DOC_TB,
        "te_query": "పిల్లాడికి నెల రోజులుగా దగ్గు తగ్గట్లేదు, బరువు తగ్గిపోతున్నాడు, టీబీ పరీక్ష చేయించాలా?",
        "en_translation": "Child has persistent cough for over a month and is losing weight, should a TB test be done?",
        "translation_quality": "faithful",
        "translation_notes": "Preserves chronic cough and weight loss symptom pair."
    },
    # 9. Telugu-English Mixed (Code-Mixed) Language
    {
        "id": "TE-MIX-1",
        "category": "Telugu-English Mixed",
        "expected_doc": DOC_HTN,
        "te_query": "Adults లో high blood pressure ని initiate చేయడానికి threshold level ఎంత?",
        "en_translation": "What is the threshold level to initiate treatment for high blood pressure in adults?",
        "translation_quality": "faithful",
        "translation_notes": "Code-mixed Telugu/English phrasing seamlessly translated."
    },
    {
        "id": "TE-MIX-2",
        "category": "Telugu-English Mixed",
        "expected_doc": DOC_PEN,
        "te_query": "Primary health center లో severe asthma attack కి salbutamol inhaler dose ఎంత?",
        "en_translation": "What is the salbutamol inhaler dosage for severe asthma attack in a primary health center?",
        "translation_quality": "faithful",
        "translation_notes": "Code-mixed technical terms directly preserved."
    },
    {
        "id": "TE-MIX-3",
        "category": "Telugu-English Mixed",
        "expected_doc": DOC_TB,
        "te_query": "Paediatric TB లో diagnosis కోసం gastric aspirate sample ఎలా collect చేస్తారు?",
        "en_translation": "How is gastric aspirate sample collected for diagnosis in paediatric TB?",
        "translation_quality": "faithful",
        "translation_notes": "Code-mixed medical phrasing accurately represented."
    }
]

def run_retrieval(db, query_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
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

def run_dual_retrieval(db, te_query: str, en_query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Dual retrieval: retrieves candidates from both Telugu and English query vectors, merging with RRF / max-score."""
    res_te = run_retrieval(db, te_query, top_k=top_k)
    res_en = run_retrieval(db, en_query, top_k=top_k)
    
    merged: Dict[str, Dict[str, Any]] = {}
    for r in res_te:
        merged[r["chunk_id"]] = {**r, "combined_score": r["similarity"] * 0.4}
    for r in res_en:
        if r["chunk_id"] in merged:
            merged[r["chunk_id"]]["combined_score"] += r["similarity"] * 0.6
            merged[r["chunk_id"]]["similarity"] = max(merged[r["chunk_id"]]["similarity"], r["similarity"])
        else:
            merged[r["chunk_id"]] = {**r, "combined_score": r["similarity"] * 0.6}
            
    sorted_res = sorted(merged.values(), key=lambda x: x["combined_score"], reverse=True)
    return sorted_res[:top_k]

def compute_metrics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    n = len(records)
    if n == 0:
        return {}
    r1 = sum(1 for r in records if r["rank_first_match"] == 1) / n
    r3 = sum(1 for r in records if r["rank_first_match"] is not None and r["rank_first_match"] <= 3) / n
    r5 = sum(1 for r in records if r["rank_first_match"] is not None and r["rank_first_match"] <= 5) / n
    mrr = sum(1.0 / r["rank_first_match"] for r in records if r["rank_first_match"] is not None) / n
    mean_sim = sum(r["top_similarity"] for r in records) / n
    return {
        "count": n,
        "recall_1": round(r1 * 100, 2),
        "recall_3": round(r3 * 100, 2),
        "recall_5": round(r5 * 100, 2),
        "mrr": round(mrr, 4),
        "mean_top_similarity": round(mean_sim, 4),
    }

def main():
    db = SessionLocal()
    print("="*75)
    print("MEDGUIDE AI — MULTILINGUAL RAG ARCHITECTURE DECISION BENCHMARK")
    print("="*75)

    mode_a_records = [] # Direct Telugu
    mode_b_records = [] # Translated English
    mode_c_records = [] # Dual Retrieval (Merged)
    
    category_breakdown = {}

    for item in TELUGU_BENCHMARK_SET:
        qid = item["id"]
        cat = item["category"]
        expected = item["expected_doc"]
        te_q = item["te_query"]
        en_q = item["en_translation"]

        # Mode A: Direct Telugu
        t0 = time.perf_counter()
        res_a = run_retrieval(db, te_q, top_k=5)
        dur_a_ms = (time.perf_counter() - t0) * 1000
        rank_a = next((i + 1 for i, r in enumerate(res_a) if r["doc_title"] == expected), None)
        rec_a = {
            "id": qid,
            "category": cat,
            "te_query": te_q,
            "expected_doc": expected,
            "top_similarity": res_a[0]["similarity"] if res_a else 0.0,
            "rank_first_match": rank_a,
            "results": res_a,
            "latency_ms": dur_a_ms
        }
        mode_a_records.append(rec_a)

        # Mode B: Translated English
        t0 = time.perf_counter()
        res_b = run_retrieval(db, en_q, top_k=5)
        dur_b_ms = (time.perf_counter() - t0) * 1000
        rank_b = next((i + 1 for i, r in enumerate(res_b) if r["doc_title"] == expected), None)
        rec_b = {
            "id": qid,
            "category": cat,
            "en_translation": en_q,
            "expected_doc": expected,
            "top_similarity": res_b[0]["similarity"] if res_b else 0.0,
            "rank_first_match": rank_b,
            "results": res_b,
            "latency_ms": dur_b_ms
        }
        mode_b_records.append(rec_b)

        # Mode C: Dual Retrieval
        t0 = time.perf_counter()
        res_c = run_dual_retrieval(db, te_q, en_q, top_k=5)
        dur_c_ms = (time.perf_counter() - t0) * 1000
        rank_c = next((i + 1 for i, r in enumerate(res_c) if r["doc_title"] == expected), None)
        rec_c = {
            "id": qid,
            "category": cat,
            "expected_doc": expected,
            "top_similarity": res_c[0]["similarity"] if res_c else 0.0,
            "rank_first_match": rank_c,
            "results": res_c,
            "latency_ms": dur_c_ms
        }
        mode_c_records.append(rec_c)

        if cat not in category_breakdown:
            category_breakdown[cat] = {"mode_a": [], "mode_b": [], "mode_c": []}
        category_breakdown[cat]["mode_a"].append(rec_a)
        category_breakdown[cat]["mode_b"].append(rec_b)
        category_breakdown[cat]["mode_c"].append(rec_c)

    # Compute overall and category metrics
    m_a = compute_metrics(mode_a_records)
    m_b = compute_metrics(mode_b_records)
    m_c = compute_metrics(mode_c_records)

    print("\n--- AGGREGATE BENCHMARK RESULTS (22 Diverse Telugu Queries) ---")
    print(f"Mode A (Direct Telugu)     : Recall@1: {m_a['recall_1']}%, Recall@3: {m_a['recall_3']}%, Recall@5: {m_a['recall_5']}%, MRR: {m_a['mrr']}, Mean Sim: {m_a['mean_top_similarity']}")
    print(f"Mode B (Translated English): Recall@1: {m_b['recall_1']}%, Recall@3: {m_b['recall_3']}%, Recall@5: {m_b['recall_5']}%, MRR: {m_b['mrr']}, Mean Sim: {m_b['mean_top_similarity']}")
    print(f"Mode C (Dual Merged)       : Recall@1: {m_c['recall_1']}%, Recall@3: {m_c['recall_3']}%, Recall@5: {m_c['recall_5']}%, MRR: {m_c['mrr']}, Mean Sim: {m_c['mean_top_similarity']}")

    print("\n--- CATEGORY-BY-CATEGORY BREAKDOWN ---")
    cat_metrics = {}
    for cat, data in category_breakdown.items():
        cm_a = compute_metrics(data["mode_a"])
        cm_b = compute_metrics(data["mode_b"])
        cm_c = compute_metrics(data["mode_c"])
        cat_metrics[cat] = {"mode_a": cm_a, "mode_b": cm_b, "mode_c": cm_c}
        print(f"[{cat}] (N={len(data['mode_a'])}) | Direct R@1: {cm_a['recall_1']}% | Translated R@1: {cm_b['recall_1']}% | Dual R@1: {cm_c['recall_1']}%")

    # -----------------------------------------------------------------------
    # Translation Quality Inspection
    # -----------------------------------------------------------------------
    translation_quality_audit = []
    for item in TELUGU_BENCHMARK_SET:
        translation_quality_audit.append({
            "id": item["id"],
            "category": item["category"],
            "te_query": item["te_query"],
            "en_translation": item["en_translation"],
            "classification": item["translation_quality"],
            "clinical_notes": item["translation_notes"]
        })

    # -----------------------------------------------------------------------
    # RAG Grounding Comparison on Qwen3:4B
    # -----------------------------------------------------------------------
    print("\n--- RUNNING QWEN GROUNDING COMPARISON (Direct vs Translated) ---")
    gateway = OllamaGateway(model="qwen3:4b", base_url="http://localhost:11434")

    qwen_comparisons = []
    sample_items = [TELUGU_BENCHMARK_SET[4], TELUGU_BENCHMARK_SET[5], TELUGU_BENCHMARK_SET[17]] # HTN, Malaria pregnancy negation, Rural colloquial

    for s in sample_items:
        qid = s["id"]
        rec_a = next(r for r in mode_a_records if r["id"] == qid)
        rec_b = next(r for r in mode_b_records if r["id"] == qid)

        ctx_a = "\n\n".join([f"[{i+1}] Source: {c['doc_title']}\nExcerpt: {c['content'][:350]}" for i, c in enumerate(rec_a["results"][:2])])
        ctx_b = "\n\n".join([f"[{i+1}] Source: {c['doc_title']}\nExcerpt: {c['content'][:350]}" for i, c in enumerate(rec_b["results"][:2])])

        sys_prompt = "You are MedGuide AI, an assistant for rural healthcare. Answer in Telugu based strictly on the verified medical context. Return JSON with keys: answer, safety_disclaimer, citations."

        # Gen with Context A
        t0 = time.time()
        resp_a = gateway.generate(system_prompt=sys_prompt, user_prompt=f"--- VERIFIED MEDICAL CONTEXT ---\n{ctx_a}\n\nPatient Query (Telugu): {s['te_query']}", max_tokens=300, temperature=0.2, format="json")
        dur_a = time.time() - t0

        # Gen with Context B
        t0 = time.time()
        resp_b = gateway.generate(system_prompt=sys_prompt, user_prompt=f"--- VERIFIED MEDICAL CONTEXT ---\n{ctx_b}\n\nPatient Query (Telugu): {s['te_query']}", max_tokens=300, temperature=0.2, format="json")
        dur_b = time.time() - t0

        qwen_comparisons.append({
            "id": qid,
            "category": s["category"],
            "te_query": s["te_query"],
            "expected_doc": s["expected_doc"],
            "direct_retrieval": {
                "top_doc": rec_a["results"][0]["doc_title"],
                "rank": rec_a["rank_first_match"],
                "similarity": rec_a["top_similarity"],
                "qwen_response": resp_a,
                "latency_s": round(dur_a, 2)
            },
            "translated_retrieval": {
                "top_doc": rec_b["results"][0]["doc_title"],
                "rank": rec_b["rank_first_match"],
                "similarity": rec_b["top_similarity"],
                "qwen_response": resp_b,
                "latency_s": round(dur_b, 2)
            }
        })

    # Save all raw results
    out_payload = {
        "aggregate_metrics": {
            "mode_a_direct": m_a,
            "mode_b_translated": m_b,
            "mode_c_dual": m_c
        },
        "category_metrics": cat_metrics,
        "translation_quality_audit": translation_quality_audit,
        "mode_a_records": mode_a_records,
        "mode_b_records": mode_b_records,
        "mode_c_records": mode_c_records,
        "qwen_comparisons": qwen_comparisons
    }

    out_path = Path(__file__).resolve().parent / "multilingual_rag_decision_results.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_payload, f, ensure_ascii=False, indent=2)
    print(f"\nBenchmark completed. Results saved to {out_path}")
    db.close()

if __name__ == "__main__":
    main()
