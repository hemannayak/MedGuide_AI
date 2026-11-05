import { Language, request } from './api';
export type Profile = { id: string; display_name: string; preferred_language: Language; date_of_birth?: string | null; contact_reference?: string | null };
export type Medication = { id: string; medicine_name: string; dosage: string; verification_status: string; updated_at?:string; instructions?: string; schedules?: {id:string;frequency:string;schedule_data:{times:string[]};start_date:string;end_date?:string|null;timezone:string;status:string}[] };
export type FollowUp = { id: string; reason: string; scheduled_at: string; status: string };
export type Prescription = { id: string; status: string; verification_status: string; prescribed_date?: string; created_at: string; medications_count: number };
export type PrescriptionDetail = Omit<Prescription, 'medications_count'> & {
  ocr_results: { id: string; raw_text: string; status: string }[];
  medications: Medication[];
};
export const getProfile = () => request<Profile>('/patients/me');
export const updatePreferredLanguage = (preferred_language: Language) => {
  if (!['en', 'hi', 'te'].includes(preferred_language)) throw new Error('Choose English, Hindi or Telugu.');
  return request<Profile>('/patients/me', { preferred_language }, 'PATCH');
};
export const updateProfile = (display_name: string, preferred_language: Language) => {
  if (!display_name.trim() || display_name.trim().length > 255) throw new Error('Enter a name between 1 and 255 characters.');
  return request<Profile>('/patients/me', { display_name: display_name.trim(), preferred_language }, 'PATCH');
};
export const getMedications = () => request<Medication[]>('/medications');
export const getFollowUps = () => request<FollowUp[]>('/follow-ups');
export const getPrescriptions = () => request<Prescription[]>('/prescriptions');
export type TimelineEvent = { id: string; event_type: string; event_time: string; metadata: Record<string, unknown> | null };
export const getTimeline = (page = 1) => {
  if (!Number.isInteger(page) || page < 1) throw new Error('Invalid timeline page.');
  return request<TimelineEvent[]>(`/timeline?page=${page}&page_size=20`);
};
const resourceId = (id: string) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new Error('Invalid record reference.');
  return id;
};
export const getPrescription = (id: string) => request<PrescriptionDetail>(`/prescriptions/${resourceId(id)}`);
export const canConfirmMedication = (med: Medication) => med.verification_status === 'PENDING' &&
  Boolean(med.medicine_name?.trim()) && med.medicine_name !== 'Unknown Medicine' &&
  Boolean(med.dosage?.trim()) && med.dosage !== 'Unspecified';
export const confirmMedication = (med: Medication, checkedOriginal: boolean) => {
  if (!checkedOriginal || !canConfirmMedication(med)) throw new Error('Check complete details against the original prescription before confirming.');
  return request<Medication>(`/medications/${resourceId(med.id)}/verify`, med.updated_at?{expected_updated_at:med.updated_at}:undefined, 'POST');
};
export const correctOCRMedication = (med: Medication, fields: {medicine_name:string;dosage:string;instructions:string}, checkedOriginal:boolean) => {
  if(med.verification_status!=='PENDING'||!checkedOriginal)throw new Error('Compare pending OCR details with the original prescription first.');
  if(!fields.medicine_name.trim()||!fields.dosage.trim())throw new Error('Copy the medicine name and dosage from the prescription.');
  return request<Medication>(`/medications/${resourceId(med.id)}/ocr-correction`,{...fields,checked_original:true},'PATCH');
};

export type SymptomTriageResult = {
  symptom_record_id: string;
  risk_level: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  red_flags: string[];
  guidance: string;
  escalation_required: boolean;
  created_alert_id?: string | null;
};

export async function submitAndAnalyzeSymptoms(
  text: string,
  language: Language
): Promise<SymptomTriageResult> {
  const clean = text.trim();
  if (!clean || clean.length < 5) throw new Error('Enter a symptom description of at least 5 characters.');
  const record = await request<{ symptom_record_id: string }>('/symptoms', {
    text: clean,
    language,
    input_type: 'text',
  }, 'POST');
  return request<SymptomTriageResult>('/symptoms/analyze', {
    symptom_record_id: record.symptom_record_id,
  }, 'POST');
}
