"""Exercise shared speech routes without changing live DB, config or services."""
import base64
import asyncio
import httpx
from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI, HTTPException
from app.api.deps import require_speech_consent
from app.api.v1.endpoints.speech import router
from app.services.speech_service import SarvamSpeechGateway


@pytest.fixture
def route_client():
    isolated_app = FastAPI()
    isolated_app.include_router(router, prefix='/api/v1/speech')
    # Test-only dependency replacement in a separate app; live gates unchanged.
    isolated_app.dependency_overrides[require_speech_consent] = lambda: None
    class RouteClient:
        def post(self, path, **kwargs):
            async def send():
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=isolated_app), base_url='http://test.invalid') as client:
                    return await client.post(path, **kwargs)
            return asyncio.run(send())
    yield RouteClient(), isolated_app


@pytest.mark.parametrize('language,transcript', [
    ('en', 'SYN: I do not have chest pain.'),
    ('hi', 'मुझे सीने में दर्द नहीं है।'),
    ('te', 'నాకు ఛాతీ నొప్పి లేదు.'),
])
def test_recording_to_transcript_then_spoken_reply(route_client, language, transcript):
    client, _ = route_client
    provider = MagicMock()
    provider.__enter__.return_value = provider
    gateway = SarvamSpeechGateway(api_key='SYN-key', pace=0.9)
    # Real gateway + actual HTTP routes; only the external provider is mocked.
    with patch('app.api.v1.endpoints.speech.create_speech_gateway', return_value=gateway), patch('httpx.Client', return_value=provider):
        provider.post.return_value.json.return_value = {'transcript': transcript, 'language_code': f'{language}-IN'}
        result = client.post('/api/v1/speech/stt', files={'file': ('SYN.m4a', b'SYN fixture', 'audio/mp4')}, data={'language_code': language})
        assert result.status_code == 200
        assert result.json()['transcript'] == transcript
        assert result.json()['provider'] == 'sarvam'
        assert provider.post.call_args.kwargs['data']['mode'] == 'transcribe'
        provider.post.return_value.json.return_value = {'audios': [base64.b64encode(b'ID3-SYN').decode()]}
        reply = client.post('/api/v1/speech/tts', json={'text': transcript, 'language': language})
        assert reply.status_code == 200
        assert reply.json()['format'] == 'mp3'
        payload = provider.post.call_args.kwargs['json']
        assert payload['text'] == transcript
        assert payload['language_code'] == f'{language}-IN'
        assert payload['pace'] == 0.9


def test_consent_denial_prevents_provider_processing(route_client):
    client, isolated_app = route_client
    def deny():
        raise HTTPException(status_code=403, detail='Speech consent required')
    isolated_app.dependency_overrides[require_speech_consent] = deny
    with patch('app.api.v1.endpoints.speech.create_speech_gateway') as gateway:
        assert client.post('/api/v1/speech/tts', json={'text': 'SYN', 'language': 'en'}).status_code == 403
        assert client.post('/api/v1/speech/stt', files={'file': ('SYN.wav', b'SYN', 'audio/wav')}).status_code == 403
        gateway.assert_not_called()


def test_provider_failure_is_safe_and_does_not_return_fake_audio(route_client):
    client, _ = route_client
    import httpx
    provider = MagicMock()
    provider.__enter__.return_value = provider
    provider.post.side_effect = httpx.ReadTimeout('SYN provider timeout')
    with patch('app.api.v1.endpoints.speech.create_speech_gateway', return_value=SarvamSpeechGateway(api_key='SYN-key')), patch('httpx.Client', return_value=provider):
        response = client.post('/api/v1/speech/tts', json={'text': 'SYN test', 'language': 'te'})
    assert response.status_code == 503
    assert 'written response' in response.json()['detail']
    assert 'audio_base64' not in response.json()


def test_no_recognized_words_returns_retryable_input_error(route_client):
    client, _ = route_client
    provider = MagicMock()
    provider.__enter__.return_value = provider
    provider.post.return_value.json.return_value = {'transcript': '   '}
    with patch('app.api.v1.endpoints.speech.create_speech_gateway', return_value=SarvamSpeechGateway(api_key='SYN-key')), patch('httpx.Client', return_value=provider):
        response = client.post('/api/v1/speech/stt', files={'file': ('SYN.wav', b'SYN', 'audio/wav')}, data={'language_code': 'hi'})
    assert response.status_code == 422
    assert 'record again' in response.json()['detail']
