import { API_BASE_URL } from '@/lib/api/config';
import { clearSession, getSessionToken } from './session';

export async function signOutSession(): Promise<boolean> {
  const token = getSessionToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    if (!token) return true;
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
    });
    return response.ok || response.status === 401;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
    clearSession();
  }
}
