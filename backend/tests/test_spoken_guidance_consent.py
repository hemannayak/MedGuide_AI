import uuid
from app.core.security import create_access_token
from app.models.users import User
from app.schemas.auth import UserRegisterRequest
from app.services.auth_service import register_patient_user
from unittest.mock import patch


def test_spoken_guidance_choice_is_explicit_account_owned_and_persistent(client, db_session):
    users=[]
    try:
        for _ in range(2):
            users.append(register_patient_user(db_session, UserRegisterRequest(login_identifier=f'SYN-audio-{uuid.uuid4().hex}@example.invalid',password='SyntheticOnly123!',display_name='SYN Audio',preferred_language='en')))
        headers=[{'Authorization':f'Bearer {create_access_token(u.id,u.role.name)}'} for u in users]
        url='/api/v1/consent/spoken-guidance'
        assert client.put(url,json={'enabled':True}).status_code==401
        assert client.put(url,json={},headers=headers[0]).status_code==422
        for enabled,expected in [(False,'DECLINED'),(True,'GRANTED'),(False,'DECLINED')]:
            result=client.put(url,json={'enabled':enabled},headers=headers[0])
            assert result.status_code==200,result.text
            assert result.json()['data']['status']==expected
            # Re-read through authenticated API, not local UI state.
            records=client.get('/api/v1/consent',headers=headers[0]).json()['data']
            latest=sorted([r for r in records if r['consent_type']=='SPOKEN_GUIDANCE'],key=lambda r:r['created_at'])[-1]
            assert latest['status']==expected
            if not enabled: assert latest['granted_at'] is None
        other=client.get('/api/v1/consent',headers=headers[1]).json()['data']
        assert not any(r['consent_type']=='SPOKEN_GUIDANCE' for r in other)
    finally:
        db_session.rollback()
        for user in users:db_session.query(User).filter_by(id=user.id).delete(synchronize_session=False)
        db_session.commit()


def test_legacy_tts_requires_separate_spoken_choice_and_honors_withdrawal(client, db_session):
    user = register_patient_user(db_session, UserRegisterRequest(login_identifier=f'SYN-tts-{uuid.uuid4().hex}@example.invalid', password='SyntheticOnly123!', display_name='SYN TTS', preferred_language='en'))
    headers = {'Authorization': f'Bearer {create_access_token(user.id,user.role.name)}'}
    try:
        assert client.post('/api/v1/consent', json={'consent_type': 'SPEECH_PROCESSING'}, headers=headers).status_code == 201
        with patch('app.api.v1.endpoints.speech.create_speech_gateway') as provider:
            # Microphone/cloud-processing consent alone is insufficient for playback.
            assert client.post('/api/v1/speech/tts', json={'text':'SYN text','language':'en'}, headers=headers).status_code == 403
            assert client.put('/api/v1/consent/spoken-guidance', json={'enabled':False}, headers=headers).status_code == 200
            assert client.post('/api/v1/speech/tts', json={'text':'SYN text','language':'en'}, headers=headers).status_code == 403
            provider.assert_not_called()
            grant = client.put('/api/v1/consent/spoken-guidance', json={'enabled':True}, headers=headers).json()['data']
            provider.return_value.tts.return_value = {'audio_base64':'U1lO', 'format':'mp3', 'provider':'SYN fixture'}
            assert client.post('/api/v1/speech/tts', json={'text':'SYN text','language':'en'}, headers=headers).status_code == 200
            provider.reset_mock()
            assert client.patch('/api/v1/consent/'+grant['id'], json={'status':'WITHDRAWN'}, headers=headers).status_code == 200
            assert client.post('/api/v1/speech/tts', json={'text':'SYN text','language':'en'}, headers=headers).status_code == 403
            provider.assert_not_called()
    finally:
        db_session.rollback()
        db_session.query(User).filter_by(id=user.id).delete(synchronize_session=False)
        db_session.commit()
