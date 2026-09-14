"""Temporary diagnostic: retrieval with local ONNX query embeddings."""
import sys
from pathlib import Path
import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer
from sqlalchemy import text

BACKEND = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND))

from app.db.session import engine

SNAP = Path(
    r"C:\Users\Pangoth\.cache\huggingface\hub\models--sentence-transformers--paraphrase-multilingual-MiniLM-L12-v2\snapshots\e8f8c211226b894fcb81acc59f3b34ba3efd5f42"
)
sess = ort.InferenceSession(str(SNAP / "onnx" / "model.onnx"), providers=["CPUExecutionProvider"])
tok = Tokenizer.from_file(str(SNAP / "tokenizer.json"))


def embed(text: str) -> np.ndarray:
    enc = tok.encode(text)
    input_ids = np.array([enc.ids], dtype=np.int64)
    attention_mask = np.array([[1] * len(enc.ids)], dtype=np.int64)
    token_type_ids = np.array([[0] * len(enc.ids)], dtype=np.int64)
    feed = {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "token_type_ids": token_type_ids,
    }
    arr = np.array(sess.run(None, feed)[0])
    mask = attention_mask.astype(float)[:, :, None]
    vec = (arr * mask).sum(axis=1) / mask.sum(axis=1)
    vec = vec[0]
    norm = np.linalg.norm(vec)
    return vec / norm if norm else vec


queries = [
    ("EN-malaria", "What is the recommended treatment for uncomplicated malaria?"),
    ("EN-hypertension", "What are the first-line pharmacological treatments for hypertension in adults?"),
]

with engine.connect() as conn:
    for label, q in queries:
        qemb = embed(q)
        emb_str = "[" + ",".join(str(float(x)) for x in qemb.tolist()) + "]"
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
        sys.stdout.buffer.write(f"\n[{label}]\n".encode("utf-8"))
        for title, sim in rows:
            line = f"  {float(sim):.4f}  {title}\n"
            sys.stdout.buffer.write(line.encode("utf-8"))
