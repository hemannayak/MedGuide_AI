"""Isolated E5 ONNX evaluation; never import PyTorch or change the live index."""
from pathlib import Path
import numpy as np


class OnnxE5Encoder:
    model_id = 'intfloat/multilingual-e5-small'

    def __init__(self, model_path: str, tokenizer_path: str, revision: str):
        import re
        if not re.fullmatch(r'[0-9a-f]{40}', revision):
            raise ValueError('An immutable model commit is required')
        if not Path(model_path).is_file() or not Path(tokenizer_path).is_file():
            raise ValueError('Verified local model and tokenizer artifacts are required')
        import onnxruntime as ort
        from tokenizers import Tokenizer
        options = ort.SessionOptions()
        options.intra_op_num_threads = 2
        self.session = ort.InferenceSession(model_path, sess_options=options, providers=['CPUExecutionProvider'])
        self.tokenizer = Tokenizer.from_file(tokenizer_path)
        pad_id = self.tokenizer.token_to_id('<pad>')
        if pad_id is None:
            raise ValueError('Expected E5 tokenizer padding token is missing')
        self.tokenizer.enable_padding(pad_id=pad_id, pad_token='<pad>')
        self.tokenizer.enable_truncation(max_length=512)
        self.revision = revision

    def encode(self, texts: list[str], *, query: bool) -> np.ndarray:
        if not texts or any(not text.strip() for text in texts):
            raise ValueError('Nonempty texts are required')
        prefix = 'query: ' if query else 'passage: '
        outputs = []
        for start in range(0, len(texts), 8):
            tokens = self.tokenizer.encode_batch([prefix + text for text in texts[start:start + 8]])
            ids = np.asarray([item.ids for item in tokens], dtype=np.int64)
            mask = np.asarray([item.attention_mask for item in tokens], dtype=np.int64)
            inputs = {'input_ids': ids, 'attention_mask': mask}
            names = {item.name for item in self.session.get_inputs()}
            if 'token_type_ids' in names:
                inputs['token_type_ids'] = np.zeros_like(ids)
            if names != set(inputs):
                raise ValueError('Unexpected ONNX model input contract')
            hidden = np.asarray(self.session.run(None, inputs)[0], dtype=np.float32)
            if hidden.shape != (len(tokens), ids.shape[1], 384):
                raise ValueError('Unexpected E5 token embedding shape')
            expanded_mask = mask[..., None].astype(np.float32)
            vectors = (hidden * expanded_mask).sum(axis=1) / np.maximum(expanded_mask.sum(axis=1), 1)
            norms = np.linalg.norm(vectors, axis=1)
            if not np.isfinite(vectors).all() or np.any(norms <= 0):
                raise ValueError('Invalid E5 embeddings')
            outputs.append(vectors / norms[:, None])
        return np.concatenate(outputs, axis=0)
