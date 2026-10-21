import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const tokenKey = 'medguide-session';

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(tokenKey) : null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(tokenKey);
}

async function setStoredToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(tokenKey, token);
      }
    } catch {
      // localStorage error fallback
    }
    return;
  }
  await SecureStore.setItemAsync(tokenKey, token);
}

async function deleteStoredToken(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(tokenKey);
        window.sessionStorage.removeItem('medguide-pending-wellness-v1');
      }
    } catch {
      // localStorage error fallback
    }
    return;
  }
  await SecureStore.deleteItemAsync(tokenKey);
  await SecureStore.deleteItemAsync('medguide-pending-wellness-v1');
}

export type Language = 'en' | 'hi' | 'te';
export type ChatReply = {
  conversation_id: string; message: string; response_type: string;
  disclaimer: string; sources: { title: string; source_url?: string }[];
};

export async function request<T>(path: string, payload?: unknown, method?: string, raw = false): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  if (!base) throw new Error('Configure EXPO_PUBLIC_API_BASE_URL to connect to MedGuide.');
  if (!base.startsWith('https://') && !__DEV__) throw new Error('A secure HTTPS service is required.');
  const token = await getStoredToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(`${base}${path}`, {
      method: method || (payload === undefined ? 'GET' : 'POST'),
      headers: { ...(payload instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: payload instanceof FormData ? payload : payload === undefined ? undefined : JSON.stringify(payload), signal: controller.signal,
    });
    if (response.status === 401) {
      await deleteStoredToken();
      throw new Error('Please sign in again.');
    }
    const body = await response.json();
    if (!response.ok || (!raw && !body.success)) throw new Error(typeof body.detail === 'string' ? body.detail : body.message || 'The request failed.');
    return (raw ? body : body.data) as T;
  } finally { clearTimeout(timeout); }
}

export async function signIn(identifier: string, password: string) {
  const data = await request<{ access_token: string }>('/auth/login', { login_identifier: identifier.trim(), password });
  await setStoredToken(data.access_token);
}
export async function registerPatient(identifier: string, password: string, displayName: string, language: Language) {
  const name = displayName.trim(), login = identifier.trim();
  if (!name || name.length > 80) throw new Error('Enter a display name of 1 to 80 characters.');
  if (login.length < 3 || login.length > 254) throw new Error('Enter an email or username of 3 to 254 characters.');
  if (password.length < 8 || password.length > 128) throw new Error('Use a password of 8 to 128 characters.');
  if (!['en', 'hi', 'te'].includes(language)) throw new Error('Choose English, Hindi or Telugu.');
  await request('/auth/register', { login_identifier: login, password, display_name: name, preferred_language: language });
}
export async function signOut() { await deleteStoredToken(); }
export const hasSession = async () => Boolean(await getStoredToken());
export const sendChat = (message: string, language: Language, conversation_id?: string) =>
  request<ChatReply>('/ai/chat', { message, language, conversation_id });

export async function transcribeRecording(uri: string, language: Language) {
  const form = new FormData();
  form.append('file', { uri, name: 'concern.m4a', type: 'audio/mp4' } as unknown as Blob);
  form.append('language_code', language);
  const result = await request<{ transcript: string }>('/speech/stt', form, 'POST', true);
  if (!result.transcript?.trim()) throw new Error('No speech was recognized. Please record again or type your concern.');
  return result.transcript;
}
export async function synthesizeSpeech(text: string, language: Language) {
  const result = await request<{ audio_base64: string; format: string }>('/speech/tts', { text, language, speaker: 'shubh', format: 'mp3' }, 'POST', true);
  if (!result.audio_base64 || result.format !== 'mp3') throw new Error('Spoken reply is unavailable. Your text answer is still available.');
  return result.audio_base64;
}
