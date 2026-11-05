import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const tokenKey = 'medguide-session';

export async function getStoredToken(): Promise<string | null> {
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
        window.sessionStorage.removeItem('medguide-care-offline-enabled');
        window.sessionStorage.removeItem('medguide-care-offline-index');
        for(let i=0;i<96;i++)window.sessionStorage.removeItem(`medguide-care-offline-${i}`);
      }
    } catch {
      // localStorage error fallback
    }
    return;
  }
  await SecureStore.deleteItemAsync(tokenKey);
  await SecureStore.deleteItemAsync('medguide-pending-wellness-v1');
  await SecureStore.deleteItemAsync('medguide-care-offline-enabled');
  await SecureStore.deleteItemAsync('medguide-care-offline-index');
  await Promise.all(Array.from({length:96},(_,i)=>SecureStore.deleteItemAsync(`medguide-care-offline-${i}`)));
  try{
    const notifications=await import('expo-notifications');
    const pending=await notifications.getAllScheduledNotificationsAsync?.()??[];
    await Promise.all(pending.filter(item=>item.content.data?.medguideCare).map(item=>notifications.cancelScheduledNotificationAsync(item.identifier)));
  }catch{console.warn('MedGuide reminder cleanup failed. Check device notification settings.');}
}

export type Language = 'en' | 'hi' | 'te';
export type ChatReply = {
  conversation_id: string; message: string; response_type: string;
  disclaimer: string; sources: { title: string; source_url?: string }[];
  red_flags?:string[];
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

export interface OTPRequestResult {
  phone_number: string;
  resend_after_seconds: number;
  expires_in_seconds: number;
  dev_otp?: string;
}

export async function requestOtp(phoneNumber: string, purpose: 'LOGIN' | 'REGISTER' = 'LOGIN'): Promise<OTPRequestResult> {
  const cleanPhone = phoneNumber.trim();
  if (cleanPhone.length < 10) throw new Error('Enter a valid 10-digit mobile phone number.');
  return request<OTPRequestResult>('/auth/otp/request', { phone_number: cleanPhone, purpose });
}

export async function verifyOtpCode(phoneNumber: string, otpCode: string, purpose: 'LOGIN' | 'REGISTER' = 'LOGIN'): Promise<boolean> {
  const code = otpCode.trim();
  if (code.length < 4 || code.length > 8) throw new Error('Enter a valid verification code.');
  const result = await request<{ verified: boolean }>('/auth/otp/verify', {
    phone_number: phoneNumber.trim(),
    otp_code: code,
    purpose,
  });
  return Boolean(result.verified);
}

export async function registerWithOtp(
  phoneNumber: string,
  otpCode: string,
  displayName: string,
  language: Language,
  email?: string
): Promise<void> {
  const name = displayName.trim();
  if (!name || name.length > 80) throw new Error('Enter a display name of 1 to 80 characters.');
  const code = otpCode.trim();
  if (code.length < 4) throw new Error('Enter a valid verification code.');
  const data = await request<{ access_token: string }>('/auth/otp/register', {
    phone_number: phoneNumber.trim(),
    otp_code: code,
    display_name: name,
    preferred_language: language,
    email: email?.trim() || undefined,
  });
  await setStoredToken(data.access_token);
}

export async function loginWithOtp(phoneNumber: string, otpCode: string): Promise<void> {
  const code = otpCode.trim();
  if (code.length < 4) throw new Error('Enter a valid verification code.');
  const data = await request<{ access_token: string }>('/auth/otp/login', {
    phone_number: phoneNumber.trim(),
    otp_code: code,
  });
  await setStoredToken(data.access_token);
}

export async function signOut() {
  const token = await getStoredToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  let revoked = !token;
  try {
    const base = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
    if (token && base && (base.startsWith('https://') || __DEV__)) {
      const response = await fetch(`${base}/auth/logout`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
      });
      revoked = response.ok || response.status === 401;
    }
  } catch { revoked = false; }
  finally { clearTimeout(timeout); await deleteStoredToken(); }
  if (!revoked) Alert.alert('Signed out on this device', 'We could not confirm server sign-out. The previous session may remain valid until it expires.');
}
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
