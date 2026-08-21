export enum RiskLevel {
  ROUTINE = "ROUTINE",
  URGENT = "URGENT",
  EMERGENCY = "EMERGENCY",
}

export interface SymptomRecordRequest {
  symptoms_description: string;
  duration_days?: number;
  severity_scale?: number; // 1-10
  associated_symptoms?: string[];
  language?: "en" | "hi" | "te" | string;
}

export interface SymptomTriageResult {
  id: string;
  patient_id: string;
  symptoms_description: string;
  risk_level: RiskLevel;
  red_flags_detected: string[];
  recommended_action: string;
  escalation_required: boolean;
  emergency_instructions?: string;
  created_at: string;
}
