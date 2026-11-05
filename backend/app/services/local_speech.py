"""Optional local Whisper.cpp STT. No cloud fallback or automatic downloads.

This batch adapter accepts bounded PCM WAV input. Streaming recognition remains
a separate capability; local deployment does not imply a natural realtime agent.
"""
import io
import os
import subprocess
import tempfile
import threading
import wave
from pathlib import Path

from app.schemas.speech import STTResponse
from app.services.speech_service import SpeechGateway, SpeechError, NoSpeechRecognizedError, resolve_speech_locale

_local_slot = threading.BoundedSemaphore(1)


class WhisperCppSpeechGateway(SpeechGateway):
    provider_name = 'whisper_cpp'
    is_online = False

    def __init__(self, executable=None, model=None):
        self.executable = Path(executable or os.getenv('WHISPER_CPP_EXECUTABLE', ''))
        self.model = Path(model or os.getenv('WHISPER_CPP_MODEL', ''))

    def stt(self, audio_bytes, filename='audio.wav', language_code=None):
        language = resolve_speech_locale(language_code or 'en').split('-')[0]
        if not self.executable.is_file() or not self.model.is_file():
            raise SpeechError('Local speech model is not configured.')
        # English-only checkpoints cannot satisfy regional-language requests.
        if language != 'en' and '.en.' in self.model.name:
            raise SpeechError('A multilingual local speech model is required.')
        if not audio_bytes or len(audio_bytes) > 2*1024*1024:
            raise SpeechError('Record up to 60 seconds of audio.')
        try:
            with wave.open(io.BytesIO(audio_bytes), 'rb') as recording:
                if (recording.getnchannels(), recording.getsampwidth(), recording.getframerate(), recording.getcomptype()) != (1, 2, 16000, 'NONE'):
                    raise SpeechError('Local recognition needs a 16 kHz mono PCM16 WAV recording.')
                frames = recording.getnframes()
                duration = frames/16000
                if not 0 < duration <= 60 or len(recording.readframes(frames)) != frames*2:
                    raise SpeechError('The recording is empty, incomplete or longer than 60 seconds.')
        except (wave.Error, EOFError):
            raise SpeechError('Local recognition needs a valid WAV recording.') from None
        if not _local_slot.acquire(blocking=False):
            raise SpeechError('Local recognition is busy. Please try again shortly.')
        try:
            # Temporary data is removed on success/failure. Deploy on an encrypted
            # private volume; this is cleanup, not a forensic secure-erase claim.
            with tempfile.TemporaryDirectory(prefix='medguide-speech-') as folder:
                source = Path(folder)/'input.wav'
                output = Path(folder)/'transcript'
                source.write_bytes(audio_bytes)
                args = [str(self.executable.resolve()), '--model', str(self.model.resolve()),
                        '--file', str(source), '--language', language, '--output-txt',
                        '--output-file', str(output), '--no-timestamps', '--threads', '2']
                subprocess.run(args, shell=False, check=True, timeout=90,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                               creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
                transcript_path = output.with_suffix('.txt')
                if not transcript_path.is_file() or transcript_path.stat().st_size > 16000:
                    raise SpeechError('Local recognition returned an invalid transcript.')
                transcript = transcript_path.read_text(encoding='utf-8').strip()
                if not transcript:
                    raise NoSpeechRecognizedError('No speech was recognized. Please record again or type your concern.')
                return STTResponse(transcript=transcript, language_detected=language,
                                   confidence=None, duration_seconds=duration, provider=self.provider_name)
        except (subprocess.SubprocessError, OSError, UnicodeError):
            raise SpeechError('Local recognition failed. Please record again or type your concern.') from None
        finally:
            _local_slot.release()

    def tts(self, text, language='te', speaker=None):
        raise SpeechError('The local Whisper model recognizes speech; it does not generate speech.')
