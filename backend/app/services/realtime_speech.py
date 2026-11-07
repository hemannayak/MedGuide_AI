"""Optional Sarvam streaming transport. Provider credentials never reach clients.

Protocols verified against official API reference on 2026-10-23. This adapter
does not perform medical reasoning; only fully validated replies may enter TTS.
"""
import base64
import json
import os
from contextlib import asynccontextmanager
from urllib.parse import urlencode

import httpx
from websockets.asyncio.client import connect
from websockets.exceptions import WebSocketException

from app.services.speech_service import SpeechError, LANGUAGE_CODE_MAP


def language_tag(language: str) -> str:
    if language not in LANGUAGE_CODE_MAP:
        raise SpeechError('Choose English, Hindi or Telugu.')
    return LANGUAGE_CODE_MAP[language]


class SarvamRealtimeSpeech:
    def __init__(self, api_key=None):
        self.api_key = os.getenv('SARVAM_API_KEY', '') if api_key is None else api_key
        if not self.api_key:
            raise SpeechError('Speech service is not configured.')

    @asynccontextmanager
    async def recognition(self, language: str):
        query = urlencode({'language_code': language_tag(language), 'model': 'saaras:v3-realtime',
                           'mode': 'transcribe', 'stream_type': 'balanced', 'endpointing': 'vad',
                           'encoding': 'linear16', 'sample_rate': '16000',
                           'silence_duration_ms': '500', 'min_speech_duration_ms': '250',
                           'prefix_padding_ms': '300'})
        try:
            async with connect('wss://api.sarvam.ai/speech-to-text-realtime/ws?' + query,
                               additional_headers={'API-SUBSCRIPTION-KEY': self.api_key},
                               open_timeout=15, close_timeout=3, max_size=65536,
                               max_queue=8, ping_interval=20, ping_timeout=20) as socket:
                yield socket
        except (WebSocketException, OSError, TimeoutError):
            # Provider exceptions may contain URLs, authentication headers or text.
            raise SpeechError('Live recognition is unavailable. Please type your concern.') from None

    async def synthesize(self, text: str, language: str):
        if not text.strip() or len(text) > 3500:
            raise SpeechError('Spoken response is empty or too long.')
        payload = {'text': text, 'language_code': language_tag(language),
                   'model': 'bulbul:v3', 'speaker': 'shubh', 'pace': 0.95,
                   'speech_sample_rate': 24000, 'output_audio_codec': 'mp3',
                   'output_audio_bitrate': '64k', 'enable_cached_responses': False}
        total = 0
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(30, connect=10)) as client:
                async with client.stream('POST', 'https://api.sarvam.ai/text-to-speech/stream',
                                         headers={'api-subscription-key': self.api_key}, json=payload) as response:
                    response.raise_for_status()
                    if response.headers.get('content-type', '').split(';')[0] != 'audio/mpeg':
                        raise SpeechError('Speech service returned an unsupported audio response.')
                    # Small chunks allow cancellation and playback before completion.
                    async for chunk in response.aiter_bytes(2048):
                        total += len(chunk)
                        if total > 5 * 1024 * 1024:
                            raise SpeechError('Spoken response exceeded its size limit.')
                        if chunk:
                            yield chunk
                    if not total:
                        raise SpeechError('Speech service returned no audio.')
        except (httpx.HTTPError, OSError):
            raise SpeechError('Spoken playback is unavailable. The written reply is still available.') from None


def parse_recognition_event(raw: str) -> dict:
    """Strict allowlist: never relay provider diagnostics or guessed confidence."""
    if not isinstance(raw, str) or len(raw) > 65536:
        raise SpeechError('Invalid recognition response.')
    try:
        event = json.loads(raw)
        kind = event.get('event')
        if kind in {'transcript.partial', 'transcript.final'}:
            text = event.get('text')
            index = event.get('utterance_idx')
            if not isinstance(text, str) or len(text) > 2000 or type(index) is not int or index < 0:
                raise ValueError()
            # The live service emits empty partials while recognizing speech.
            # They are valid progress events, not recognition failures.
            if not text.strip():
                return {'event': 'ignored' if kind == 'transcript.partial' else 'transcript.empty'}
            return {'event': kind, 'text': text.strip(), 'utterance_idx': index}
        if kind in {'vad.speech_start', 'vad.speech_end', 'session.begin', 'session.end'}:
            return {'event': kind}
        if kind == 'error':
            raise SpeechError('Live recognition failed. You can continue by typing.')
        return {'event': 'ignored'}
    except (ValueError, TypeError, AttributeError):
        raise SpeechError('Invalid recognition response.') from None


def audio_input(pcm: bytes) -> str:
    # Mono signed 16-bit PCM at 16 kHz. Maximum 100 ms per frame.
    if not pcm or len(pcm) > 3200 or len(pcm) % 2:
        raise SpeechError('Send 16 kHz mono PCM16 audio in frames up to 100 milliseconds.')
    return json.dumps({'event': 'audio_input', 'audio': base64.b64encode(pcm).decode('ascii')})
