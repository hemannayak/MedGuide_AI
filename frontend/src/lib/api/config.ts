export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const API_MODE =
  (process.env.NEXT_PUBLIC_API_MODE as "MOCK" | "REAL") || "MOCK";

export const isMockMode = (): boolean => API_MODE === "MOCK";
