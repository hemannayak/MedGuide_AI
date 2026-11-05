import numpy as np
import pytest
from app.services.knowledge_service import validate_embedding, EmbeddingUnavailableError, chunk_extracted_pages


@pytest.mark.parametrize('value', [[0.0]*384, [1.0]*383, [float('nan')]*384, [float('inf')]*384, [[1.0]*384]])
def test_invalid_vectors_never_enter_pgvector(value):
    with pytest.raises(EmbeddingUnavailableError):
        validate_embedding(value)


def test_valid_encoder_vector_preserves_space_without_normalizing():
    vector = np.arange(384, dtype=np.float32)
    assert validate_embedding(vector) == vector.tolist()


@pytest.mark.parametrize('size,overlap', [(0,0), (50,50), (50,51), (50,-1)])
def test_chunk_configuration_cannot_loop_forever(size, overlap):
    with pytest.raises(ValueError):
        chunk_extracted_pages([], chunk_size=size, overlap=overlap)
