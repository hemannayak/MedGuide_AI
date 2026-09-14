export interface STTResponse {
  transcript: string;
  language_detected?: string;
  confidence?: number;
  duration_seconds?: number;
  provider: string;
}

export interface TTSRequest {
  text: string;
  language: "en" | "hi" | "te" | string;
  speaker?: "kavitha" | "priya" | "anand" | "aditya" | string;
  format?: "mp3" | "wav" | string;
}

export interface TTSResponse {
  audio_base64: string;
  format: string;
  duration_seconds?: number;
  provider: string;
}
