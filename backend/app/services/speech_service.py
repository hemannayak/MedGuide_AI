"""
MedGuide AI — Speech Gateway & Service (Phase 2 Voice Interaction Layer)
========================================================================
Provider-agnostic Speech-to-Text (STT) and Text-to-Speech (TTS) interface:
  - MockSpeechGateway       : Deterministic test fixture. Zero network dependencies.
  - SarvamSpeechGateway     : Online Indic STT (Saaras) & TTS (Bulbul) via Sarvam AI API.
  - DisabledSpeechGateway   : Offline fallback (fails closed with safe error).

Privacy & Audio Minimization:
  - Voice audio blobs are processed ephemerally in memory and discarded immediately.
  - No patient voice recordings are permanently written to database or disk.
"""

import base64
import logging
import os
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Tuple

from app.schemas.speech import STTResponse, TTSResponse

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Abstract Interface
# ---------------------------------------------------------------------------
class SpeechGateway(ABC):
    """Provider-agnostic speech interface for MedGuide AI."""

    @abstractmethod
    def stt(
        self,
        audio_bytes: bytes,
        filename: str = "audio.wav",
        language_code: Optional[str] = None,
    ) -> STTResponse:
        """
        Convert patient speech audio to text transcript.
        """
        ...

    @abstractmethod
    def tts(
        self,
        text: str,
        language: str = "te",
        speaker: str = "meera",
    ) -> TTSResponse:
        """
        Synthesize text into spoken audio.
        """
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Provider identifier for auditing."""
        ...

    @property
    @abstractmethod
    def is_online(self) -> bool:
        """True if gateway requires internet connectivity."""
        ...


class SpeechError(Exception):
    """Raised when speech processing fails."""
    pass


# ---------------------------------------------------------------------------
# MockSpeechGateway — Deterministic test fixture
# ---------------------------------------------------------------------------
class MockSpeechGateway(SpeechGateway):
    """
    Deterministic mock speech gateway for automated tests and offline dev.
    """

    @property
    def provider_name(self) -> str:
        return "mock"

    @property
    def is_online(self) -> bool:
        return False

    def stt(
        self,
        audio_bytes: bytes,
        filename: str = "audio.wav",
        language_code: Optional[str] = None,
    ) -> STTResponse:
        logger.debug("[MockSpeechGateway] Performing deterministic speech transcription")
        # Deterministic transcript based on language
        lang = (language_code or "te").split("-")[0].lower()
        mock_transcripts = {
            "te": "నాకు రెండు రోజులుగా తీవ్రమైన జ్వరం మరియు తలనొప్పి ఉంది",
            "hi": "मुझे दो दिनों से तेज बुखार और सिरदर्द है",
            "en": "I have had high fever and headache for two days",
        }
        transcript = mock_transcripts.get(lang, mock_transcripts["en"])
        return STTResponse(
            transcript=transcript,
            language_detected=lang,
            confidence=0.98,
            duration_seconds=2.5,
            provider="mock",
        )

    def tts(
        self,
        text: str,
        language: str = "te",
        speaker: str = "meera",
    ) -> TTSResponse:
        logger.debug("[MockSpeechGateway] Performing deterministic voice synthesis")
        # Return dummy base64 MP3 frame (16 bytes)
        dummy_audio = b"ID3\x03\x00\x00\x00\x00\x00\x00\xff\xfb\x90\x44\x00\x00"
        return TTSResponse(
            audio_base64=base64.b64encode(dummy_audio).decode("utf-8"),
            format="mp3",
            duration_seconds=3.0,
            provider="mock",
        )


# ---------------------------------------------------------------------------
# SarvamSpeechGateway — Online Indic STT (Saaras) & TTS (Bulbul)
# ---------------------------------------------------------------------------
SARVAM_STT_URL = os.getenv("SARVAM_STT_URL", "https://api.sarvam.ai/speech-to-text")
SARVAM_TTS_URL = os.getenv("SARVAM_TTS_URL", "https://api.sarvam.ai/text-to-speech")
SARVAM_SPEECH_TIMEOUT_SECONDS = float(os.getenv("SARVAM_SPEECH_TIMEOUT_SECONDS", "20.0"))

LANGUAGE_CODE_MAP = {
    "te": "te-IN",
    "hi": "hi-IN",
    "en": "en-IN",
}


class SarvamSpeechGateway(SpeechGateway):
    """
    Online STT & TTS gateway via Sarvam AI REST API.
    Uses Saaras model for speech-to-text and Bulbul model for text-to-speech.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        stt_url: str = SARVAM_STT_URL,
        tts_url: str = SARVAM_TTS_URL,
        timeout_seconds: float = SARVAM_SPEECH_TIMEOUT_SECONDS,
    ):
        self.api_key = api_key or os.getenv("SARVAM_API_KEY", "")
        self.stt_url = stt_url
        self.tts_url = tts_url
        self.timeout_seconds = timeout_seconds

        if not self.api_key:
            logger.warning("[SarvamSpeechGateway] Initialized without SARVAM_API_KEY. Online calls will fail closed.")

    @property
    def provider_name(self) -> str:
        return "sarvam"

    @property
    def is_online(self) -> bool:
        return True

    def stt(
        self,
        audio_bytes: bytes,
        filename: str = "audio.wav",
        language_code: Optional[str] = None,
    ) -> STTResponse:
        if not self.api_key:
            raise SpeechError("SARVAM_API_KEY is not configured. Online STT unavailable.")
        if not audio_bytes:
            raise SpeechError("Audio payload is empty.")

        try:
            import httpx
        except ImportError:
            raise SpeechError("httpx is required for SarvamSpeechGateway.")

        # Resolve Indic language tag
        lang_tag = LANGUAGE_CODE_MAP.get(language_code.lower() if language_code else "", "unknown")
        if language_code and "-IN" in language_code:
            lang_tag = language_code

        headers = {
            "api-subscription-key": self.api_key,
        }
        files = {
            "file": (filename or "audio.wav", audio_bytes, "audio/wav"),
        }
        data = {
            "model": "saaras:v2",
        }
        if lang_tag != "unknown":
            data["language_code"] = lang_tag

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.post(
                    self.stt_url,
                    headers=headers,
                    files=files,
                    data=data,
                )
                response.raise_for_status()
                res_data = response.json()
                transcript = res_data.get("transcript", "").strip()
                detected_lang = res_data.get("language_code", lang_tag).split("-")[0]

                return STTResponse(
                    transcript=transcript,
                    language_detected=detected_lang,
                    confidence=float(res_data.get("confidence", 0.95)),
                    provider="sarvam",
                )
        except httpx.TimeoutException as e:
            logger.error(f"[SarvamSpeechGateway] STT timed out after {self.timeout_seconds}s")
            raise SpeechError(f"Sarvam STT timed out: {e}") from e
        except httpx.HTTPError as e:
            logger.error(f"[SarvamSpeechGateway] STT HTTP error: {e}")
            raise SpeechError(f"Sarvam STT HTTP error: {e}") from e
        except Exception as e:
            logger.error(f"[SarvamSpeechGateway] STT failed: {e}")
            raise SpeechError(f"Sarvam STT failed: {e}") from e

    def tts(
        self,
        text: str,
        language: str = "te",
        speaker: str = "kavitha",
    ) -> TTSResponse:
        if not self.api_key:
            raise SpeechError("SARVAM_API_KEY is not configured. Online TTS unavailable.")
        clean_text = text.strip()
        if not clean_text:
            raise SpeechError("Text payload for TTS is empty.")

        try:
            import httpx
        except ImportError:
            raise SpeechError("httpx is required for SarvamSpeechGateway.")

        lang_tag = LANGUAGE_CODE_MAP.get(language.lower(), "te-IN")

        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "inputs": [clean_text[:500]], # Synthesize up to 500 characters per utterance
            "target_language_code": lang_tag,
            "speaker": speaker or "kavitha",
            "pitch": 0,
            "pace": 1.0,
            "loudness": 1.0,
            "speech_sample_rate": 8000,
            "enable_preprocessing": True,
            "model": "bulbul:v3",
        }

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.post(
                    self.tts_url,
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                res_data = response.json()
                audios = res_data.get("audios", [])
                if not audios:
                    raise SpeechError("Sarvam TTS returned empty audio payload.")

                return TTSResponse(
                    audio_base64=audios[0],
                    format="mp3",
                    duration_seconds=None,
                    provider="sarvam",
                )
        except httpx.TimeoutException as e:
            logger.error(f"[SarvamSpeechGateway] TTS timed out after {self.timeout_seconds}s")
            raise SpeechError(f"Sarvam TTS timed out: {e}") from e
        except httpx.HTTPError as e:
            logger.error(f"[SarvamSpeechGateway] TTS HTTP error: {e}")
            raise SpeechError(f"Sarvam TTS HTTP error: {e}") from e
        except Exception as e:
            logger.error(f"[SarvamSpeechGateway] TTS failed: {e}")
            raise SpeechError(f"Sarvam TTS failed: {e}") from e


# ---------------------------------------------------------------------------
# DisabledSpeechGateway — Offline fallback
# ---------------------------------------------------------------------------
class DisabledSpeechGateway(SpeechGateway):
    """
    Offline fallback gateway. Explicitly raises SpeechError so callers handle offline mode gracefully.
    """

    @property
    def provider_name(self) -> str:
        return "disabled"

    @property
    def is_online(self) -> bool:
        return False

    def stt(self, audio_bytes: bytes, filename: str = "audio.wav", language_code: Optional[str] = None) -> STTResponse:
        raise SpeechError("Speech-to-text service is offline or disabled.")

    def tts(self, text: str, language: str = "te", speaker: str = "meera") -> TTSResponse:
        raise SpeechError("Text-to-speech service is offline or disabled.")


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------
def create_speech_gateway(
    provider: Optional[str] = None,
    api_key: Optional[str] = None,
) -> SpeechGateway:
    """
    Create SpeechGateway based on environment or explicit parameter.
    Configuration:
      SPEECH_PROVIDER: sarvam | mock | disabled (default: sarvam if SARVAM_API_KEY else mock)
    """
    env_provider = os.getenv("SPEECH_PROVIDER")
    if provider is None:
        if env_provider:
            provider = env_provider.lower().strip()
        elif os.getenv("SARVAM_API_KEY"):
            provider = "sarvam"
        else:
            provider = "mock"

    provider = provider.lower().strip()
    if provider == "mock":
        return MockSpeechGateway()
    elif provider == "sarvam":
        return SarvamSpeechGateway(api_key=api_key)
    elif provider in {"disabled", "none", "offline"}:
        return DisabledSpeechGateway()
    else:
        logger.warning(f"[SpeechGateway] Unknown provider '{provider}', falling back to disabled.")
        return DisabledSpeechGateway()
