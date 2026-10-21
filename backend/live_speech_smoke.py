"""Opt-in provider check using synthetic speech only; not an accuracy evaluation."""
import argparse
from app.core.config import settings
from app.services.speech_service import SarvamSpeechGateway
import base64


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run", action="store_true", help="Use configured Sarvam credentials for synthetic speech requests")
    args = parser.parse_args()
    if not args.run:
        parser.error("Pass --run to perform external provider requests")
    gateway = SarvamSpeechGateway(api_key=settings.SARVAM_API_KEY or "")
    for language, text in {"en": "Hello. This is a synthetic audio test.", "hi": "\u0928\u092e\u0938\u094d\u0924\u0947", "te": "\u0c28\u0c2e\u0c38\u0c4d\u0c15\u0c3e\u0c30\u0c02"}.items():
        try:
            audio = gateway.tts(text, language)
            raw = base64.b64decode(audio.audio_base64, validate=True)
            assert len(raw) > 100
            result = gateway.stt(raw, "synthetic.mp3", language)
            assert result.transcript.strip()
            print(f"{language}: provider TTS/STT returned non-empty synthetic audio/transcript")
        except Exception:
            print(f"{language}: provider smoke check failed; no patient data was sent")
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
