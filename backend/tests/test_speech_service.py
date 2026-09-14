"""
MedGuide AI — Speech Gateway & Voice Interaction Tests (Phase 2)
=================================================================
Automated unit and integration tests for STT (Speech-to-Text) and TTS (Text-to-Speech)
gateways and REST endpoints.
"""

import base64
import io
from unittest.mock import MagicMock, patch

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.speech import STTResponse, TTSRequest, TTSResponse
from app.services.speech_service import (
    DisabledSpeechGateway,
    MockSpeechGateway,
    SarvamSpeechGateway,
    SpeechError,
    create_speech_gateway,
)


@pytest.fixture
def client():
    return TestClient(app)


# ---------------------------------------------------------------------------
# Unit Tests — MockSpeechGateway
# ---------------------------------------------------------------------------
def test_mock_stt_telugu():
    gateway = MockSpeechGateway()
    assert gateway.is_online is False
    assert gateway.provider_name == "mock"

    res = gateway.stt(b"fake_audio_bytes", filename="test.wav", language_code="te")
    assert isinstance(res, STTResponse)
    assert res.language_detected == "te"
    assert "జ్వరం" in res.transcript
    assert res.confidence == 0.98


def test_mock_stt_hindi():
    gateway = MockSpeechGateway()
    res = gateway.stt(b"fake_audio_bytes", filename="test.wav", language_code="hi")
    assert res.language_detected == "hi"
    assert "बुखार" in res.transcript


def test_mock_stt_english():
    gateway = MockSpeechGateway()
    res = gateway.stt(b"fake_audio_bytes", filename="test.wav", language_code="en")
    assert res.language_detected == "en"
    assert "fever" in res.transcript


def test_mock_tts_synthesis():
    gateway = MockSpeechGateway()
    res = gateway.tts(text="నమస్కారం", language="te", speaker="meera")
    assert isinstance(res, TTSResponse)
    assert res.format == "mp3"
    assert res.audio_base64 is not None
    # Validate base64 decoding
    decoded = base64.b64decode(res.audio_base64)
    assert len(decoded) > 0


# ---------------------------------------------------------------------------
# Unit Tests — DisabledSpeechGateway (Offline Fallback)
# ---------------------------------------------------------------------------
def test_disabled_speech_gateway():
    gateway = DisabledSpeechGateway()
    assert gateway.is_online is False
    assert gateway.provider_name == "disabled"

    with pytest.raises(SpeechError, match="offline or disabled"):
        gateway.stt(b"fake_audio")

    with pytest.raises(SpeechError, match="offline or disabled"):
        gateway.tts("test text")


# ---------------------------------------------------------------------------
# Unit Tests — SarvamSpeechGateway Contract & Guards
# ---------------------------------------------------------------------------
def test_sarvam_speech_gateway_guards():
    # Without API key
    gw_no_key = SarvamSpeechGateway(api_key="")
    assert gw_no_key.is_online is True
    assert gw_no_key.provider_name == "sarvam"

    with pytest.raises(SpeechError, match="SARVAM_API_KEY is not configured"):
        gw_no_key.stt(b"audio")

    with pytest.raises(SpeechError, match="SARVAM_API_KEY is not configured"):
        gw_no_key.tts("text")

    # With key but empty payloads
    gw_with_key = SarvamSpeechGateway(api_key="mock_key")
    with pytest.raises(SpeechError, match="Audio payload is empty"):
        gw_with_key.stt(b"")

    with pytest.raises(SpeechError, match="Text payload for TTS is empty"):
        gw_with_key.tts("   ")


# ---------------------------------------------------------------------------
# API Integration Tests — POST /api/v1/speech/stt
# ---------------------------------------------------------------------------
def test_api_stt_success(client):
    fake_wav = io.BytesIO(b"RIFF....WAVEfmt ....data....fake_audio_content")
    
    with patch("app.api.v1.endpoints.speech.create_speech_gateway", return_value=MockSpeechGateway()):
        response = client.post(
            "/api/v1/speech/stt",
            files={"file": ("recording.wav", fake_wav, "audio/wav")},
            data={"language_code": "te"},
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "transcript" in data
        assert data["language_detected"] == "te"
        assert data["provider"] == "mock"


def test_api_stt_empty_file_rejected(client):
    empty_wav = io.BytesIO(b"")
    response = client.post(
        "/api/v1/speech/stt",
        files={"file": ("empty.wav", empty_wav, "audio/wav")},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "empty" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# API Integration Tests — POST /api/v1/speech/tts
# ---------------------------------------------------------------------------
def test_api_tts_success(client):
    payload = {
        "text": "మలేరియా నివారణకు దోమతెరలు ఉపయోగించండి.",
        "language": "te",
        "speaker": "meera",
        "format": "mp3",
    }
    with patch("app.api.v1.endpoints.speech.create_speech_gateway", return_value=MockSpeechGateway()):
        response = client.post("/api/v1/speech/tts", json=payload)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "audio_base64" in data
        assert data["format"] == "mp3"
        assert data["provider"] == "mock"


def test_api_tts_empty_text_rejected(client):
    payload = {"text": "   ", "language": "te"}
    response = client.post("/api/v1/speech/tts", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY or response.status_code == status.HTTP_400_BAD_REQUEST


def test_api_speech_offline_service_unavailable(client):
    payload = {"text": "Sample text", "language": "en"}
    with patch("app.api.v1.endpoints.speech.create_speech_gateway", return_value=DisabledSpeechGateway()):
        response = client.post("/api/v1/speech/tts", json=payload)
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert "unavailable" in response.json()["detail"].lower()
