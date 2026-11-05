import io
import subprocess
import wave
from pathlib import Path
import pytest

from app.services.local_speech import WhisperCppSpeechGateway
from app.services.speech_service import SpeechError


def wav(rate=16000, channels=1):
    output = io.BytesIO()
    with wave.open(output, 'wb') as w:
        w.setnchannels(channels)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(b'\x00\x01'*160)
    return output.getvalue()


@pytest.fixture
def gateway(tmp_path):
    executable, model = tmp_path/'whisper-cli.exe', tmp_path/'ggml-base.bin'
    executable.write_bytes(b'SYN executable fixture')
    model.write_bytes(b'SYN model fixture')
    return WhisperCppSpeechGateway(executable, model)


@pytest.mark.parametrize('audio', [b'invalid', b'', wav(rate=8000), wav(channels=2)])
def test_bad_audio_never_runs_native_process(gateway, monkeypatch, audio):
    def fail(*args, **kwargs):
        pytest.fail('Invalid input reached native process')
    monkeypatch.setattr(subprocess, 'run', fail)
    with pytest.raises(SpeechError):
        gateway.stt(audio, language_code='en')


@pytest.mark.parametrize('language', ['en', 'hi', 'te'])
def test_native_script_preserved_temp_files_cleaned_and_no_fake_confidence(gateway, monkeypatch, language):
    touched = []
    text = {'en': 'SYN hello', 'hi': 'नमस्ते', 'te': 'నమస్కారం'}[language]
    def run(args, **kwargs):
        assert kwargs['shell'] is False
        assert kwargs['timeout'] == 90
        assert args[args.index('--language')+1] == language
        output = Path(args[args.index('--output-file')+1]).with_suffix('.txt')
        touched.append(output.parent)
        output.write_text(text, encoding='utf-8')
    monkeypatch.setattr(subprocess, 'run', run)
    result = gateway.stt(wav(), language_code=language)
    assert result.transcript == text
    assert result.confidence is None
    assert result.provider == 'whisper_cpp'
    assert not touched[0].exists()


def test_timeout_is_safe_and_releases_capacity(gateway, monkeypatch):
    def fail(*args, **kwargs):
        raise subprocess.TimeoutExpired('SYN sensitive command', 90)
    monkeypatch.setattr(subprocess, 'run', fail)
    for _ in range(2):
        with pytest.raises(SpeechError, match='Local recognition failed') as error:
            gateway.stt(wav())
        assert 'sensitive' not in str(error.value)


def test_english_only_model_rejected_for_telugu(gateway):
    model = gateway.model.with_name('ggml-base.en.bin')
    model.write_bytes(b'SYN')
    gateway.model = model
    with pytest.raises(SpeechError, match='multilingual'):
        gateway.stt(wav(), language_code='te')
