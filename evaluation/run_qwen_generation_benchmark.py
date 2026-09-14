"""
MedGuide AI — Qwen3:4B generation benchmark (controlled).
Compares thinking-enabled vs think=false payloads, then RAG end-to-end.
"""
from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCRIPTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPTS_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))
os.chdir(str(PROJECT_ROOT))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR / ".env")

import httpx
from sqlalchemy import text

from app.db.session import SessionLocal
from app.services.ai_gateway import (
    OllamaGateway,
    build_ollama_chat_payload,
    extract_ollama_message_content,
)
from app.services.ai_service import retrieve_relevant_chunks, build_grounded_prompt
from app.services.knowledge_service import generate_embedding

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL = os.getenv("AI_MODEL", "qwen3:4b")
SYSTEM = (
    "You are MedGuide AI. Provide safe preliminary health information only. "
    "Do not diagnose. Recommend professional care when appropriate."
)

BENCHMARK_PROMPTS = [
    ("EN-1", "en", "What is the recommended first-line treatment for uncomplicated malaria in adults?"),
    ("EN-2", "en", "What are the first-line pharmacological treatments for hypertension in adults?"),
    ("HI-1", "hi", "वयस्कों में अनजट मलेरिया का प्राथमिक उपचार क्या है?"),
    ("HI-2", "hi", "उच्च रक्तचाप के लिए पहली पंक्ति की दवा क्या है?"),
    ("TE-1", "te", "పెద్దలలో సరళమైన మలేరియాకు మొదటి స్థాయి చికిత్స ఏమిటి?"),
]

RAG_PROMPTS = [
    ("EN-R1", "en", "What is the recommended treatment for uncomplicated malaria?"),
    ("EN-R2", "en", "What are first-line treatments for hypertension in adults?"),
    ("HI-R1", "hi", "वयस्कों में मलेरिया का उपचार क्या है?"),
    ("HI-R2", "hi", "उच्च रक्तचाप की दवा क्या है?"),
    ("TE-R1", "te", "మలేరియా చికిత్స ఏమిటి?"),
    ("TE-R2", "te", "అధిక రక్తపోటు చికిత్స ఏమిటి?"),
]


def _content_shows_reasoning_leak(content: str) -> bool:
    lower = content.lower()
    return (
        "redacted_thinking" in lower
        or lower.lstrip().startswith("okay, the user")
    )


def _chat_raw(payload: Dict[str, Any], timeout: float = 180.0) -> Dict[str, Any]:
    start = time.perf_counter()
    with httpx.Client(timeout=timeout) as client:
        resp = client.post(f"{OLLAMA_BASE}/api/chat", json=payload)
        resp.raise_for_status()
        data = resp.json()
    elapsed = time.perf_counter() - start
    msg = data.get("message") or {}
    eval_count = data.get("eval_count")
    eval_duration_ns = data.get("eval_duration")
    tokens_per_sec = None
    if eval_count and eval_duration_ns:
        tokens_per_sec = round(eval_count / (eval_duration_ns / 1e9), 2)
    return {
        "latency_s": round(elapsed, 2),
        "content": extract_ollama_message_content(data),
        "thinking_len": len(msg.get("thinking") or ""),
        "content_len": len(msg.get("content") or ""),
        "eval_count": eval_count,
        "tokens_per_sec": tokens_per_sec,
        "thinking_exposed_in_content": _content_shows_reasoning_leak(msg.get("content") or ""),
    }


def run_latency_benchmark() -> List[Dict[str, Any]]:
    results = []
    for label, lang, prompt in BENCHMARK_PROMPTS:
        user = f"[Language: {lang}] {prompt}"
        before_payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": user},
            ],
            "stream": False,
            "options": {"num_predict": 400, "temperature": 0.2},
        }
        after_payload = build_ollama_chat_payload(
            model=MODEL,
            system_prompt=SYSTEM,
            user_prompt=user,
            max_tokens=400,
            temperature=0.2,
        )
        before = _chat_raw(before_payload)
        after = _chat_raw(after_payload)
        results.append({
            "id": label,
            "language": lang,
            "prompt": prompt,
            "before": before,
            "after": after,
        })
        print(f"[{label}] before={before['latency_s']}s after={after['latency_s']}s "
              f"content_len before/after={before['content_len']}/{after['content_len']}")
    return results


def run_rag_e2e() -> List[Dict[str, Any]]:
    db = SessionLocal()
    gateway = OllamaGateway(model=MODEL, base_url=OLLAMA_BASE)
    results = []
    try:
        for label, lang, query in RAG_PROMPTS:
            t0 = time.perf_counter()
            chunks = retrieve_relevant_chunks(
                db=db,
                query=query,
                top_k_candidates=10,
                top_k_context=4,
                similarity_threshold=0.55,
            )
            retrieval_ms = round((time.perf_counter() - t0) * 1000, 1)
            if not chunks:
                results.append({"id": label, "query": query, "language": lang, "retrieval": [], "error": "no chunks"})
                continue
            top = chunks[0]
            system_prompt, user_prompt = build_grounded_prompt(query, chunks, lang, "")
            gen_start = time.perf_counter()
            try:
                raw = gateway.generate(system_prompt, user_prompt, max_tokens=800, temperature=0.2, format="json")
                gen_s = round(time.perf_counter() - gen_start, 2)
                llm_error = None
            except Exception as e:
                raw = ""
                gen_s = round(time.perf_counter() - gen_start, 2)
                llm_error = str(e)
            results.append({
                "id": label,
                "language": lang,
                "query": query,
                "top_document": top.get("document_title"),
                "similarity": round(float(top.get("similarity", 0)), 4),
                "evidence_preview": (top.get("content") or "")[:200],
                "retrieval_ms": retrieval_ms,
                "generation_s": gen_s,
                "total_s": round(retrieval_ms / 1000 + gen_s, 2),
                "response_preview": raw[:400] if raw else None,
                "llm_error": llm_error,
                "embedding_dim": len(generate_embedding(query)),
            })
            print(f"[{label}] sim={top.get('similarity'):.4f} gen={gen_s}s doc={top.get('document_title','')[:40]}")
    finally:
        db.close()
    return results


def main():
    print("=== Qwen3:4B Latency Benchmark ===")
    latency = run_latency_benchmark()
    print("\n=== RAG End-to-End ===")
    rag = run_rag_e2e()
    out = {
        "model": MODEL,
        "ollama_base": OLLAMA_BASE,
        "latency_benchmark": latency,
        "rag_e2e": rag,
    }
    out_path = SCRIPTS_DIR / "qwen_generation_benchmark_results.json"
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWrote {out_path}")
    return out


if __name__ == "__main__":
    main()
