export interface CareMedication {
  id: string; medicine_name: string; dosage: string; route: string | null;
  instructions: string | null; verification_status: string; created_at: string;
  schedules?: CareSchedule[];
}
export interface CareSchedule {
  id: string; medication_id: string; frequency: string;
  schedule_data: { times?: string[] }; start_date: string; end_date: string | null;
  timezone: string; status: string;
}
export interface PrescriptionSummary {
  id: string; source: string; status: string; verification_status: string;
  prescribed_date: string | null; created_at: string; medications_count: number;
}
export interface PrescriptionDetail extends PrescriptionSummary {
  ocr_results: { id: string; engine: string; raw_text: string; confidence: number | null; status: string }[];
  medications: CareMedication[];
}
export interface PrescriptionUpload {
  prescription_id: string; ocr_engine: string; confidence: number | null;
  verification_status: string; raw_text: string;
  extracted_medications: { id: string; medicine_name: { value: string | null }; dosage: { value: string | null } | null }[];
}
export interface CarePatient {
  id: string; user_id: string; display_name: string; preferred_language: string;
  date_of_birth: string | null; contact_reference: string | null;
  created_at: string; updated_at: string;
}
export interface CareAlert { id: string; severity: string; alert_type: string; status: string; created_at: string }
export interface CareRecords {
  profile: CarePatient;
  summary: { summary_text: string; generated_at: string };
  symptoms: { id: string; text: string; language: string; reported_at: string }[];
  medications: CareMedication[]; prescriptions: PrescriptionSummary[]; alerts: CareAlert[];
}
export interface CareFollowUp {
  id: string; patient_id: string; reason: string; scheduled_at: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED"; notes: string | null;
}
export interface CareAdherence { id: string; scheduled_at: string; recorded_at: string; status: string }
export interface TimelineEvent { id: string; event_type: string; event_time: string; metadata: Record<string, unknown> | null }
