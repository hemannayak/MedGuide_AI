export enum ResponseType {
  INFORMATIONAL = "INFORMATIONAL",
  SYMPTOM_GUIDANCE = "SYMPTOM_GUIDANCE",
  MEDICATION_INFO = "MEDICATION_INFO",
  EMERGENCY = "EMERGENCY",
  REFUSAL = "REFUSAL",
  OUT_OF_SCOPE = "OUT_OF_SCOPE",
}

export interface SourceCitation {
  citation_id: number;
  document_id: string;
  chunk_id: string;
  title: string;
  publisher: string;
  publication_date?: string;
  page_number?: number;
  section_title?: string;
  source_url?: string;
}

export interface AIChatRequest {
  message: string;
  language?: "en" | "hi" | "te" | string;
  conversation_id?: string;
}

export interface AIChatResponse {
  conversation_id: string;
  message: string;
  language: string;
  response_type: ResponseType;
  refusal_triggered: boolean;
  red_flags: string[];
  sources: SourceCitation[];
  disclaimer: string;
}

export interface ConversationMessage {
  id: string;
  sender_type: "user" | "ai" | "system";
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ConversationResponse {
  id: string;
  patient_id: string;
  language: string;
  status: string;
  started_at: string;
  ended_at?: string;
  messages: ConversationMessage[];
}
