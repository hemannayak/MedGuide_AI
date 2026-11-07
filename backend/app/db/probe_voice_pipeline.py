"""Opt-in real synthetic voice -> RAG -> validated response -> speech probe.

Uses real providers and a temporary SYN account, removed in finally. No provider
or authorization mocks. Consumes provider credits; never run in ordinary CI.
"""
import argparse
import io
import json
import threading
import time
import uuid
import wave
from pathlib import Path

import httpx
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import SessionLocal
from app.models.users import User
from app.models.consent import Consent
from app.schemas.auth import UserRegisterRequest
from app.services.auth_service import register_patient_user
from app.services.patient_service import get_patient_profile_by_user


def main():
    import os
    user_id = None
    report = {'method': 'Real authenticated WebSocket, synthetic English audio, real STT/RAG/configured LLM/TTS; no patient data',
              'clinical_validation': False, 'events': [], 'ai_provider': os.getenv('AI_PROVIDER'), 'ai_model': os.getenv('AI_MODEL')}
    before = settings.VOICE_STREAMING_ENABLED
    try:
        # Generate one short input fixture without retaining the recording.
        response = httpx.post('https://api.sarvam.ai/text-to-speech',
            headers={'api-subscription-key': settings.SARVAM_API_KEY},
            json={'text':'How can I wash my hands properly?', 'language_code':'en-IN', 'model':'bulbul:v3',
                  'speaker':'shubh', 'speech_sample_rate':16000, 'output_audio_codec':'wav'}, timeout=20)
        response.raise_for_status()
        import base64
        recording = base64.b64decode(response.json()['audios'][0], validate=True)
        # Non-patient synthetic fixture, reusable for transport diagnostics.
        fixture = Path('.model-cache/SYN-handwashing.wav')
        fixture.parent.mkdir(exist_ok=True)
        fixture.write_bytes(recording)
        with wave.open(io.BytesIO(recording), 'rb') as w:
            assert (w.getnchannels(),w.getsampwidth(),w.getframerate()) == (1,2,16000)
            pcm = w.readframes(w.getnframes())
        with SessionLocal() as db:
            user = register_patient_user(db, UserRegisterRequest(login_identifier=f'SYN-voice-{uuid.uuid4().hex}@example.invalid', password=uuid.uuid4().hex+'Aa1!', display_name='SYN Voice Probe', preferred_language='en'))
            user_id = user.id
            profile = get_patient_profile_by_user(db,user)
            for scope in ['SPEECH_PROCESSING','SPOKEN_GUIDANCE','AI_PROCESSING']:
                db.add(Consent(patient_id=profile.id, consent_type=scope, status='GRANTED', version='1.0'))
            db.commit()
            token = create_access_token(user.id,user.role.name)
        settings.VOICE_STREAMING_ENABLED = True
        with TestClient(app) as client, client.websocket_connect('/api/v1/voice/session') as ws:
            ws.send_json({'type':'start','token':token,'language':'en','input':'audio'})
            report['events'].append(ws.receive_json()['type'])
            stopped = threading.Event()
            def feed():
                for offset in range(0,len(pcm),3200):
                    if stopped.is_set():return
                    ws.send_bytes(pcm[offset:offset+3200]);time.sleep(.1)
                for _ in range(50):
                    if stopped.is_set():return
                    ws.send_bytes(b'\0'*3200);time.sleep(.1)
                ws.send_json({'type':'input.flush'})
            producer = threading.Thread(target=feed,daemon=True)
            began = time.perf_counter()
            timer = threading.Timer(75,lambda: ws.send_json({'type':'close'}))
            producer.start();timer.start()
            try:
                while True:
                    event = ws.receive_json()
                    report['events'].append(event['type'])
                    if event['type'] == 'transcript.final':
                        report['transcript'] = event['text']
                        report['final_transcript_ms'] = round((time.perf_counter()-began)*1000,2)
                    if event['type'] == 'turn.reply':
                        report['reply'] = event['reply']
                        report['response_ms'] = event['response_ms']
                    if event['type'] == 'audio.chunk' and 'first_reply_audio_ms' not in report:
                        report['first_reply_audio_ms'] = round((time.perf_counter()-began)*1000,2)
                    if event['type'] in {'audio.end','audio.unavailable','turn.error','session.error'}:
                        report['status'] = 'COMPLETED' if event['type']=='audio.end' else event['type']
                        report['terminal_code'] = event.get('code')
                        report['total_ms'] = round((time.perf_counter()-began)*1000,2)
                        break
                ws.send_json({'type':'close'})
            finally:
                stopped.set();timer.cancel();producer.join(timeout=2)
    except Exception as error:
        report.update(status='FAILED',error_type=type(error).__name__)
    finally:
        settings.VOICE_STREAMING_ENABLED = before
        if user_id:
            with SessionLocal() as db:
                db.query(User).filter(User.id==user_id).delete(synchronize_session=False)
                db.commit()
        report['synthetic_account_removed'] = user_id is not None
        Path(__file__).resolve().parents[3].joinpath('docs/testing/voice-pipeline-smoke-20261103.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k not in {'events','reply','transcript'}},ensure_ascii=True))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--allow-provider-usage',action='store_true')
    if not parser.parse_args().allow_provider_usage:parser.error('Explicit --allow-provider-usage required')
    main()
