import uuid
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

def session(client):
    identifier = f'SYN-consent-{uuid.uuid4().hex}@example.invalid'
    assert client.post('/api/v1/auth/register', json=dict(login_identifier=identifier, password='SyntheticTestOnly123!', display_name='SYN consent', preferred_language='en')).status_code == 201
    result = client.post('/api/v1/auth/login', json=dict(login_identifier=identifier, password='SyntheticTestOnly123!'))
    return {'Authorization': 'Bearer ' + result.json()['data']['access_token']}

def test_speech_consent_blocks_provider_and_withdrawal_removes_duplicate_grants():
    with TestClient(app) as client:
        headers = session(client)
        with patch('app.api.v1.endpoints.speech.create_speech_gateway') as provider:
            assert client.post('/api/v1/speech/tts', json=dict(text='SYN text', language='en'), headers=headers).status_code == 403
            provider.assert_not_called()
        grants = [client.post('/api/v1/consent', json=dict(consent_type='SPEECH_PROCESSING'), headers=headers).json()['data'] for _ in range(2)]
        assert client.patch('/api/v1/consent/' + grants[0]['id'], json=dict(status='WITHDRAWN'), headers=headers).status_code == 200
        with patch('app.api.v1.endpoints.speech.create_speech_gateway') as provider:
            assert client.post('/api/v1/speech/tts', json=dict(text='SYN text', language='en'), headers=headers).status_code == 403
            provider.assert_not_called()

def test_chat_consent_and_emergency_bypass_and_other_patient_isolation():
    with TestClient(app) as client:
        first, other = session(client), session(client)
        with patch('app.api.v1.endpoints.ai.process_ai_chat_query') as generator:
            assert client.post('/api/v1/ai/chat', json=dict(message='SYN general question'), headers=first).status_code == 403
            generator.assert_not_called()
        grant = client.post('/api/v1/consent', json=dict(consent_type='AI_PROCESSING'), headers=first).json()['data']
        assert client.patch('/api/v1/consent/' + grant['id'], json=dict(status='WITHDRAWN'), headers=other).status_code == 404
        assert client.post('/api/v1/ai/chat', json=dict(message='SYN general question'), headers=other).status_code == 403
        emergency = client.post('/api/v1/ai/chat', json=dict(message='chest pain and cannot breathe', language='en'), headers=other)
        assert emergency.status_code == 200
        assert emergency.json()['data']['response_type'] == 'EMERGENCY'

def test_consent_rejects_unknown_scopes_and_versions():
    with TestClient(app) as client:
        headers = session(client)
        for payload in [dict(consent_type='UNKNOWN'), dict(consent_type='AI_PROCESSING', version='invented'), dict(consent_type='AI_PROCESSING', status='WITHDRAWN')]:
            assert client.post('/api/v1/consent', json=payload, headers=headers).status_code == 422
