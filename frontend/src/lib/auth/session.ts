const tokenKey = "medguide_token";
export function clearLegacyChatCache() {
  for (const name of ["localStorage", "sessionStorage"] as const) {
    try {
      const storage = window[name];
      for (const key of ["medguide_chat_history", "medguide_conv_id"]) storage.removeItem(key);
    } catch { /* Restricted storage must not prevent sign-out. */ }
  }
}
export function getSessionToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);
}
export function saveSessionToken(token: string, remember = false) {
  clearLegacyChatCache();
  sessionStorage.removeItem(tokenKey);
  localStorage.removeItem(tokenKey);
  (remember ? localStorage : sessionStorage).setItem(tokenKey, token);
  window.dispatchEvent(new Event("medguide-session"));
}
export function clearSession() {
  clearLegacyChatCache();
  sessionStorage.removeItem(tokenKey);
  sessionStorage.removeItem("medguide_sample_setup");
  localStorage.removeItem(tokenKey);
  window.dispatchEvent(new Event("medguide-session"));
}
export function safeReturnPath(value: string | null) {
  return value?.startsWith("/app/") && !value.includes("\\") && !value.includes("//") ? value : "/app/chat";
}

export function safeWorkerReturnPath(value: string | null) {
  return value?.startsWith("/hcw/") && !value.includes("\\") && !value.includes("//") ? value : "/hcw/patients";
}
