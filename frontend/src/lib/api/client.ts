import { API_BASE_URL, isMockMode } from "./config";
import { MockApiAdapter } from "./mock-adapter";
import { StandardResponse } from "@/types/api";
import { AIChatRequest, AIChatResponse } from "@/types/ai";
import { STTResponse, TTSRequest, TTSResponse } from "@/types/speech";
import { SymptomRecordRequest, SymptomTriageResult } from "@/types/symptom";
import { AuthTokenResponse, LoginRequest, RegisterRequest, PatientProfile } from "@/types/user";
import { Medication } from "@/types/medication";

import { getSessionToken } from "@/lib/auth/session";
import type { PrescriptionSummary, PrescriptionDetail, PrescriptionUpload, CarePatient, CareRecords, CareFollowUp, CareMedication, CareSchedule, CareAdherence, TimelineEvent } from "@/types/care";

class ApiClient {
  getConsents() { return this.request<{ id: string; consent_type: string; status: string; version: string; created_at: string }[]>("/consent"); }
  grantConsent(consent_type: "AI_PROCESSING" | "SPEECH_PROCESSING") { return this.request("/consent", { method: "POST", body: JSON.stringify({ consent_type, version: "1.0" }) }); }
  withdrawConsent(id: string) { return this.request(`/consent/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status: "WITHDRAWN" }) }); }
  private async request<T>(path: string, options: RequestInit = {}): Promise<StandardResponse<T>> {
    if (isMockMode()) return { success: false, message: "This action requires the connected service. Demo mode does not process records." };
    try {
      const headers = this.getHeaders();
      if (options.body instanceof FormData) delete headers["Content-Type"];
      const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
      const body = await response.json();
      if (!response.ok) return { success: false, message: typeof body.detail === "string" ? body.detail : "The request could not be completed. Check your details and account access." };
      return body;
    } catch {
      return { success: false, message: "We could not connect to MedGuide. Please try again." };
    }
  }

  updatePatientProfile(data: { display_name: string; preferred_language: "en" | "hi" | "te" }) {
    return this.request<CarePatient>("/patients/me", { method: "PATCH", body: JSON.stringify(data) });
  }
  getCurrentAccount() { return this.request<{ id: string; role: string }>("/auth/me"); }
  getPrescription(id: string) { return this.request<PrescriptionDetail>(`/prescriptions/${encodeURIComponent(id)}`); }
  uploadPrescription(file: File, prescribedDate?: string) {
    const form = new FormData(); form.append("file", file);
    if (prescribedDate) form.append("prescribed_date", prescribedDate);
    return this.request<PrescriptionUpload>("/prescriptions/upload", { method: "POST", body: form });
  }
  verifyMedication(id: string) { return this.request<CareMedication>(`/medications/${encodeURIComponent(id)}/verify`, { method: "POST" }); }
  getMedication(id: string) { return this.request<CareMedication>(`/medications/${encodeURIComponent(id)}`); }
  getMedicationSchedules(id: string) { return this.request<CareSchedule[]>(`/medications/${encodeURIComponent(id)}/schedules`); }
  createMedicationSchedule(id: string, data: { frequency: string; schedule_data: { times: string[] }; start_date: string; end_date?: string; timezone: string }) {
    return this.request<CareSchedule>(`/medications/${encodeURIComponent(id)}/schedules`, { method: "POST", body: JSON.stringify(data) });
  }
  getWorkerPatients() { return this.request<CarePatient[]>("/healthcare-workers/patients"); }
  getWorkerRecords(id: string) { return this.request<CareRecords>(`/healthcare-workers/patients/${encodeURIComponent(id)}/records`); }
  verifyWorkerMedication(patientId: string, medicationId: string) {
    return this.request<CareMedication>(`/healthcare-workers/patients/${encodeURIComponent(patientId)}/medications/${encodeURIComponent(medicationId)}/verify`, { method: "POST" });
  }
  getFollowUps(patientId?: string) { return this.request<CareFollowUp[]>(`/follow-ups${patientId ? `?patient_id=${encodeURIComponent(patientId)}` : ""}`); }
  createFollowUp(data: { patient_id: string; reason: string; scheduled_at: string; notes?: string }) {
    return this.request<CareFollowUp>("/follow-ups", { method: "POST", body: JSON.stringify(data) });
  }
  updateFollowUp(id: string, status: "COMPLETED" | "CANCELLED") {
    return this.request<CareFollowUp>(`/follow-ups/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
  }
  getAdherence(scheduleId: string) { return this.request<CareAdherence[]>(`/medications/schedules/${encodeURIComponent(scheduleId)}/adherence`); }
  recordAdherence(scheduleId: string, data: { scheduled_at: string; status: "TAKEN" | "SKIPPED" | "MISSED" }) {
    return this.request<CareAdherence>(`/medications/schedules/${encodeURIComponent(scheduleId)}/adherence`, { method: "POST", body: JSON.stringify(data) });
  }
  getTimeline(page = 1) { return this.request<TimelineEvent[]>(`/timeline?page=${page}&page_size=20`); }
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token = getSessionToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // --- Auth APIs ---
  async login(data: LoginRequest): Promise<StandardResponse<AuthTokenResponse>> {
    if (isMockMode()) return MockApiAdapter.login(data);

    const payload = {
      login_identifier: data.email_or_phone,
      password: data.password,
    };

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const response = await res.json();
    if (!res.ok) return { success: false, message: typeof response.detail === "string" ? response.detail : response.message || "Sign in could not be completed." };
    const user = response.data.user;
    return { ...response, data: { ...response.data, user: {
      id: user.id, email: user.login_identifier, full_name: "",
      role: user.role, created_at: user.created_at,
    } } };
  }

  async register(data: RegisterRequest): Promise<StandardResponse<AuthTokenResponse>> {
    if (isMockMode()) return MockApiAdapter.register(data);
    if (data.role && data.role !== "PATIENT") {
      return { success: false, message: "Healthcare worker accounts require authorized setup. Public registration is for patients." };
    }

    const payload = {
      login_identifier: data.email,
      display_name: data.full_name,
      password: data.password,
      preferred_language: data.preferred_language || "en",
    };

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const response = await res.json();
    if (!res.ok) return { success: false, message: typeof response.detail === "string" ? response.detail : response.message || "Account creation could not be completed." };
    const login = await this.login({ email_or_phone: data.email, password: data.password });
    if (!login.success) return { success: false, message: "Account created. Please sign in to continue." };
    return login;
  }

  // --- Patient APIs ---
  async getPatientProfile(): Promise<StandardResponse<PatientProfile>> {
    if (isMockMode()) return MockApiAdapter.getPatientProfile();

    const res = await fetch(`${API_BASE_URL}/patients/me`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    const response = await res.json();
    if (!res.ok) return { success: false, message: "Patient profile could not be loaded." };
    return { ...response, data: { ...response.data, full_name: response.data.display_name,
      primary_language: response.data.preferred_language } };
  }

  // --- AI Companion APIs ---
  async postAIChat(req: AIChatRequest): Promise<StandardResponse<AIChatResponse>> {
    if (isMockMode()) return MockApiAdapter.postAIChat(req);

    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(req),
    });
      const response = await res.json();
      if (!res.ok) return { success: false, message: typeof response.detail === "string" ? response.detail : "The answer could not be requested. Please retry." };
      return response;
  }

  // --- Symptom Record & Triage APIs ---
  async submitSymptoms(req: SymptomRecordRequest): Promise<StandardResponse<SymptomTriageResult>> {
    if (isMockMode()) return MockApiAdapter.submitSymptoms(req);

    const res = await fetch(`${API_BASE_URL}/symptoms`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ text: req.symptoms_description, language: req.language || "en", input_type: "text" }),
    });
    const recorded = await res.json();
    if (!res.ok) return { success: false, message: "Symptoms could not be saved. Please try again." };
    const analysis = await fetch(`${API_BASE_URL}/symptoms/analyze`, {
      method: "POST", headers: this.getHeaders(),
      body: JSON.stringify({ symptom_record_id: recorded.data.symptom_record_id }),
    });
    const response = await analysis.json();
    if (!analysis.ok) return { success: false, message: "Symptoms were saved, but analysis is unavailable. Contact a healthcare professional if you need help." };
    return { ...response, data: {
      id: response.data.symptom_record_id,
      symptoms_description: req.symptoms_description,
      risk_level: response.data.risk_level, red_flags_detected: response.data.red_flags,
      recommended_action: response.data.guidance,
      escalation_required: response.data.escalation_required,
      created_at: recorded.data.reported_at,
    } };
  }

  // --- Medication & Prescription APIs ---
  async getMedications(): Promise<StandardResponse<Medication[]>> {
    if (isMockMode()) return MockApiAdapter.getMedications();

    const res = await fetch(`${API_BASE_URL}/medications`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getPrescriptions(): Promise<StandardResponse<PrescriptionSummary[]>> {
    return this.request<PrescriptionSummary[]>("/prescriptions");
  }

  // --- Speech APIs (STT / TTS) ---
  async speechSTT(audioBlob: Blob, languageCode?: string): Promise<StandardResponse<STTResponse>> {
    if (isMockMode()) return MockApiAdapter.speechSTT(languageCode);

    const formData = new FormData();
    const extension = audioBlob.type.includes("webm") ? "webm" : audioBlob.type.includes("mp4") ? "mp4" : audioBlob.type.includes("ogg") ? "ogg" : "wav";
    formData.append("file", audioBlob, `recording.${extension}`);
    if (languageCode) {
      formData.append("language_code", languageCode);
    }

    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token = getSessionToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const res = await fetch(`${API_BASE_URL}/speech/stt`, {
      method: "POST",
      headers,
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json.detail || "Speech recognition failed.",
      };
    }

    // Normalize direct STTResponse into StandardResponse envelope
    if (json.transcript !== undefined) {
      return {
        success: true,
        data: json as STTResponse,
      };
    }

    return json;
  }

  async speechTTS(req: TTSRequest): Promise<StandardResponse<TTSResponse>> {
    if (isMockMode()) return MockApiAdapter.speechTTS(req.text, req.language);

    const res = await fetch(`${API_BASE_URL}/speech/tts`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(req),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json.detail || "Text-to-speech synthesis failed.",
      };
    }

    // Normalize direct TTSResponse into StandardResponse envelope
    if (json.audio_base64 !== undefined) {
      return {
        success: true,
        data: json as TTSResponse,
      };
    }

    return json;
  }
}

export const api = new ApiClient();

