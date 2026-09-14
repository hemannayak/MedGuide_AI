from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.schemas.speech import STTResponse, TTSRequest, TTSResponse
from app.services.speech_service import SpeechError, create_speech_gateway

router = APIRouter()


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

    content = await file.read()
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

    gateway = create_speech_gateway()
    try:
        response = gateway.stt(
            audio_bytes=content,
            filename=file.filename or "audio.wav",
            language_code=language_code,
        )
        return response
    except SpeechError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Speech-to-text service unavailable: {str(e)}",
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
    if not req.text or not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text content is required for speech synthesis.",
        )

    gateway = create_speech_gateway()
    try:
        response = gateway.tts(
            text=req.text,
            language=req.language,
            speaker=req.speaker or "meera",
        )
        return response
    except SpeechError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Text-to-speech service unavailable: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred during speech synthesis.",
        )
