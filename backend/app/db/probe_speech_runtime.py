"""Explicit, bounded hosted speech smoke test using synthetic non-patient text.

Consumes configured provider credits. Never run automatically in pytest/CI.
Run: python -m app.db.probe_speech_runtime --allow-provider-usage
"""
import argparse
import asyncio
import json
import time
from datetime import datetime, timezone
from pathlib import Path

from app.core.config import settings  # loads server-only environment
from app.services.realtime_speech import SarvamRealtimeSpeech
from app.services.speech_service import SarvamSpeechGateway, SpeechError

SAMPLES = {'en': 'Please tell me how to wash my hands.',
           'hi': 'कृपया मुझे बताइए कि हाथ कैसे धोने चाहिए।',
           'te': 'దయచేసి చేతులు ఎలా కడుక్కోవాలో చెప్పండి.'}


async def probe():
    rows = []
    streaming = SarvamRealtimeSpeech()
    recognition = SarvamSpeechGateway()
    for language, sample in SAMPLES.items():
        row = {'language': language, 'synthetic_input': sample}
        began = time.perf_counter()
        audio = bytearray()
        try:
            async for chunk in streaming.synthesize(sample, language):
                if not audio:
                    row['first_audio_ms'] = round((time.perf_counter()-began)*1000, 2)
                audio.extend(chunk)
            row['tts_total_ms'] = round((time.perf_counter()-began)*1000, 2)
            row['audio_bytes'] = len(audio)
            began = time.perf_counter()
            result = await asyncio.to_thread(recognition.stt, bytes(audio), 'synthetic.mp3', language)
            row.update(status='COMPLETED', transcript=result.transcript,
                       stt_ms=round((time.perf_counter()-began)*1000, 2), confidence=result.confidence)
        except SpeechError:
            row['status'] = 'PROVIDER_UNAVAILABLE'
            rows.append(row)
            break  # No retries/credit loops after a provider failure.
        finally:
            audio.clear()
        rows.append(row)
    report = {'evaluated_at': datetime.now(timezone.utc).isoformat(),
              'method': 'Synthetic TTS -> batch STT roundtrip; real provider; no patient recordings.',
              'human_voice_quality_evaluated': False, 'regional_accent_wer_evaluated': False,
              'realtime_stt_evaluated': False, 'results': rows}
    output = Path(__file__).resolve().parents[3]/'docs/testing/speech-provider-smoke-20261103.json'
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=True))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--allow-provider-usage', action='store_true')
    if not parser.parse_args().allow_provider_usage:
        parser.error('Explicit --allow-provider-usage is required; this test consumes credits')
    asyncio.run(probe())
