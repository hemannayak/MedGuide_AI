export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const API_MODE =
  (process.env.NEXT_PUBLIC_API_MODE as "MOCK" | "REAL") || "REAL";

if (process.env.NODE_ENV === "production" && API_MODE === "MOCK") {
  throw new Error("MedGuide production requires NEXT_PUBLIC_API_MODE=REAL. Synthetic responses are disabled.");
}

export const isMockMode = (): boolean => API_MODE === "MOCK";
