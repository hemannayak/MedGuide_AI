import { API_BASE_URL, isMockMode } from "./config";
import { MockApiAdapter } from "./mock-adapter";
import { StandardResponse } from "@/types/api";
import { AIChatRequest, AIChatResponse } from "@/types/ai";
import { STTResponse, TTSRequest, TTSResponse } from "@/types/speech";
import { SymptomRecordRequest, SymptomTriageResult } from "@/types/symptom";
import { AuthTokenResponse, LoginRequest, RegisterRequest, PatientProfile } from "@/types/user";

class ApiClient {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("medguide_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // --- Auth APIs ---
  async login(data: LoginRequest): Promise<StandardResponse<AuthTokenResponse>> {
    if (isMockMode()) return MockApiAdapter.login(data);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async register(data: RegisterRequest): Promise<StandardResponse<AuthTokenResponse>> {
    if (isMockMode()) return MockApiAdapter.register(data);

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // --- Patient APIs ---
  async getPatientProfile(): Promise<StandardResponse<PatientProfile>> {
    if (isMockMode()) return MockApiAdapter.getPatientProfile();

    const res = await fetch(`${API_BASE_URL}/patients/me`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // --- AI Companion APIs ---
  async postAIChat(req: AIChatRequest): Promise<StandardResponse<AIChatResponse>> {
    if (isMockMode()) return MockApiAdapter.postAIChat(req);

    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(req),
    });
    return res.json();
  }

  // --- Symptom Record & Triage APIs ---
  async submitSymptoms(req: SymptomRecordRequest): Promise<StandardResponse<SymptomTriageResult>> {
    if (isMockMode()) return MockApiAdapter.submitSymptoms(req);

    const res = await fetch(`${API_BASE_URL}/symptoms`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(req),
    });
    return res.json();
  }

  // --- Speech APIs (STT / TTS) ---
  async speechSTT(audioBlob: Blob, languageCode?: string): Promise<StandardResponse<STTResponse>> {
    if (isMockMode()) return MockApiAdapter.speechSTT(languageCode);

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");
    if (languageCode) {
      formData.append("language_code", languageCode);
    }

    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("medguide_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const res = await fetch(`${API_BASE_URL}/speech/stt`, {
      method: "POST",
      headers,
      body: formData,
    });
    return res.json();
  }

  async speechTTS(req: TTSRequest): Promise<StandardResponse<TTSResponse>> {
    if (isMockMode()) return MockApiAdapter.speechTTS(req.text, req.language);

    const res = await fetch(`${API_BASE_URL}/speech/tts`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(req),
    });
    return res.json();
  }
}

export const api = new ApiClient();

