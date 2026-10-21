import { isMockMode } from '@/lib/api/config';
import { getSessionToken } from '@/lib/auth/session';
import { api } from '@/lib/api/client';
import type { PatientProfile } from '@/types/user';
const key = 'medguide_sample_setup';
export function readSampleProfile(): PatientProfile | null {
  if (typeof window === 'undefined' || !isMockMode()) return null;
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    return saved?.session === getSessionToken() ? saved.profile : null;
  } catch { return null; }
}
export async function saveSetupProfile(profile: Pick<PatientProfile, 'full_name' | 'age' | 'gender' | 'primary_language' | 'village_or_town' | 'known_allergies' | 'chronic_conditions'>) {
  if (!getSessionToken()) throw new Error('Please sign in before saving your profile.');
  const name = profile.full_name?.trim();
  const language = profile.primary_language || 'en';
  if (!name || name.length > 80) throw new Error('Enter a display name of 1 to 80 characters.');
  if (!['en', 'hi', 'te'].includes(language)) throw new Error('Choose English, Hindi or Telugu.');
  if (!isMockMode()) {
    const result = await api.updatePatientProfile({ display_name: name, preferred_language: language as 'en' | 'hi' | 'te' });
    if (!result.success || !result.data) throw new Error(result.message || 'Your profile could not be saved. Please try again.');
    return { id: result.data.id, user_id: result.data.user_id, full_name: result.data.display_name,
      primary_language: result.data.preferred_language, created_at: result.data.created_at } as PatientProfile;
  }
  const record: PatientProfile = { ...profile, id: 'SYN-SETUP', user_id: 'SYN-USER', created_at: new Date().toISOString() };
  sessionStorage.setItem(key, JSON.stringify({ session: getSessionToken(), profile: record }));
  return record;
}
