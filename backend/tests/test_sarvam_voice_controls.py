"""Synthetic adapter contracts; no paid network calls or quality claims."""
from unittest.mock import MagicMock, patch
import pytest
from app.services.speech_service import SarvamSpeechGateway, SpeechError


@pytest.mark.parametrize('pace', [0.49, 2.01, float('nan'), float('inf'), 'invalid'])
def test_invalid_pace_fails_before_provider_request(pace):
    with pytest.raises(SpeechError, match='pace'):
        SarvamSpeechGateway(api_key='SYN-key', pace=pace)


def test_pace_configuration_preserves_medical_text_and_language(monkeypatch):
    monkeypatch.setenv('SARVAM_TTS_PACE', '0.9')
    gateway = SarvamSpeechGateway(api_key='SYN-key')
    client = MagicMock()
    client.__enter__.return_value = client
    client.post.return_value.json.return_value = {'audios': ['U1lO']}
    text = 'SYN: Do not change the prescribed 5 mg dose.'
    with patch('httpx.Client', return_value=client):
        gateway.tts(text, 'hi')
    payload = client.post.call_args.kwargs['json']
    assert payload['pace'] == 0.9
    assert payload['text'] == text
    assert payload['language_code'] == 'hi-IN'


@pytest.mark.parametrize('transcript', [None, '', '   ', 123])
def test_empty_or_malformed_transcription_is_a_recoverable_error(transcript):
    gateway = SarvamSpeechGateway(api_key='SYN-key')
    client = MagicMock()
    client.__enter__.return_value = client
    client.post.return_value.json.return_value = {'transcript': transcript}
    with patch('httpx.Client', return_value=client), pytest.raises(SpeechError, match='No speech was recognized'):
        gateway.stt(b'SYN audio', 'SYN.wav', 'te')


def test_transcription_preserves_native_script_and_nullable_detected_language():
    gateway = SarvamSpeechGateway(api_key='SYN-key')
    client = MagicMock()
    client.__enter__.return_value = client
    client.post.return_value.json.return_value = {'transcript': 'నాకు జ్వరం లేదు', 'language_code': None}
    with patch('httpx.Client', return_value=client):
        result = gateway.stt(b'SYN audio', 'SYN.wav', 'te')
    assert result.transcript == 'నాకు జ్వరం లేదు'
    assert result.language_detected == 'te'
    assert client.post.call_args.kwargs['data']['mode'] == 'transcribe'
