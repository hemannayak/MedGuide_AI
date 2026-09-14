"""Temporary diagnostic: retrieval with current hash query embeddings."""
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND))

from sqlalchemy import text
from app.db.session import engine
from app.services.knowledge_service import generate_embedding, get_embedding_model

queries = [
    ("EN-malaria", "What is the recommended treatment for uncomplicated malaria?"),
    ("EN-hypertension", "What are the first-line pharmacological treatments for hypertension in adults?"),
    ("HI-fever", "बुखार और सांस लेने में तकलीफ का प्राथमिक उपचार क्या है?"),
]

print("get_embedding_model():", get_embedding_model())
print("mode: HASH FALLBACK" if get_embedding_model() is None else "mode: SEMANTIC")

with engine.connect() as conn:
    for label, q in queries:
        qemb = generate_embedding(q)
        emb_str = "[" + ",".join(str(float(x)) for x in qemb) + "]"
        rows = conn.execute(
            text(
                """
                SELECT md.title,
                       1 - (kc.embedding <=> CAST(:emb AS vector)) AS similarity
                FROM knowledge_chunks kc
                JOIN medical_documents md ON md.id = kc.document_id
                WHERE md.review_status = 'APPROVED'
                ORDER BY kc.embedding <=> CAST(:emb AS vector)
                LIMIT 3
                """
            ),
            {"emb": emb_str},
        ).fetchall()
        print(f"\n[{label}] {q[:70]}")
        for title, sim in rows:
            print(f"  {float(sim):.4f}  {str(title)[:60]}")
