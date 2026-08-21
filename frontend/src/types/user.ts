export enum UserRole {
  PATIENT = "PATIENT",
  HEALTHCARE_WORKER = "HEALTHCARE_WORKER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  preferred_language: "en" | "hi" | "te";
  is_active: boolean;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email_or_phone: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  role?: UserRole;
  preferred_language?: "en" | "hi" | "te";
}

export interface PatientProfile {
  id: string;
  user_id: string;
  full_name?: string;
  primary_language?: string;
  age?: number;
  gender?: string;
  blood_group?: string;
  known_allergies?: string[];
  chronic_conditions?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  village_or_town?: string;
  state?: string;
  created_at: string;
}
