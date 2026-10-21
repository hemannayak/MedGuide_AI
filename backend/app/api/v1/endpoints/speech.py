from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.schemas.speech import STTResponse, TTSRequest, TTSResponse
from app.services.speech_service import NoSpeechRecognizedError, SpeechError, create_speech_gateway

from app.api.deps import require_speech_consent
from starlette.concurrency import run_in_threadpool

router = APIRouter(dependencies=[Depends(require_speech_consent)])


@router.post(
    "/stt",
    response_model=STTResponse,
    summary="Speech-to-Text Transcription",
    description="Transcribe patient voice audio (WAV/WEBM/M4A) into native text via online Sarvam Saaras or mock.",
)
async def speech_to_text(
    file: UploadFile = File(..., description="Voice recording audio binary file"),
    language_code: Optional[str] = Form(None, description="Optional ISO code (e.g. te-IN, hi-IN, en-IN)"),
) -> STTResponse:
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file provided.",
        )

    if file.content_type not in {"audio/wav", "audio/x-wav", "audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "video/webm", "video/mp4"}:
        raise HTTPException(status_code=415, detail="Use a supported audio recording format.")
    if language_code and language_code not in {"en", "hi", "te", "en-IN", "hi-IN", "te-IN"}:
        raise HTTPException(status_code=422, detail="Choose English, Hindi or Telugu.")
    content = await file.read(10 * 1024 * 1024 + 1)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded audio file is empty.",
        )

    # Max 10MB limit
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Audio file exceeds 10MB size limit.",
        )

    try:
        gateway = create_speech_gateway()
        response = await run_in_threadpool(gateway.stt,
            audio_bytes=content,
            filename=file.filename or "audio.wav",
            language_code=language_code,
        )
        return response
    except NoSpeechRecognizedError:
        raise HTTPException(status_code=422, detail="No speech was recognized. Please record again or type your concern.")
    except SpeechError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Speech recognition is unavailable. Please try again or type your concern.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred during speech transcription.",
        )


@router.post(
    "/tts",
    response_model=TTSResponse,
    summary="Text-to-Speech Synthesis",
    description="Synthesize grounded medical guidance text into natural Indic spoken audio via Sarvam Bulbul or mock.",
)
async def text_to_speech(req: TTSRequest) -> TTSResponse:
    from app.services.spoken_text import prepare_spoken_text
    if not req.text or not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text content is required for speech synthesis.",
        )

    try:
        gateway = create_speech_gateway()
        response = await run_in_threadpool(gateway.tts,
            text=prepare_spoken_text(req.text),
            language=req.language,
            speaker=req.speaker,
        )
        return response
    except SpeechError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Spoken playback is unavailable. The written response is still available.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred during speech synthesis.",
        )
