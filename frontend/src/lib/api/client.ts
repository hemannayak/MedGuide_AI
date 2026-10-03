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
      body: JSON.stringify(data),
    });
    const response = await res.json();
    return res.ok ? response : { success: false, message: response.message || "Sign in could not be completed." };
  }

  async register(data: RegisterRequest): Promise<StandardResponse<AuthTokenResponse>> {
    if (isMockMode()) return MockApiAdapter.register(data);

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const response = await res.json();
    return res.ok ? response : { success: false, message: response.message || "Account creation could not be completed." };
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

