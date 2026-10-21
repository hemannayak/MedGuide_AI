"""Provider contract tests; no real medical or paid inference."""
import os
from unittest.mock import MagicMock, patch

import httpx
import pytest

from app.services.ai_gateway import AIGatewayError, SarvamGateway, create_ai_gateway


@pytest.mark.parametrize("content,finish,valid", [
    ('{"answer":"hello"}', "stop", True),
    ("", "stop", False),
    (None, "stop", False),
    ('{"answer":', "length", False),
])
def test_answer_contract(content, finish, valid):
    response = MagicMock()
    response.json.return_value = {"choices": [{"message": {"content": content},
                                               "finish_reason": finish}]}
    with patch("httpx.Client") as client:
        client.return_value.__enter__.return_value.post.return_value = response
        gateway = SarvamGateway("sarvam-105b-conversations", "synthetic-key")
        if valid:
            assert gateway.generate("grounded system", "synthetic user", format="json") == content
            args = client.return_value.__enter__.return_value.post.call_args.kwargs
            assert args["json"]["response_format"] == {"type": "json_object"}
            assert args["json"]["messages"][0]["role"] == "system"
            assert args["headers"]["api-subscription-key"] == "synthetic-key"
        else:
            with pytest.raises(AIGatewayError):
                gateway.generate("system", "user")


def test_http_errors_do_not_expose_provider_body():
    response = httpx.Response(429, text="private patient text", request=httpx.Request("POST", "https://api.sarvam.ai"))
    with patch("httpx.Client") as client:
        client.return_value.__enter__.return_value.post.return_value = response
        with pytest.raises(AIGatewayError, match="HTTP 429") as failure:
            SarvamGateway("sarvam-105b-conversations", "key").generate("system", "user")
        assert "private patient" not in str(failure.value)


def test_factory_requires_key_and_preserves_model_choice():
    with patch.dict(os.environ, {"SARVAM_API_KEY": ""}):
        with pytest.raises(AIGatewayError, match="SARVAM_API_KEY"):
            create_ai_gateway("sarvam", "sarvam-105b")
    with patch.dict(os.environ, {"SARVAM_API_KEY": "synthetic-key"}):
        assert create_ai_gateway("sarvam", "sarvam-105b").provider_name == "sarvam/sarvam-105b"
