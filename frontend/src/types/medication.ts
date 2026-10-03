export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type PrescriptionStatus = "ACTIVE" | "ARCHIVED" | "EXPIRED";
export type MedicationStatus = "ACTIVE" | "DISCONTINUED" | "COMPLETED";
export type AdherenceStatus = "TAKEN" | "SKIPPED" | "MISSED" | "PENDING";
export type MealRelation = "BEFORE" | "AFTER" | "WITH_FOOD" | "INDEPENDENT";

export interface OCRResult {
  id: string;
  prescription_image_id: string;
  engine: string;
  model_version: string;
  raw_text: string;
  confidence: number;
  status: "SUCCESS" | "FAILED" | "LOW_CONFIDENCE";
  processed_at: string;
}

export interface PrescriptionImage {
  id: string;
  prescription_id: string;
  storage_reference: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  ocr_results?: OCRResult[];
}

export interface MedicationSchedule {
  id: string;
  medication_id: string;
  time_of_day: string; // e.g. "08:00 AM", "08:00"
  dosage_amount: string; // e.g. "1 tablet"
  meal_relation: MealRelation;
  days_of_week?: string[];
  reminder_enabled?: boolean;
}

export interface MedicationAdherence {
  id: string;
  medication_id: string;
  schedule_id?: string;
  scheduled_time: string;
  taken_at?: string;
  status: AdherenceStatus;
  notes?: string;
}

export interface Medication {
  id: string;
  prescription_id?: string;
  patient_id: string;
  medicine_name: string;
  dosage: string;
  route: string; // e.g. "Oral", "Topical"
  instructions: string;
  status: MedicationStatus;
  verification_status: VerificationStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
  schedules?: MedicationSchedule[];
  adherence_records?: MedicationAdherence[];
}

export interface Prescription {
  id: string;
  patient_id: string;
  source: "UPLOAD" | "CLINIC";
  status: PrescriptionStatus;
  verification_status: VerificationStatus;
  prescribed_date: string;
  doctor_name?: string;
  hospital_name?: string;
  notes?: string;
  created_at: string;
  images?: PrescriptionImage[];
  medications?: Medication[];
}
