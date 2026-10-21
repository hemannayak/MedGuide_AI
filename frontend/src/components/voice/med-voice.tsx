"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Loader2, Check, MicOff } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { api } from "@/lib/api/client";

interface MedVoiceProps {
  onTranscription: (text: string) => void;
  className?: string;
  disabled?: boolean;
  onRecordingStart?: () => void;
}

export type VoiceState = "idle" | "listening" | "transcribing" | "success" | "error";

export const MedVoice: React.FC<MedVoiceProps> = ({
  onTranscription,
  className = "",
  disabled = false,
  onRecordingStart,
}) => {
  const { language } = useLanguage();
  const [state, setState] = useState<VoiceState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Clean up audio streams on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      onRecordingStart?.();
      setErrorMessage(null);
      audioChunksRef.current = [];

      // Request microphone access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Audio recording is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setState("transcribing");
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || audioChunksRef.current[0]?.type || "audio/webm" });
          
          // Call backend STT endpoint
          const res = await api.speechSTT(audioBlob, language);
          if (res.success && res.data && res.data.transcript) {
            setState("success");
            onTranscription(res.data.transcript);
          } else {
            setState("error");
            setErrorMessage(res.message || "No speech was recognized. Please retry or type your concern.");
          }
        } catch {
          setState("error");
          setErrorMessage("Speech recognition failed. Please retry or type your concern.");
        }
      };

      mediaRecorder.start();
      setState("listening");
    } catch {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setState("error");
      setErrorMessage("Microphone unavailable. Allow microphone access or type your concern.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      setState("idle");
    }
  };

  const handleToggle = () => {
    if (state === "idle" || state === "success" || state === "error") {
      startRecording();
    } else if (state === "listening") {
      stopRecording();
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Waveform / Status visual indicator */}
      {state === "listening" && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold shadow-md whitespace-nowrap animate-fade-in"
          aria-live="polite"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Listening... Tap to stop</span>
        </div>
      )}

      {state === "transcribing" && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs font-semibold shadow-md whitespace-nowrap animate-fade-in"
          aria-live="polite"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Transcribing voice...</span>
        </div>
      )}

      {/* Main Mic Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || state === "transcribing"}
        aria-label={
          state === "listening"
            ? "Stop listening"
            : state === "transcribing"
            ? "Transcribing voice"
            : "Tap to speak using voice"
        }
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
          state === "listening"
            ? "bg-red-600 text-white scale-110 ring-4 ring-red-200 cursor-pointer"
            : state === "transcribing"
            ? "bg-amber-600 text-white animate-pulse"
            : state === "success"
            ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
            : state === "error"
            ? "bg-rose-500 text-white cursor-pointer"
            : "bg-[#0F766E] text-white hover:bg-[#0D635C] hover:scale-105 cursor-pointer"
        }`}
      >
        {state === "transcribing" ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : state === "listening" ? (
          <div className="flex items-center gap-1">
            <span className="w-1 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-7 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : state === "success" ? (
          <Check className="w-6 h-6" />
        ) : state === "error" ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {state === "error" && <p role="alert" className="max-w-xs text-sm text-red-700">{errorMessage}</p>}
      {/* Micro-label */}
      <span className="text-[11px] text-slate-500 font-medium mt-1.5">
        {state === "idle"
          ? "Tap to speak"
          : state === "listening"
          ? "Tap to finish"
          : state === "transcribing"
          ? "Transcribing..."
          : state === "error"
          ? (errorMessage || "Mic unavailable")
          : "Voice added"}
      </span>
    </div>
  );
};
