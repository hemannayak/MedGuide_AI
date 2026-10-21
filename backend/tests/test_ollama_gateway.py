"""Tests for OllamaGateway generation configuration and error handling."""

import os
from unittest.mock import MagicMock, patch

import httpx
import pytest

from app.services.ai_gateway import (
    AIGatewayError,
    OllamaGateway,
    build_ollama_chat_payload,
    extract_ollama_message_content,
)


class TestOllamaPayload:
    def test_qwen3_payload_includes_think_false(self):
        payload = build_ollama_chat_payload(
            model="qwen3:4b",
            system_prompt="system",
            user_prompt="user",
            max_tokens=800,
            temperature=0.2,
            format="json",
        )
        assert payload["model"] == "qwen3:4b"
        assert payload["think"] is False
        assert payload["options"]["num_predict"] == 800
        assert payload["options"]["temperature"] == 0.2
        assert payload["format"] == "json"

    def test_non_qwen3_payload_omits_think_when_disabled_globally_off(self):
        with patch.dict(os.environ, {"OLLAMA_DISABLE_THINKING": "false"}, clear=False):
            payload = build_ollama_chat_payload(
                model="llama3.2:3b",
                system_prompt="system",
                user_prompt="user",
            )
        assert "think" not in payload

    def test_extract_content_ignores_thinking_field(self):
        data = {
            "message": {
                "role": "assistant",
                "content": '{"answer": "safe guidance"}',
                "thinking": "internal chain of thought must not leak",
            }
        }
        assert extract_ollama_message_content(data) == '{"answer": "safe guidance"}'

    def test_extract_content_empty_when_missing(self):
        assert extract_ollama_message_content({"message": {}}) == ""


class TestOllamaGatewayGenerate:
    @patch("httpx.Client")
    def test_json_mode_requires_answer_and_rejects_truncation(self, client):
        response = MagicMock()
        response.json.return_value = {"message": {"content": '{"answer":"hello"}'}, "done_reason": "stop"}
        post = client.return_value.__enter__.return_value.post
        post.return_value = response
        gateway = OllamaGateway("qwen3:4b")
        assert gateway.generate("system", "user", format="json") == '{"answer":"hello"}'
        assert post.call_args.kwargs["json"]["format"]["required"] == ["answer"]
        response.json.return_value["done_reason"] = "length"
        with pytest.raises(AIGatewayError, match="output budget"):
            gateway.generate("system", "user", format="json")

    def _mock_response(self, json_data: dict, status_code: int = 200):
        mock_resp = MagicMock()
        mock_resp.status_code = status_code
        mock_resp.json.return_value = json_data
        mock_resp.raise_for_status = MagicMock()
        return mock_resp

    @patch("httpx.Client")
    def test_generate_returns_content_only(self, mock_client_cls):
        mock_client = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_client
        mock_client.post.return_value = self._mock_response(
            {
                "message": {
                    "content": "Final grounded answer.",
                    "thinking": "hidden reasoning",
                }
            }
        )

        gateway = OllamaGateway(model="qwen3:4b")
        result = gateway.generate("system", "user")

        assert result == "Final grounded answer."
        posted = mock_client.post.call_args
        assert posted[0][0].endswith("/api/chat")
        assert posted[1]["json"]["think"] is False
        assert posted[1]["json"]["model"] == "qwen3:4b"

    @patch("httpx.Client")
    def test_generate_raises_on_empty_content(self, mock_client_cls):
        mock_client = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_client
        mock_client.post.return_value = self._mock_response(
            {"message": {"content": "", "thinking": "all tokens used here"}}
        )

        gateway = OllamaGateway(model="qwen3:4b")
        with pytest.raises(AIGatewayError, match="empty assistant content"):
            gateway.generate("system", "user")

    @patch("httpx.Client")
    def test_generate_handles_timeout(self, mock_client_cls):
        mock_client = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_client
        mock_client.post.side_effect = httpx.TimeoutException("timed out")

        gateway = OllamaGateway(model="qwen3:4b", timeout_seconds=5.0)
        with pytest.raises(AIGatewayError, match="timed out"):
            gateway.generate("system", "user")

    @patch("httpx.Client")
    def test_generate_handles_http_error(self, mock_client_cls):
        mock_client = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_client
        mock_client.post.side_effect = httpx.HTTPError("connection refused")

        gateway = OllamaGateway(model="qwen3:4b")
        with pytest.raises(AIGatewayError, match="Ollama inference failed"):
            gateway.generate("system", "user")
