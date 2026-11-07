import { request } from './api';

function safeUUID(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Crypto = require('expo-crypto');
    if (typeof Crypto.randomUUID === 'function') {
      return Crypto.randomUUID();
    }
  } catch {
    // Graceful fallback when ExpoCrypto native module is not linked
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type Wellness = {
  gender: string | null; emergency_contact: string | null; conditions: string | null; past_illnesses: string | null;
  surgeries: string | null; allergies: string | null; accessibility_needs: string | null; family_history: string | null;
  treatment_history: string | null; sleep_notes: string | null; activity_notes: string | null; dietary_preferences: string | null;
  healthcare_provider: string | null; vaccination_notes: string | null; lab_report_notes: string | null; health_goals: string | null;
  water_goal_ml: number | null; step_goal: number | null; large_controls: boolean; onboarding_step: number; onboarding_complete: boolean;
  health_notice_version: string | null;
};
export type Daily = {day: string; water_ml: number; manual_steps: number; foreground_steps: number};
export type Measurement = { id: string; kind: string; value: number; secondary_value: number | null; unit: string; measured_at: string; source: string };
export const getWellness = () => request<Wellness>('/wellness/settings');
export const saveWellness = (changes: Partial<Wellness>) => request<Wellness>('/wellness/settings', changes, 'PATCH');
export const localDay = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const getDaily = (day = localDay()) => request<Daily>(`/wellness/daily?day=${day}`);
export type Entry = {operation_id: string; day: string; kind: 'water'|'steps'; amount: number; source: 'manual'|'foreground_sensor'; health_notice_version: '1.0'};
export const entry = (kind: Entry['kind'], amount: number, source: Entry['source'] = 'manual'): Entry => ({operation_id: safeUUID(),day:localDay(),kind,amount,source,health_notice_version:'1.0'});
export const sendEntry = (payload: Entry) => request('/wellness/entries', payload);
export const getMeasurements = () => request<Measurement[]>('/wellness/measurements');
export const saveMeasurement = (kind: string, value: number, secondary_value?: number) => request<Measurement>('/wellness/measurements', {operation_id: safeUUID(), kind, value, secondary_value:secondary_value ?? null, measured_at:new Date().toISOString(), health_notice_version:'1.0'});
