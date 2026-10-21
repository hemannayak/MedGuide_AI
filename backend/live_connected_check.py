"""Opt-in synthetic HTTP integration check. Never a clinical/accuracy benchmark."""
import argparse
import base64
import json
import uuid
from pathlib import Path
import httpx


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', action='store_true')
    args = parser.parse_args()
    if not args.run:
        parser.error('Pass --run to create a synthetic account and call configured providers.')
    results = []
    with httpx.Client(base_url='http://127.0.0.1:8000/api/v1', timeout=120) as client:
        identifier = f'SYN-connected-{uuid.uuid4().hex}@example.invalid'
        response = client.post('/auth/register', json=dict(login_identifier=identifier, password='SyntheticTestOnly123!', display_name='SYN connected check', preferred_language='en'))
        response.raise_for_status()
        response = client.post('/auth/login', json=dict(login_identifier=identifier, password='SyntheticTestOnly123!'))
        response.raise_for_status()
        client.headers['Authorization'] = 'Bearer ' + response.json()['data']['access_token']
        denied = client.post('/speech/tts', json=dict(text='Synthetic test', language='en'))
        assert denied.status_code == 403
        results.append(dict(check='missing_speech_consent', passed=True))
        grants = {}
        for scope in ['AI_PROCESSING', 'SPEECH_PROCESSING']:
            response = client.post('/consent', json=dict(consent_type=scope, version='1.0'))
            response.raise_for_status()
            grants[scope] = response.json()['data']['id']
        greetings = {'en': 'Hello. This is a synthetic connection test.', 'hi': '\u0928\u092e\u0938\u094d\u0924\u0947', 'te': '\u0c28\u0c2e\u0c38\u0c4d\u0c15\u0c3e\u0c30\u0c02'}
        for language, greeting in greetings.items():
            response = client.post('/speech/tts', json=dict(text=greeting, language=language, speaker='shubh', format='mp3'))
            if response.status_code != 200:
                results.append(dict(check='speech', language=language, passed=False, stage='tts', status=response.status_code))
                continue
            audio = base64.b64decode(response.json()['audio_base64'], validate=True)
            response = client.post('/speech/stt', files={'file': ('SYN.mp3', audio, 'audio/mpeg')}, data={'language_code': language})
            results.append(dict(check='speech', language=language, passed=response.status_code == 200 and bool(response.json().get('transcript', '').strip()), stage='stt', status=response.status_code, audio_bytes=len(audio)))
        reply = client.post('/ai/chat', json=dict(message='Explain what high blood pressure means in simple words.', language='en'))
        data = reply.json().get('data', {})
        results.append(dict(check='chat', status=reply.status_code, response_type=data.get('response_type'), sources=len(data.get('sources', [])), transport_passed=reply.status_code == 200, clinical_validation=False))
        response = client.patch('/consent/' + grants['SPEECH_PROCESSING'], json=dict(status='WITHDRAWN'))
        response.raise_for_status()
        denied = client.post('/speech/tts', json=dict(text='Synthetic test', language='en'))
        assert denied.status_code == 403
        results.append(dict(check='withdrawn_speech_consent', passed=True))
    report = dict(synthetic=True, accuracy_evaluated=False, checks=results)
    destination = Path(__file__).resolve().parent.parent / 'evaluation' / 'connected_check_results.json'
    destination.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report))
    return 1 if any(item.get('passed') is False for item in results) else 0


if __name__ == '__main__':
    raise SystemExit(main())
