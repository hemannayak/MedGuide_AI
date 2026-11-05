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
        speaker: Optional[str] = None,
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


class NoSpeechRecognizedError(SpeechError):
    """Provider completed processing but returned no usable spoken words."""


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
        speaker: Optional[str] = None,
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


def resolve_speech_locale(language: str) -> str:
    value = (language or "").lower()
    for code, locale in LANGUAGE_CODE_MAP.items():
        if value in {code, locale.lower()}:
            return locale
    raise SpeechError("Choose English, Hindi or Telugu.")


DEFAULT_SPEAKERS = {
    "te": "shubh",
    "hi": "shubh",
    "en": "shubh",
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
        pace: Optional[float] = None,
    ):
        self.api_key = os.getenv("SARVAM_API_KEY", "") if api_key is None else api_key
        self.stt_url = stt_url
        self.tts_url = tts_url
        self.timeout_seconds = timeout_seconds
        try:
            self.pace = float(os.getenv("SARVAM_TTS_PACE", "1.0") if pace is None else pace)
        except (TypeError, ValueError) as exc:
            raise SpeechError("Sarvam speech pace must be a number between 0.5 and 2.0.") from exc
        if not 0.5 <= self.pace <= 2.0:
            raise SpeechError("Sarvam speech pace must be between 0.5 and 2.0.")

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
        lang_tag = "unknown"
        if language_code:
            lang_tag = resolve_speech_locale(language_code)

        headers = {
            "api-subscription-key": self.api_key,
        }
        files = {
            "file": (filename or "audio.wav", audio_bytes, {".webm": "audio/webm", ".mp4": "audio/mp4", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav", ".mp3": "audio/mpeg"}.get(os.path.splitext(filename)[1].lower(), "application/octet-stream")),
        }
        SARVAM_STT_MODEL = os.getenv("SARVAM_STT_MODEL", "saaras:v3")
        data = {
            "model": SARVAM_STT_MODEL,
            "mode": "transcribe",
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
                transcript_value = res_data.get("transcript")
                if not isinstance(transcript_value, str) or not transcript_value.strip():
                    raise NoSpeechRecognizedError("No speech was recognized. Please record again or type your concern.")
                transcript = transcript_value.strip()
                detected_value = res_data.get("language_code")
                detected_lang = (detected_value if isinstance(detected_value, str) else lang_tag).split("-")[0]

                return STTResponse(
                    transcript=transcript,
                    language_detected=detected_lang,
                    confidence=res_data.get("confidence"),
                    provider="sarvam",
                )
        except NoSpeechRecognizedError:
            raise
        except httpx.TimeoutException as e:
            logger.error(f"[SarvamSpeechGateway] STT timed out after {self.timeout_seconds}s")
            raise SpeechError("Sarvam STT timed out") from None
        except httpx.HTTPError as e:
            logger.error("Sarvam STT HTTP request failed")
            raise SpeechError("Sarvam STT request failed") from None
        except Exception as e:
            logger.error("Sarvam STT response processing failed")
            raise SpeechError("Sarvam STT response processing failed") from None

    def tts(
        self,
        text: str,
        language: str = "te",
        speaker: Optional[str] = None,
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

        lang_tag = resolve_speech_locale(language)
        lang_code = lang_tag.split("-")[0]
        resolved_speaker = speaker or DEFAULT_SPEAKERS[lang_code]

        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "text": clean_text,
            "language_code": lang_tag,
            "speaker": resolved_speaker,
            "pace": self.pace,
            "speech_sample_rate": 24000,
            "model": os.getenv("SARVAM_TTS_MODEL", "bulbul:v3"),
            "output_audio_codec": "mp3",
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
            raise SpeechError("Sarvam TTS timed out") from None
        except httpx.HTTPError as e:
            logger.error("Sarvam TTS HTTP request failed")
            raise SpeechError("Sarvam TTS request failed") from None
        except Exception as e:
            logger.error("Sarvam TTS response processing failed")
            raise SpeechError("Sarvam TTS response processing failed") from None


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

    def tts(self, text: str, language: str = "te", speaker: Optional[str] = None) -> TTSResponse:
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
      SPEECH_PROVIDER: sarvam | mock | disabled (default: sarvam if SARVAM_API_KEY else disabled)
    """
    env_provider = os.getenv("SPEECH_PROVIDER")
    if provider is None:
        if env_provider:
            provider = env_provider.lower().strip()
        elif os.getenv("SARVAM_API_KEY"):
            provider = "sarvam"
        else:
            provider = "disabled"

    provider = provider.lower().strip()
    if provider == "mock":
        from app.core.config import settings
        if settings.APP_ENV != "test":
            raise SpeechError("Mock speech is restricted to automated tests")
        return MockSpeechGateway()
    elif provider == "sarvam":
        return SarvamSpeechGateway(api_key=api_key)
    elif provider == "whisper_cpp":
        from app.services.local_speech import WhisperCppSpeechGateway
        return WhisperCppSpeechGateway()
    elif provider in {"disabled", "none", "offline"}:
        return DisabledSpeechGateway()
    else:
        logger.warning(f"[SpeechGateway] Unknown provider '{provider}', falling back to disabled.")
        return DisabledSpeechGateway()
