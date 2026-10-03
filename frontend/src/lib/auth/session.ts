const tokenKey = "medguide_token";
export function getSessionToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);
}
export function saveSessionToken(token: string, remember = false) {
  sessionStorage.removeItem(tokenKey);
  localStorage.removeItem(tokenKey);
  (remember ? localStorage : sessionStorage).setItem(tokenKey, token);
  window.dispatchEvent(new Event("medguide-session"));
}
export function clearSession() {
  sessionStorage.removeItem(tokenKey);
  localStorage.removeItem(tokenKey);
  window.dispatchEvent(new Event("medguide-session"));
}
export function safeReturnPath(value: string | null) {
  return value?.startsWith("/app/") && !value.includes("\\") && !value.includes("//") ? value : "/app/dashboard";
}
