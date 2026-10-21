export type Profile = {
  name: string;
  language: string;
  age?: string;
  healthNotes?: string;
};
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
export async function loginUser(email: string, password: string) {
  if (!email.trim() || !password)
    throw new Error("Enter your email and password.");
  await new Promise((r) => setTimeout(r, 400));
  return { sample: true };
}
export async function registerUser(
  name: string,
  email: string,
  password: string,
  confirm: string,
) {
  if (!name.trim()) throw new Error("Enter a sample name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Use at least 8 characters.");
  if (password !== confirm) throw new Error("Passwords do not match.");
  return loginUser(email, password);
}
export async function sendMessage(question: string) {
  if (!question.trim()) throw new Error("Type your question first.");
  await new Promise((r) => setTimeout(r, 400));
  return "Sample response: your question has been received. Live medical guidance and sources will appear when Laptop A services are connected.";
}
export async function googleSignIn(): Promise<never> {
  throw new Error(
    "Google sign-in is not connected yet. Use sample email sign-in.",
  );
}
