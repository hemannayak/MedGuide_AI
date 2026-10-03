import { StandardResponse } from "@/types/api";
import { AIChatRequest, AIChatResponse, ResponseType } from "@/types/ai";
import { SymptomRecordRequest, SymptomTriageResult, RiskLevel } from "@/types/symptom";
import { AuthTokenResponse, LoginRequest, RegisterRequest, User, UserRole, PatientProfile } from "@/types/user";
import { Medication, Prescription } from "@/types/medication";

export class MockApiAdapter {
  private static mockUser: User = {
    id: "usr_mock_001",
    email: "patient.demo@medguide.ai",
    full_name: "Ramesh Kumar",
    phone_number: "+91 9876543210",
    role: UserRole.PATIENT,
    preferred_language: "te",
    is_active: true,
    created_at: new Date().toISOString(),
  };

  private static mockProfile: PatientProfile = {
    id: "pat_mock_001",
    user_id: "usr_mock_001",
    age: 42,
    gender: "Male",
    blood_group: "O+",
    known_allergies: ["Penicillin"],
    chronic_conditions: ["Type 2 Diabetes"],
    emergency_contact_name: "Sunitha Kumar (Spouse)",
    emergency_contact_phone: "+91 9876543211",
    village_or_town: "Narsipatnam",
    state: "Andhra Pradesh",
    created_at: new Date().toISOString(),
  };

  static async login(data: LoginRequest): Promise<StandardResponse<AuthTokenResponse>> {
    await new Promise((res) => setTimeout(res, 600)); // Simulate network latency
    return {
      success: true,
      message: "Login successful (Mock Mode)",
      data: {
        access_token: "mock_jwt_token_medguide_ai_laptop_b_dev",
        token_type: "bearer",
        user: { ...this.mockUser, email: data.email_or_phone || this.mockUser.email },
      },
    };
  }

  static async register(data: RegisterRequest): Promise<StandardResponse<AuthTokenResponse>> {
    await new Promise((res) => setTimeout(res, 800));
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      phone_number: data.phone_number || "",
      role: data.role || UserRole.PATIENT,
      preferred_language: data.preferred_language || "en",
      is_active: true,
      created_at: new Date().toISOString(),
    };
    return {
      success: true,
      message: "Registration successful (Mock Mode)",
      data: {
        access_token: "mock_jwt_token_new_user",
        token_type: "bearer",
        user: newUser,
      },
    };
  }

  static async getPatientProfile(): Promise<StandardResponse<PatientProfile>> {
    await new Promise((res) => setTimeout(res, 400));
    return {
      success: true,
      data: this.mockProfile,
    };
  }

  static async postAIChat(req: AIChatRequest): Promise<StandardResponse<AIChatResponse>> {
    await new Promise((res) => setTimeout(res, 1200));

    const msgLower = req.message.toLowerCase();
    
    // Check for mock emergency triggers
    if (msgLower.includes("chest pain") || msgLower.includes("breathing difficulty") || msgLower.includes("severe pain")) {
      return {
        success: true,
        data: {
          conversation_id: req.conversation_id || "conv_mock_emergency_108",
          message: "CRITICAL ALERT: Your reported symptoms indicate a potential medical emergency. Please seek immediate medical attention or call emergency services (108 / 112) right away.",
          language: req.language || "en",
          response_type: ResponseType.EMERGENCY,
          refusal_triggered: false,
          red_flags: ["Severe chest pain", "Potential acute cardiac event"],
          sources: [
            {
              citation_id: 1,
              document_id: "doc_who_emergency_01",
              chunk_id: "chk_001",
              title: "WHO Guidelines for Emergency Cardiac Care & Chest Pain Escalation",
              publisher: "World Health Organization",
              publication_date: "2023-05",
              page_number: 14,
              section_title: "Emergency Escalation Thresholds",
              source_url: "https://www.who.int/guidelines/cardiac-emergencies",
            },
          ],
          disclaimer: "MedGuide AI provides preliminary safety guidance based on official medical rules. This is not a substitute for emergency professional care.",
        },
      };
    }

    // Default Guidance Response
    return {
      success: true,
      data: {
        conversation_id: req.conversation_id || "conv_mock_standard_01",
        message: `Thank you for reaching out. Based on official health guidance for reported symptoms ("${req.message.slice(0, 40)}..."), keep hydrated, rest adequately, and monitor for any rising fever or breathing trouble. If symptoms persist for more than 48 hours, consult a local healthcare professional.`,
        language: req.language || "en",
        response_type: ResponseType.SYMPTOM_GUIDANCE,
        refusal_triggered: false,
        red_flags: [],
        sources: [
          {
            citation_id: 1,
            document_id: "doc_who_primary_care_03",
            chunk_id: "chk_402",
            title: "WHO Primary Care Clinical Guidelines for Common Rural Symptoms",
            publisher: "World Health Organization",
            publication_date: "2022-11",
            page_number: 28,
            section_title: "Non-Urgent Symptom Self-Care",
            source_url: "https://www.who.int/publications/primary-care-guide",
          },
        ],
        disclaimer: "MedGuide AI provides preliminary health information based on official medical guidelines. It is not a substitute for professional medical advice, diagnosis, or treatment.",
      },
    };
  }

  static async submitSymptoms(req: SymptomRecordRequest): Promise<StandardResponse<SymptomTriageResult>> {
    await new Promise((res) => setTimeout(res, 900));

    const desc = req.symptoms_description.toLowerCase();
    let riskLevel = RiskLevel.ROUTINE;
    let redFlags: string[] = [];
    let escalationRequired = false;
    let actionText = "Maintain rest, stay hydrated, and monitor symptoms. Visit a local clinic if symptoms escalate.";

    if (desc.includes("fever") && (req.duration_days || 0) > 3) {
      riskLevel = RiskLevel.URGENT;
      redFlags = ["Prolonged fever (>3 days)"];
      escalationRequired = true;
      actionText = "Schedule a visit with a community healthcare worker or local primary health center (PHC) within 24 hours.";
    } else if (desc.includes("chest pain") || desc.includes("unconscious") || desc.includes("breath")) {
      riskLevel = RiskLevel.EMERGENCY;
      redFlags = ["Acute distress indicator", "Possible emergency threshold met"];
      escalationRequired = true;
      actionText = "IMMEDIATE ACTION REQUIRED: Contact emergency ambulance services (108 / 112) or go to the nearest hospital immediately.";
    }

    return {
      success: true,
      data: {
        id: `sym_rec_${Date.now()}`,
        patient_id: "pat_mock_001",
        symptoms_description: req.symptoms_description,
        risk_level: riskLevel,
        red_flags_detected: redFlags,
        recommended_action: actionText,
        escalation_required: escalationRequired,
        created_at: new Date().toISOString(),
      },
    };
  }

  static async getMedications(): Promise<StandardResponse<Medication[]>> {
    await new Promise((res) => setTimeout(res, 500));
    return {
      success: true,
      data: [
        {
          id: "med_001",
          patient_id: "pat_mock_001",
          medicine_name: "Metformin 500mg",
          dosage: "1 tablet twice daily",
          route: "Oral",
          instructions: "Take after morning and evening meals with water.",
          verification_status: "VERIFIED",
          status: "ACTIVE",
          created_at: "2026-09-20T08:00:00Z",
          schedules: [
            {
              id: "sch_001",
              medication_id: "med_001",
              time_of_day: "08:30 AM",
              dosage_amount: "1 tablet",
              meal_relation: "AFTER",
              reminder_enabled: true,
            },
            {
              id: "sch_002",
              medication_id: "med_001",
              time_of_day: "08:30 PM",
              dosage_amount: "1 tablet",
              meal_relation: "AFTER",
              reminder_enabled: true,
            },
          ],
        },
        {
          id: "med_002",
          patient_id: "pat_mock_001",
          medicine_name: "Amlodipine 5mg",
          dosage: "1 tablet once daily",
          route: "Oral",
          instructions: "Take every morning at regular time.",
          verification_status: "VERIFIED",
          status: "ACTIVE",
          created_at: "2026-09-20T08:00:00Z",
          schedules: [
            {
              id: "sch_003",
              medication_id: "med_002",
              time_of_day: "09:00 AM",
              dosage_amount: "1 tablet",
              meal_relation: "INDEPENDENT",
              reminder_enabled: true,
            },
          ],
        },
        {
          id: "med_003",
          patient_id: "pat_mock_001",
          medicine_name: "Paracetamol 650mg",
          dosage: "1 tablet as needed",
          route: "Oral",
          instructions: "Take for fever or headache; max 3 doses per day. PENDING VERIFICATION from recent prescription upload.",
          verification_status: "PENDING",
          status: "ACTIVE",
          created_at: "2026-09-24T14:30:00Z",
          schedules: [],
        },
      ],
    };
  }

  static async getPrescriptions(): Promise<StandardResponse<Prescription[]>> {
    await new Promise((res) => setTimeout(res, 500));
    return {
      success: true,
      data: [
        {
          id: "rx_001",
          patient_id: "pat_mock_001",
          source: "UPLOAD",
          status: "ACTIVE",
          verification_status: "PENDING",
          prescribed_date: "2026-09-24",
          doctor_name: "Dr. K. Srinivas, MBBS, MD",
          hospital_name: "Community Health Centre, Narsipatnam",
          notes: "Patient reported acute body ache and intermittent fever for 2 days.",
          created_at: "2026-09-24T14:20:00Z",
          images: [
            {
              id: "img_001",
              prescription_id: "rx_001",
              storage_reference: "/prescriptions/sample_rx_telugu_rural.jpg",
              file_type: "image/jpeg",
              file_size: 1420580,
              uploaded_at: "2026-09-24T14:20:00Z",
              ocr_results: [
                {
                  id: "ocr_001",
                  prescription_image_id: "img_001",
                  engine: "PaddleOCR + Tesseract v5.0",
                  model_version: "2.8.0",
                  raw_text: "Tab. Paracetamol 650mg 1-0-1 x 3 days\nTab. Cetirizine 10mg 0-0-1 x 5 days\nReview after 3 days if fever persists.",
                  confidence: 0.88,
                  status: "SUCCESS",
                  processed_at: "2026-09-24T14:21:00Z",
                },
              ],
            },
          ],
          medications: [
            {
              id: "med_003",
              patient_id: "pat_mock_001",
              medicine_name: "Paracetamol 650mg",
              dosage: "1-0-1 (Twice daily)",
              route: "Oral",
              instructions: "Take after meals for 3 days",
              status: "ACTIVE",
              verification_status: "PENDING",
              created_at: "2026-09-24T14:21:00Z",
            },
          ],
        },
      ],
    };
  }
}

