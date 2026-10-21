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
    # These endpoint contract tests isolate speech processing after consent.
    # Authorization/withdrawal are exercised separately, never relaxed in app code.
    from app.api.deps import require_speech_consent
    previous = app.dependency_overrides.get(require_speech_consent)
    app.dependency_overrides[require_speech_consent] = lambda: object()
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        if previous is None:
            app.dependency_overrides.pop(require_speech_consent, None)
        else:
            app.dependency_overrides[require_speech_consent] = previous


def test_unauthenticated_speech_never_calls_provider():
    with TestClient(app) as test_client, patch('app.api.v1.endpoints.speech.create_speech_gateway') as provider:
        response = test_client.post('/api/v1/speech/tts', json={'text': 'SYN test', 'language': 'en'})
        assert response.status_code == 401
        provider.assert_not_called()


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


@pytest.fixture(autouse=True)
def authenticate_speech_api_tests(request):
    if not request.node.name.startswith("test_api_"):
        return
    import uuid
    client = request.getfixturevalue("client")
    identifier = f"SYN-speech-{uuid.uuid4().hex}@example.invalid"
    client.post("/api/v1/auth/register", json={"login_identifier": identifier, "password": "SyntheticTestOnly123!", "display_name": "SYN Speech Test", "preferred_language": "en"})
    response = client.post("/api/v1/auth/login", json={"login_identifier": identifier, "password": "SyntheticTestOnly123!"})
    client.headers["Authorization"] = "Bearer " + response.json()["data"]["access_token"]
    assert client.post("/api/v1/consent", json={"consent_type": "SPEECH_PROCESSING"}).status_code == 201


def test_speech_requires_authentication():
    with TestClient(app) as client:
        assert client.post("/api/v1/speech/tts", json={"text": "SYN test", "language": "en"}).status_code == 401
        assert client.post("/api/v1/speech/stt", files={"file": ("SYN.webm", b"SYN", "audio/webm")}).status_code == 401


def test_mock_speech_rejected_outside_tests(monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings, "APP_ENV", "production")
    with pytest.raises(SpeechError):
        create_speech_gateway(provider="mock")


def test_sarvam_preserves_format_and_full_text():
    from unittest.mock import MagicMock
    gateway = SarvamSpeechGateway(api_key="SYN-key")
    client = MagicMock()
    client.__enter__.return_value = client
    response = client.post.return_value
    response.json.return_value = {"transcript": "SYN transcript", "language_code": "te-IN"}
    with patch("httpx.Client", return_value=client):
        result = gateway.stt(b"SYN audio", "recording.webm", "te")
        assert client.post.call_args.kwargs["files"]["file"][2] == "audio/webm"
        assert result.confidence is None
        response.json.return_value = {"audios": ["U1lO"]}
        text = "SYN explanation. " * 80
        gateway.tts(text, "hi")
        payload = client.post.call_args.kwargs["json"]
        assert payload["text"] == text.strip()
        assert payload["language_code"] == "hi-IN"
        assert payload["output_audio_codec"] == "mp3"
        assert "inputs" not in payload and "pitch" not in payload
