"""Download pinned public E5 ONNX artifacts and run isolated connectivity checks."""
import argparse
import hashlib
import json
from pathlib import Path
import time
import numpy as np
from huggingface_hub import HfApi, hf_hub_download
from app.services.onnx_candidate_encoder import OnnxE5Encoder


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', action='store_true')
    if not parser.parse_args().run:
        parser.error('Use --run to acquire the public evaluation model')
    root = Path(__file__).resolve().parents[1]
    revision = HfApi().model_info(OnnxE5Encoder.model_id).sha
    artifacts = {}
    for name in ('onnx/model.onnx', 'tokenizer.json', 'tokenizer_config.json', 'config.json'):
        path = hf_hub_download(OnnxE5Encoder.model_id, name, revision=revision,
                               cache_dir=str(root / '.model-cache/research/e5-onnx'))
        artifacts[name] = {'path': path, 'sha256': hashlib.sha256(Path(path).read_bytes()).hexdigest()}
    encoder = OnnxE5Encoder(artifacts['onnx/model.onnx']['path'], artifacts['tokenizer.json']['path'], revision)
    started = time.perf_counter()
    queries = encoder.encode(['What is asthma?', 'अस्थमा क्या है?', 'ఆస్తమా అంటే ఏమిటి?'], query=True)
    passages = encoder.encode(['Asthma information.', 'Synthetic unrelated document about a bicycle.'], query=False)
    scores = queries @ passages.T
    report = {'model': encoder.model_id, 'revision': revision, 'runtime': 'onnxruntime CPU',
              'artifacts': {name: {'sha256': value['sha256']} for name, value in artifacts.items()},
              'query_shape': list(queries.shape), 'passage_shape': list(passages.shape),
              'finite': bool(np.isfinite(scores).all()), 'toy_similarity_scores': scores.tolist(),
              'elapsed_seconds': time.perf_counter() - started,
              'evaluation_kind': 'connectivity_and_toy_ranking_only', 'clinical_accuracy_measured': False,
              'active_encoder_changed': False, 'live_index_modified': False}
    (root / 'evaluation/onnx_e5_smoke.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
