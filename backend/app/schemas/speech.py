from typing import Optional
from pydantic import BaseModel, Field


class STTResponse(BaseModel):
    transcript: str = Field(..., description="Transcribed text from voice audio")
    language_detected: Optional[str] = Field("unknown", description="Detected language code (e.g. te, hi, en)")
    confidence: Optional[float] = Field(1.0, description="Transcription confidence score (0.0 to 1.0)")
    duration_seconds: Optional[float] = Field(None, description="Audio duration in seconds")
    provider: str = Field("mock", description="Underlying speech service provider name")


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Text to synthesize into spoken audio")
    language: str = Field("te", description="Target Indic language code (te, hi, en)")
    speaker: Optional[str] = Field("kavitha", description="Target voice speaker identity (e.g. kavitha, priya, anand, aditya)")
    format: Optional[str] = Field("mp3", description="Audio container format (mp3, wav)")


class TTSResponse(BaseModel):
    audio_base64: str = Field(..., description="Base64-encoded audio byte content")
    format: str = Field("mp3", description="Audio container format")
    duration_seconds: Optional[float] = Field(None, description="Estimated or actual audio duration")
    provider: str = Field("mock", description="Speech provider name")
