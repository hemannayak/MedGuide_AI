"""Protocol/security regression tests. Synthetic provider, never a voice-quality claim."""
import asyncio
import base64
import json
import uuid
from contextlib import asynccontextmanager
from unittest.mock import Mock

import httpx
import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.api.v1.endpoints import voice
from app.schemas.ai import AIChatResponse, ResponseType
from app.services.realtime_speech import SarvamRealtimeSpeech, SpeechError, audio_input, language_tag, parse_recognition_event


@pytest.mark.parametrize('language,tag', [('en', 'en-IN'), ('hi', 'hi-IN'), ('te', 'te-IN')])
def test_explicit_language_mapping(language, tag):
    assert language_tag(language) == tag


def test_unrelated_locale_not_silently_substituted():
    with pytest.raises(SpeechError):
        language_tag('fr')


@pytest.mark.parametrize('frame', [b'', b'x', b'x'*3202])
def test_invalid_pcm_frames_rejected(frame):
    with pytest.raises(SpeechError):
        audio_input(frame)


def test_audio_frames_are_real_encoded_input():
    frame = b'\0\1'*1600
    result = json.loads(audio_input(frame))
    assert base64.b64decode(result['audio']) == frame


def test_provider_transcript_contract_and_diagnostic_redaction():
    event = parse_recognition_event(json.dumps({'event': 'transcript.final', 'text': 'SYN hello', 'utterance_idx': 0, 'confidence': 0.99, 'secret': 'SYN'}))
    assert event == {'event': 'transcript.final', 'text': 'SYN hello', 'utterance_idx': 0}
    with pytest.raises(SpeechError, match='Live recognition failed'):
        parse_recognition_event('{"event":"error","message":"SYN-private-provider-body"}')
    for value in ['[]', '{}', '{', '{"event":"transcript.final","text":"SYN","utterance_idx":true}']:
        if value == '{}':
            assert parse_recognition_event(value) == {'event': 'ignored'}
        else:
            with pytest.raises(SpeechError):
                parse_recognition_event(value)


def test_empty_live_partials_do_not_abort_recognition():
    assert parse_recognition_event('{"event":"transcript.partial","text":"","utterance_idx":0}') == {'event':'ignored'}
    assert parse_recognition_event('{"event":"transcript.final","text":" ","utterance_idx":0}') == {'event':'transcript.empty'}


def test_real_http_stream_contract_and_cache_disabled(monkeypatch):
    captured = []
    def handle(request):
        captured.append(request)
        return httpx.Response(200, headers={'content-type': 'audio/mpeg'}, content=b'ID3-SYN-stream')
    client = httpx.AsyncClient(transport=httpx.MockTransport(handle))
    monkeypatch.setattr('app.services.realtime_speech.httpx.AsyncClient', lambda **_: client)
    async def run():
        return b''.join([part async for part in SarvamRealtimeSpeech('SYN-key').synthesize('SYN नमस्ते', 'hi')])
    assert asyncio.run(run()) == b'ID3-SYN-stream'
    payload = json.loads(captured[0].content)
    assert payload['language_code'] == 'hi-IN'
    assert payload['enable_cached_responses'] is False
    assert captured[0].url.path == '/text-to-speech/stream'


@pytest.mark.parametrize('status,content_type', [(429, 'application/json'), (200, 'application/json')])
def test_provider_error_never_becomes_audio(monkeypatch, status, content_type):
    client = httpx.AsyncClient(transport=httpx.MockTransport(lambda _: httpx.Response(status, headers={'content-type': content_type}, content=b'SYN private diagnostics')))
    monkeypatch.setattr('app.services.realtime_speech.httpx.AsyncClient', lambda **_: client)
    async def run():
        return [part async for part in SarvamRealtimeSpeech('SYN-key').synthesize('SYN hello', 'en')]
    with pytest.raises(SpeechError) as error:
        asyncio.run(run())
    assert 'private' not in str(error.value)


@pytest.fixture
def voice_client(monkeypatch):
    monkeypatch.setattr(voice.settings, 'VOICE_STREAMING_ENABLED', True)
    app = FastAPI()
    app.include_router(voice.router, prefix='/voice')
    with TestClient(app) as client:
        yield client
    assert not voice._active_patients


def test_auth_and_consent_checked_before_any_provider(voice_client, monkeypatch):
    provider = Mock()
    monkeypatch.setattr(voice, 'SarvamRealtimeSpeech', provider)
    def deny(*_):
        raise HTTPException(403, 'Consent required')
    monkeypatch.setattr(voice, 'open_voice_conversation', deny)
    with voice_client.websocket_connect('/voice/session') as ws:
        ws.send_json({'type': 'start', 'token': 'SYN', 'input': 'text'})
        assert ws.receive_json() == {'type': 'session.error', 'code': 'access_required', 'status': 403}
    provider.assert_not_called()


def test_origin_and_query_tokens_rejected(voice_client):
    from starlette.websockets import WebSocketDisconnect
    for path, headers in [('/voice/session?token=SYN', {}), ('/voice/session', {'origin': 'https://untrusted.invalid'})]:
        with pytest.raises(WebSocketDisconnect):
            with voice_client.websocket_connect(path, headers=headers):
                pass


def test_validated_chat_reply_streams_and_reuses_conversation(voice_client, monkeypatch):
    conversation = uuid.uuid4()
    answers = []
    def answer(token, conversation_id, message, language):
        answers.append((conversation_id, message, language))
        return AIChatResponse(conversation_id=conversation, message='SYN written reply.', language=language, response_type=ResponseType.INFORMATIONAL)
    monkeypatch.setattr(voice, 'open_voice_conversation', lambda *_: ('SYN-patient', conversation))
    monkeypatch.setattr(voice, 'check_voice_access', lambda *_: None)
    monkeypatch.setattr(voice, 'answer_voice_turn', answer)
    class Provider:
        async def synthesize(self, text, language):
            assert text == 'SYN written reply.'
            yield b'ID3-SYN'
    monkeypatch.setattr(voice, 'SarvamRealtimeSpeech', Provider)
    with voice_client.websocket_connect('/voice/session') as ws:
        ws.send_json({'type': 'start', 'token': 'SYN', 'input': 'text', 'language': 'te'})
        assert ws.receive_json()['conversation_id'] == str(conversation)
        for question in ['SYN first', 'SYN follow-up']:
            ws.send_json({'type': 'text', 'text': question})
            events = []
            while not events or events[-1]['type'] != 'audio.end':
                events.append(ws.receive_json())
            reply = next(e for e in events if e['type'] == 'turn.reply')
            assert reply['reply']['message'] == 'SYN written reply.'
            assert base64.b64decode(next(e for e in events if e['type'] == 'audio.chunk')['audio']) == b'ID3-SYN'
        ws.send_json({'type': 'close'})
    assert answers == [(conversation, 'SYN first', 'te'), (conversation, 'SYN follow-up', 'te')]


def test_declined_spoken_consent_keeps_text_without_tts(voice_client, monkeypatch):
    conversation = uuid.uuid4()
    monkeypatch.setattr(voice, 'open_voice_conversation', lambda *_: ('SYN-patient', conversation))
    def check(token, conversation_id, spoken=False):
        if spoken:
            raise HTTPException(403, 'Spoken consent required')
    monkeypatch.setattr(voice, 'check_voice_access', check)
    monkeypatch.setattr(voice, 'answer_voice_turn', lambda *_: AIChatResponse(conversation_id=conversation, message='SYN text.', language='en', response_type=ResponseType.INFORMATIONAL))
    provider = Mock()
    monkeypatch.setattr(voice, 'SarvamRealtimeSpeech', lambda: provider)
    with voice_client.websocket_connect('/voice/session') as ws:
        ws.send_json({'type': 'start', 'token': 'SYN', 'input': 'text'})
        ws.receive_json()
        ws.send_json({'type': 'text', 'text': 'SYN question'})
        events = []
        while not events or events[-1]['type'] != 'audio.unavailable':
            events.append(ws.receive_json())
        assert any(e['type'] == 'turn.reply' for e in events)
        assert not any(e['type'] == 'audio.chunk' for e in events)
        ws.send_json({'type': 'close'})
    provider.synthesize.assert_not_called()


def test_interrupt_cancels_audio_and_next_turn_has_a_new_generation(voice_client, monkeypatch):
    conversation = uuid.uuid4()
    monkeypatch.setattr(voice, 'open_voice_conversation', lambda *_: ('SYN-patient', conversation))
    monkeypatch.setattr(voice, 'check_voice_access', lambda *_: None)
    monkeypatch.setattr(voice, 'answer_voice_turn', lambda token, cid, message, lang: AIChatResponse(conversation_id=cid, message=message, language=lang, response_type=ResponseType.INFORMATIONAL))
    cancelled = []
    class Provider:
        async def synthesize(self, text, language):
            yield b'ID3-SYN-first'
            if text == 'SYN first':
                try:
                    await asyncio.Event().wait()
                finally:
                    cancelled.append(True)
            else:
                yield b'SYN-second'
    monkeypatch.setattr(voice, 'SarvamRealtimeSpeech', Provider)
    with voice_client.websocket_connect('/voice/session') as ws:
        ws.send_json({'type':'start','token':'SYN','input':'text'})
        ws.receive_json()
        ws.send_json({'type':'text','text':'SYN first'})
        while True:
            event = ws.receive_json()
            if event['type']=='audio.chunk':
                old_generation=event['generation'];break
        ws.send_json({'type':'interrupt'})
        stop=ws.receive_json()
        assert stop['type']=='audio.stop' and stop['generation']>old_generation
        ws.send_json({'type':'text','text':'SYN second'})
        while True:
            event=ws.receive_json()
            if event['type'].startswith('audio.') and event['type']!='audio.stop':
                assert event['generation']>old_generation
            if event['type']=='audio.end':break
        ws.send_json({'type':'close'})
    assert cancelled == [True]


def test_real_recognition_shapes_finalize_only_once_and_forward_flush(voice_client, monkeypatch):
    conversation=uuid.uuid4()
    monkeypatch.setattr(voice, 'open_voice_conversation', lambda *_: ('SYN-patient', conversation))
    monkeypatch.setattr(voice, 'check_voice_access', lambda *_: None)
    answers=[]
    def answer(token,cid,message,language):
        answers.append(message)
        return AIChatResponse(conversation_id=cid,message='SYN reply',language=language,response_type=ResponseType.INFORMATIONAL)
    monkeypatch.setattr(voice,'answer_voice_turn',answer)
    class Upstream:
        def __init__(self):self.queue=asyncio.Queue()
        async def send(self,raw):
            if json.loads(raw)['event']=='flush':
                for event in [
                    {'event':'transcript.partial','text':'','utterance_idx':0},
                    {'event':'transcript.partial','text':'SYN partial','utterance_idx':0},
                    {'event':'transcript.final','text':'SYN complete','utterance_idx':0},
                    {'event':'transcript.final','text':'SYN complete','utterance_idx':0},
                ]:await self.queue.put(json.dumps(event))
        def __aiter__(self):return self
        async def __anext__(self):return await self.queue.get()
    class Provider:
        @asynccontextmanager
        async def recognition(self,language):yield Upstream()
        async def synthesize(self,text,language):yield b'ID3-SYN'
    monkeypatch.setattr(voice,'SarvamRealtimeSpeech',Provider)
    with voice_client.websocket_connect('/voice/session') as ws:
        ws.send_json({'type':'start','token':'SYN','input':'audio'})
        ws.receive_json()
        ws.send_json({'type':'input.flush'})
        while ws.receive_json()['type']!='audio.end':pass
        ws.send_json({'type':'close'})
    assert answers==['SYN complete']
