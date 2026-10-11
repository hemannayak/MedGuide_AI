import { isMockMode } from '@/lib/api/config';
import { getSessionToken } from '@/lib/auth/session';
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
  if (!isMockMode()) throw new Error('Profile saving is not connected yet. Please try again when the profile service is available.');
  const record: PatientProfile = { ...profile, id: 'SYN-SETUP', user_id: 'SYN-USER', created_at: new Date().toISOString() };
  sessionStorage.setItem(key, JSON.stringify({ session: getSessionToken(), profile: record }));
  return record;
}
