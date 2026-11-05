"""Staged retrieval encoders. Never write candidate vectors into the live index."""
from pathlib import Path
import numpy as np

MODELS = {'intfloat/multilingual-e5-small': 384, 'BAAI/bge-m3': 1024,
          'NeuML/pubmedbert-base-embeddings': 768}


class CandidateEncoder:
    def __init__(self, model_id: str, revision: str, model=None):
        if model_id not in MODELS:
            raise ValueError('Unsupported retrieval candidate')
        if not revision or revision == 'main':
            raise ValueError('Pin a model revision for reproducible evaluation')
        self.model_id, self.revision = model_id, revision
        if model is None:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer(model_id, revision=revision,
                cache_folder=str(Path(__file__).resolve().parents[2] / '.model-cache'),
                device='cpu', trust_remote_code=False)
        self.model = model

    def encode(self, texts: list[str], *, query: bool) -> np.ndarray:
        if not texts or any(not text.strip() for text in texts):
            raise ValueError('Nonempty texts are required')
        # E5 requires role prefixes for both English and non-English texts.
        prefix = ('query: ' if query else 'passage: ') if self.model_id.startswith('intfloat/') else ''
        vectors = np.asarray(self.model.encode([prefix + text for text in texts],
            normalize_embeddings=True, convert_to_numpy=True, batch_size=8), dtype=np.float32)
        if vectors.shape != (len(texts), MODELS[self.model_id]) or not np.isfinite(vectors).all():
            raise ValueError('Invalid candidate embedding output')
        norms = np.linalg.norm(vectors, axis=1)
        if np.any(norms <= 0):
            raise ValueError('Zero candidate embedding output')
        return vectors / norms[:, None]
