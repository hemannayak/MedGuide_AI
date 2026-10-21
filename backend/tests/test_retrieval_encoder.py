from unittest.mock import MagicMock
import numpy as np
import pytest
from app.services.retrieval_encoder import CandidateEncoder


def test_e5_uses_distinct_query_and_passage_prefixes_and_normalizes():
    model = MagicMock()
    model.encode.return_value = np.ones((1,384))
    encoder = CandidateEncoder('intfloat/multilingual-e5-small','synthetic-revision', model)
    result = encoder.encode(['నాకు ఆరోగ్య సమాచారం కావాలి'], query=True)
    assert model.encode.call_args.args[0][0].startswith('query: ')
    assert np.isclose(np.linalg.norm(result[0]),1)
    encoder.encode(['SYN source'], query=False)
    assert model.encode.call_args.args[0] == ['passage: SYN source']


@pytest.mark.parametrize('output', [np.zeros((1,384)), np.ones((1,3)), np.full((1,384),np.nan)])
def test_invalid_vectors_are_rejected(output):
    model = MagicMock(); model.encode.return_value = output
    with pytest.raises(ValueError):
        CandidateEncoder('intfloat/multilingual-e5-small','synthetic-revision',model).encode(['SYN'],query=True)


def test_bge_does_not_receive_e5_prefix_and_revision_is_required():
    model = MagicMock(); model.encode.return_value = np.ones((1,1024))
    CandidateEncoder('BAAI/bge-m3','synthetic-revision',model).encode(['SYN'],query=True)
    assert model.encode.call_args.args[0] == ['SYN']
    with pytest.raises(ValueError):
        CandidateEncoder('BAAI/bge-m3','main',model)
