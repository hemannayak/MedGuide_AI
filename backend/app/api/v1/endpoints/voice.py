"""Bounded opt-in WebSocket voice session; no frontend changes required.

One response pipeline per session. Barge-in invalidates old audio immediately;
an already running synchronous model call finishes without concurrent DB writes.
Only the newest pending final utterance is retained, with an explicit event.
"""
import asyncio
import base64
import json
import logging
import time
import uuid
from contextlib import suppress
from typing import Literal

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.services.realtime_speech import SarvamRealtimeSpeech, SpeechError, audio_input, parse_recognition_event
from app.services.spoken_text import prepare_spoken_text
from app.services.voice_account import open_voice_conversation, answer_voice_turn, check_voice_access

router = APIRouter()
logger = logging.getLogger(__name__)
# Process-level limits are defense in depth; distributed quotas belong at ingress.
_active_patients = set()


class SessionStart(BaseModel):
    model_config = ConfigDict(extra='forbid')
    type: Literal['start']
    token: str = Field(min_length=1, max_length=4096, repr=False)
    language: Literal['en', 'hi', 'te'] = 'en'
    conversation_id: uuid.UUID | None = None
    input: Literal['audio', 'text'] = 'audio'
    auto_respond: bool = True


async def receive_json_bounded(socket, limit=8192):
    raw = await socket.receive_text()
    if len(raw) > limit:
        raise ValueError('Message too large')
    value = json.loads(raw)
    if not isinstance(value, dict):
        raise ValueError('Expected an object')
    return value


@router.websocket('/session')
async def voice_session(socket: WebSocket):
    if not settings.VOICE_STREAMING_ENABLED:
        await socket.close(code=1008, reason='Voice sessions are disabled')
        return
    origin = socket.headers.get('origin')
    if origin and origin not in settings.CORS_ORIGINS:
        await socket.close(code=1008, reason='Origin is not allowed')
        return
    # No query-string tokens: they leak through proxy/access logs.
    if socket.query_params:
        await socket.close(code=1008, reason='Use the authenticated start message')
        return
    await socket.accept()
    patient = None
    runner = playback = recognition_task = watchdog = None
    closed = False
    generation = 0
    turn_count = 0
    pending = None
    send_lock = asyncio.Lock()

    async def send(event):
        if not closed:
            async with send_lock:
                if event.get('type') != 'audio.stop' and 'generation' in event and event['generation'] != generation:
                    return
                await asyncio.wait_for(socket.send_json(event), timeout=5)

    async def stop_playback():
        nonlocal generation, playback, pending
        generation += 1
        pending = None
        if playback and not playback.done():
            playback.cancel()
            with suppress(asyncio.CancelledError):
                await playback
        await send({'type': 'audio.stop', 'generation': generation})

    try:
        start = SessionStart.model_validate(await asyncio.wait_for(receive_json_bounded(socket), 5))
        patient, conversation_id = await run_in_threadpool(open_voice_conversation, start.token, start.conversation_id, start.language)
        if patient in _active_patients or len(_active_patients) >= settings.VOICE_MAX_SESSIONS:
            patient = None  # Do not release somebody else's reservation.
            await socket.close(code=1013, reason='A voice session is already active or the service is busy')
            return
        _active_patients.add(patient)
        provider = SarvamRealtimeSpeech()
        await send({'type': 'session.ready', 'conversation_id': str(conversation_id), 'language': start.language,
                    'input_format': 'pcm_s16le', 'sample_rate': 16000, 'channels': 1, 'auto_respond': start.auto_respond})

        async def speak(reply, turn_generation):
            await run_in_threadpool(check_voice_access, start.token, conversation_id, True)
            await send({'type': 'audio.start', 'generation': turn_generation, 'format': 'mp3'})
            sequence = 0
            async for chunk in provider.synthesize(prepare_spoken_text(reply.message), reply.language):
                if closed or turn_generation != generation:
                    return
                await send({'type': 'audio.chunk', 'generation': turn_generation, 'sequence': sequence,
                            'audio': base64.b64encode(chunk).decode('ascii')})
                sequence += 1
            await send({'type': 'audio.end', 'generation': turn_generation})

        async def run_turn(message, turn_generation):
            nonlocal runner, playback, pending
            try:
                began = time.monotonic()
                await send({'type': 'turn.thinking', 'generation': turn_generation})
                worker = asyncio.create_task(asyncio.to_thread(answer_voice_turn, start.token, conversation_id, message, start.language))
                try:
                    reply = await asyncio.shield(worker)
                except asyncio.CancelledError:
                    # Drain the current DB transaction before releasing the patient
                    # reservation. Python cannot safely kill a synchronous model call.
                    with suppress(Exception):
                        await worker
                    raise
                if closed or generation != turn_generation:
                    return
                # Recheck account/consent after potentially slow model processing.
                await run_in_threadpool(check_voice_access, start.token, conversation_id)
                await send({'type': 'turn.reply', 'generation': turn_generation, 'reply': reply.model_dump(mode='json'),
                            'response_ms': round((time.monotonic()-began)*1000)})
                playback = asyncio.create_task(speak(reply, turn_generation))
                try:
                    await playback
                except asyncio.CancelledError:
                    pass
                except HTTPException:
                    await send({'type': 'audio.unavailable', 'code': 'spoken_consent_required', 'text_available': True})
                except SpeechError:
                    await send({'type': 'audio.unavailable', 'code': 'speech_unavailable', 'text_available': True})
            except HTTPException as error:
                await send({'type': 'turn.error', 'code': 'access_required', 'status': error.status_code})
            except Exception:
                logger.error('Voice turn failed')  # No transcript/token/provider body.
                await send({'type': 'turn.error', 'code': 'temporarily_unavailable'})
            finally:
                runner = None
                if pending and not closed:
                    queued, queued_generation = pending
                    pending = None
                    runner = asyncio.create_task(run_turn(queued, queued_generation))

        async def submit(message):
            nonlocal runner, pending, turn_count
            turn_count += 1
            if turn_count > 40:
                raise ValueError('Turn limit reached')
            await stop_playback()
            if runner and not runner.done():
                pending = (message, generation)
                await send({'type': 'turn.queued', 'generation': generation, 'replaces_previous_pending': True})
            else:
                runner = asyncio.create_task(run_turn(message, generation))

        async def monitor_access():
            while True:
                await asyncio.sleep(2)
                await run_in_threadpool(check_voice_access, start.token, conversation_id)
                if playback and not playback.done():
                    try:
                        await run_in_threadpool(check_voice_access, start.token, conversation_id, True)
                    except HTTPException:
                        await stop_playback()
                        await send({'type': 'audio.unavailable', 'code': 'spoken_consent_required', 'text_available': True})

        async def receive_recognition(upstream):
            last_final = -1
            async for raw in upstream:
                event = parse_recognition_event(raw)
                kind = event['event']
                if kind == 'vad.speech_start':
                    await stop_playback()
                elif kind in {'transcript.partial', 'transcript.final'}:
                    await send({'type': kind, 'text': event['text'], 'utterance_idx': event['utterance_idx']})
                    if kind == 'transcript.final' and event['utterance_idx'] > last_final:
                        last_final = event['utterance_idx']
                        if start.auto_respond:
                            await submit(event['text'])
                elif kind == 'session.end':
                    raise SpeechError('Recognition session ended.')
                elif kind == 'transcript.empty':
                    await send({'type': 'turn.error', 'code': 'no_speech_recognized'})
            raise SpeechError('Recognition connection ended.')

        async def receive_inputs(upstream=None):
            total_bytes = 0
            frames = 0
            window = time.monotonic()
            while True:
                frame = await asyncio.wait_for(socket.receive(), timeout=45)
                if frame['type'] == 'websocket.disconnect':
                    raise WebSocketDisconnect()
                now = time.monotonic()
                if now-window >= 1:
                    window, frames = now, 0
                frames += 1
                if frames > 100:
                    raise ValueError('Too many input frames')
                if frame.get('bytes') is not None:
                    if not upstream:
                        raise ValueError('Audio input is not enabled')
                    pcm = frame['bytes']
                    total_bytes += len(pcm)
                    if total_bytes > 10*1024*1024:
                        raise ValueError('Audio session limit reached')
                    await asyncio.wait_for(upstream.send(audio_input(pcm)), 5)
                    continue
                raw = frame.get('text', '')
                if len(raw) > 8192:
                    raise ValueError('Message too large')
                event = json.loads(raw)
                if not isinstance(event, dict):
                    raise ValueError('Expected an object')
                kind = event.get('type')
                if kind == 'close':
                    return
                if kind == 'interrupt':
                    await stop_playback()
                elif kind == 'input.flush' and upstream:
                    # Finish a microphone recording even if capture stops before
                    # the provider has received enough trailing silence for VAD.
                    await asyncio.wait_for(upstream.send(json.dumps({'event':'flush'})), 5)
                elif kind == 'text':
                    message = event.get('text')
                    if not isinstance(message, str) or not 1 <= len(message.strip()) <= 2000:
                        raise ValueError('Write a short question')
                    await submit(message.strip())
                elif kind != 'ping':
                    raise ValueError('Unknown event')

        async def run_session(upstream=None):
            nonlocal recognition_task, watchdog
            watchdog = asyncio.create_task(monitor_access())
            inputs = asyncio.create_task(receive_inputs(upstream))
            tasks = {watchdog, inputs}
            if upstream:
                recognition_task = asyncio.create_task(receive_recognition(upstream))
                tasks.add(recognition_task)
            try:
                done, _ = await asyncio.wait(tasks, timeout=300, return_when=asyncio.FIRST_COMPLETED)
                for task in done:
                    task.result()
            finally:
                for task in tasks:
                    task.cancel()
                await asyncio.gather(*tasks, return_exceptions=True)

        if start.input == 'audio':
            async with provider.recognition(start.language) as upstream:
                await run_session(upstream)
        else:
            await run_session()
    except (WebSocketDisconnect, RuntimeError):
        pass
    except HTTPException as error:
        await send({'type': 'session.error', 'code': 'access_required', 'status': error.status_code})
    except (ValidationError, ValueError, TimeoutError):
        await send({'type': 'session.error', 'code': 'invalid_or_timed_out_input'})
    except SpeechError:
        await send({'type': 'session.error', 'code': 'speech_unavailable', 'text_endpoint': '/api/v1/ai/chat'})
    finally:
        closed = True
        for task in (runner, playback, recognition_task, watchdog):
            if task:
                task.cancel()
        await asyncio.gather(*(t for t in (runner, playback, recognition_task, watchdog) if t), return_exceptions=True)
        if patient:
            _active_patients.discard(patient)
        with suppress(RuntimeError, WebSocketDisconnect):
            await socket.close()
