import { API_BASE_URL, isMockMode } from "./config";
import { MockApiAdapter } from "./mock-adapter";
import { StandardResponse } from "@/types/api";
import { AIChatRequest, AIChatResponse } from "@/types/ai";
import { SymptomRecordRequest, SymptomTriageResult } from "@/types/symptom";
import { AuthTokenResponse, LoginRequest, RegisterRequest, PatientProfile } from "@/types/user";
import { Medication, Prescription } from "@/types/medication";

import { getSessionToken } from "@/lib/auth/session";

class ApiClient {
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

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ login_identifier: data.email_or_phone, password: data.password }),
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

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ login_identifier: data.email, display_name: data.full_name,
        password: data.password, preferred_language: data.preferred_language || "en" }),
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
    return res.json();
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

  async getPrescriptions(): Promise<StandardResponse<Prescription[]>> {
    if (isMockMode()) return MockApiAdapter.getPrescriptions();

    const res = await fetch(`${API_BASE_URL}/prescriptions`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return res.json();
  }
}

export const api = new ApiClient();

