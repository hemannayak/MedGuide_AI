from unittest.mock import MagicMock, patch

import pytest

from app.services.ai_service import retrieve_relevant_chunks
from app.services.knowledge_service import EmbeddingUnavailableError, generate_embedding


def test_missing_model_never_returns_synthetic_embeddings():
    with patch("app.services.knowledge_service.get_embedding_model", return_value=None):
        with pytest.raises(EmbeddingUnavailableError):
            generate_embedding("synthetic test query")


def test_encoding_failure_never_returns_synthetic_embeddings():
    model = MagicMock()
    model.encode.side_effect = RuntimeError("private model error")
    with patch("app.services.knowledge_service.get_embedding_model", return_value=model):
        with pytest.raises(EmbeddingUnavailableError, match="service unavailable"):
            generate_embedding("synthetic test query")


def test_embedding_failure_prevents_vector_search():
    db = MagicMock()
    with patch("app.services.ai_service.generate_embedding", side_effect=EmbeddingUnavailableError):
        assert retrieve_relevant_chunks(db, "synthetic test query") == []
    db.execute.assert_not_called()


def test_wrong_embedding_dimensions_are_rejected():
    model = MagicMock()
    model.encode.return_value.tolist.return_value = [0.1] * 3
    with patch("app.services.knowledge_service.get_embedding_model", return_value=model):
        with pytest.raises(EmbeddingUnavailableError, match="dimension mismatch"):
            generate_embedding("synthetic test query")
