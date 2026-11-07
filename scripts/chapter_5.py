# -*- coding: utf-8 -*-
"""
MedGuide AI — Chapter 5 Proposed Methodology
Comprehensive technical coverage of Web, Mobile, FastAPI, Database (27 tables),
RAG, Safety Gate, Sarvam/Whisper, OCR, Security, Testing, Offline & Deployment.
"""

from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from build_full_report import (
    format_p, add_body_p, add_bullet_p, add_heading_1, add_heading_2, add_heading_3,
    add_figure, add_custom_table, make_callout_box
)

def build_chapter_5(doc, img_dir_arch, img_dir_back, img_dir_front, img_dir_mobile):
    add_heading_1(doc, "CHAPTER 5\nPROPOSED METHODOLOGY")
    
    # 5.1 Overall System Architecture
    add_heading_2(doc, "5.1 Overall System Architecture")
    add_body_p(
        doc,
        "MedGuide AI is engineered as a modular, decoupled, and multi-tiered digital healthcare platform. The system decouples "
        "safety-critical triage decisions from generative neural models, ensuring that high-acuity medical risks are intercepted "
        "deterministically before reaching stochastic generation components. The architecture consists of four distinct operational layers:"
    )
    add_bullet_p(doc, " Next.js 14 Web client (TypeScript, Tailwind CSS) for desktop/mobile browsers, and a cross-platform React Native / Expo mobile application providing native camera and microphone device integrations.", "1. Presentation Layer:")
    add_bullet_p(doc, " Asynchronous FastAPI 0.141+ backend exposing authenticated RESTful endpoints, streaming WebSockets, dependency injection for security/DB sessions, and strict Pydantic v2 schema validation.", "2. Application & API Gateway Layer:")
    add_bullet_p(doc, " Modular pipeline comprising an upstream deterministic red-flag safety ontology, dense vector retrieval using paraphrase-multilingual-MiniLM-L12-v2 (384-d), a multi-provider LLM gateway (Groq runtime, Ollama local fallback), Sarvam AI Indic speech processing, and Tesseract OCR.", "3. Intelligence & Clinical Decision Layer:")
    add_bullet_p(doc, " PostgreSQL 18.4 relational database extended with the pgvector 0.8.5 vector extension, managing 27 relational tables with ACID transactions, foreign keys, index structures, and audit logs.", "4. Data & Persistence Layer:")

    # 5.2 Web Application Architecture and Route Inventory
    add_heading_2(doc, "5.2 Web Application Architecture and Route Inventory")
    add_body_p(
        doc,
        "The web client is developed using Next.js 14 utilizing the App Router architecture, TypeScript for static type safety, "
        "and Tailwind CSS for responsive, mobile-first styling. The application enforces a strict separation between public marketing "
        "pages, unauthenticated onboarding flows, authenticated patient digital care workspaces, and restricted healthcare-worker portals. "
        "Client-side state management is handled via React Context and custom hooks (`useAskMedGuideChat`, `useAuthSession`), with Axios "
        "managing authenticated API transport and JWT token interception. Table 5.1 provides the complete route inventory of the web application."
    )
    
    web_headers = ["Route Path", "Route Name & Function", "Access Level", "Key Components & Capabilities"]
    web_data = [
        ["/", "Public Landing Page", "Public (Guest)", "Marketing hero, clinical philosophy, emergency dialing 108/112 links."],
        ["/about", "About MedGuide AI", "Public (Guest)", "Mission statement, rural healthcare focus, academic credentials."],
        ["/technology", "Technology & Architecture", "Public (Guest)", "Overview of RAG pipeline, pgvector, safety gate, open-source stack."],
        ["/auth/sign-in", "Patient / Worker Sign In", "Public (Guest)", "Role selection (Patient, Worker), password auth, JWT persistence."],
        ["/auth/sign-up", "Account Registration", "Public (Guest)", "Patient registration, demographic collection, emergency contact."],
        ["/auth/consent", "Granular Consent Modal", "Authenticated", "Captures AI_PROCESSING, SPEECH_PROCESSING, and WORKER_ACCESS consent."],
        ["/app/chat", "Ask MedGuide AI Chat", "Patient Auth", "Conversational symptom consultation, streaming replies, citation cards."],
        ["/app/symptoms", "Symptom Intake Assessment", "Patient Auth", "Structured symptom intake, duration/severity chips, red-flag check."],
        ["/app/prescriptions", "Prescription Repository", "Patient Auth", "Prescription list, upload trigger, OCR extraction review cards."],
        ["/app/prescriptions/upload", "Prescription Image Capture", "Patient Auth", "File upload, image preview, OCR parsing trigger."],
        ["/app/prescriptions/[id]", "Prescription Verification", "Patient Auth", "Interactive medicine verification, dosage confirmation, schedule commit."],
        ["/app/medications", "Medication Schedules", "Patient Auth", "Active schedules, daily dose reminders, adherence log check-in."],
        ["/app/timeline", "Health Timeline", "Patient Auth", "Chronological aggregation of symptoms, prescriptions, and follow-ups."],
        ["/app/profile", "Patient Health Profile", "Patient Auth", "Demographic details, chronic conditions, emergency contact management."],
        ["/worker/dashboard", "Healthcare Worker Roster", "Worker Auth", "Assigned patient roster, triage alerts, high-risk follow-up queue."],
        ["/worker/patients/[id]", "Worker Patient Detail View", "Worker Auth", "Patient longitudinal history, symptom logs, adherence compliance."],
        ["/emergency", "Emergency Protocols", "Public (All)", "Instant emergency telephone links (108 Ambulance, 112 National, 104 Health)."]
    ]
    add_custom_table(doc, web_headers, web_data, "Complete Inventory of Next.js Web Application Routes and Access Controls", "5.1", col_widths=[3.5, 3.5, 2.5, 6.0])

    # 5.3 Mobile Application Architecture and Screen Inventory
    add_heading_2(doc, "5.3 Mobile Application Architecture and Screen Inventory")
    add_body_p(
        doc,
        "The mobile application is engineered using React Native with Expo SDK 51, providing a native, cross-platform Android and iOS "
        "experience optimized for low-cost smartphones prevalent in rural India. The mobile application utilizes Expo Router for "
        "file-based navigation, Async-Storage for offline credential and data caching, and native device hardware interfaces "
        "(Camera, Audio Recording, Push Notifications). The interface prioritizes large touch targets (minimum 48x48 dp), high-contrast "
        "typography, bilingual labels (English, Hindi, Telugu), and visual iconography for users with low digital literacy. "
        "Table 5.2 outlines the complete screen inventory of the mobile client."
    )
    
    mob_headers = ["Screen Path", "Screen Title", "Primary Functionality & Device Integration"]
    mob_data = [
        ["app/index.tsx", "Splash / Entry Screen", "Application bootstrap, auth token validation, automatic routing."],
        ["app/login.tsx", "Mobile Sign In", "Phone/email authentication, OTP fallback, session token storage."],
        ["app/register.tsx", "Mobile Registration", "Multi-step registration with simplified village/district selection."],
        ["app/permissions.tsx", "Device Permissions", "Requests Camera, Microphone, and Notification permissions with plain explanations."],
        ["app/consent.tsx", "Mobile Privacy Consent", "Bilingual consent cards explaining AI data usage and doctor confidentiality."],
        ["app/home.tsx", "Daily Care Dashboard", "Quick symptom check button, today's medication pills, wellness streak."],
        ["app/ask.tsx", "Ask MedGuide Intake", "Voice or text query input, example prompt chips, language selector."],
        ["app/chat.tsx", "Mobile Conversational Chat", "Real-time message list, risk level highlighting (Red/Amber/Green), citations."],
        ["app/voice-review.tsx", "Voice Transcript Review", "Audio recording playback, ASR transcript review, user edit before commit."],
        ["app/symptoms.tsx", "Mobile Symptom Tracker", "Visual body map, pain scale slider (1-10), symptom onset recorder."],
        ["app/prescriptions/upload.tsx", "Prescription Camera Capture", "Native camera viewfinder, gallery picker, image crop and upload."],
        ["app/prescriptions/[id].tsx", "Mobile OCR Review", "Side-by-side prescription image and extracted medicine card review."],
        ["app/care.tsx", "Medication Adherence View", "Today's schedule, 'Take Dose' one-tap logging, missed dose alerts."],
        ["app/timeline.tsx", "Mobile Health Timeline", "Chronological list of all medical consultations, symptoms, and tests."],
        ["app/profile.tsx", "Mobile User Profile", "Personal health card, emergency contacts, language preference."],
        ["app/settings.tsx", "App Settings & Privacy", "Audio guidance toggle, offline cache purge, logout, about MedGuide."]
    ]
    add_custom_table(doc, mob_headers, mob_data, "Complete Inventory of React Native / Expo Mobile Application Screens", "5.2", col_widths=[3.8, 3.5, 8.2])

    # 5.4 FastAPI Backend Modules and API Contracts
    add_heading_2(doc, "5.4 FastAPI Backend Modules and API Contracts")
    add_body_p(
        doc,
        "The backend is developed as an asynchronous FastAPI application organized into modular domain routers under `app.api.v1.endpoints`. "
        "FastAPI leverages Python's `asyncio` for non-blocking I/O operations, ensuring high throughput when handling concurrent database "
        "queries and upstream AI requests. All incoming request payloads and outgoing responses are strictly validated through Pydantic v2 "
        "models. Table 5.3 summarizes the core backend modules and their operational responsibilities."
    )
    
    mod_headers = ["Module Path", "Domain Service", "Endpoints Managed", "Core Responsibilities"]
    mod_data = [
        ["app/api/v1/endpoints/auth.py", "Authentication & Identity", "/login, /register, /me, /refresh", "Argon2/bcrypt password hashing, JWT creation/verification, role assignment."],
        ["app/api/v1/endpoints/symptoms.py", "Symptom Assessment", "/symptoms, /symptoms/analyze", "Symptom persistence, deterministic emergency check, triage tier assignment."],
        ["app/api/v1/endpoints/ai.py", "Clinical AI & RAG", "/ai/chat, /ai/explain, /ai/conversations", "Conversational RAG, dense vector retrieval, evidence prompt binding."],
        ["app/api/v1/endpoints/voice.py", "Streaming Voice", "/voice/session (WebSocket)", "Full-duplex WebSocket audio session, VAD, STT, LLM, validated TTS stream."],
        ["app/api/v1/endpoints/speech.py", "Batch Speech Services", "/speech/stt, /speech/tts, /speech/translate", "Batch audio transcription, text-to-speech synthesis, Sarvam/Whisper adapter."],
        ["app/api/v1/endpoints/prescriptions.py", "Prescription & OCR", "/prescriptions, /prescriptions/upload", "Prescription image storage, Tesseract OCR invocation, medicine extraction."],
        ["app/api/v1/endpoints/medications.py", "Medication Management", "/medications, /medications/schedules", "Schedule generation, adherence check-in logging, adherence stats."],
        ["app/api/v1/endpoints/timeline.py", "Health Timeline", "/timeline, /timeline/events", "Aggregated chronological timeline query across symptoms, meds, and visits."],
        ["app/api/v1/endpoints/consent.py", "Consent Management", "/consent, /consent/withdraw", "Granular consent state tracking, legal audit trail, consent withdrawal."],
        ["app/api/v1/endpoints/healthcare_workers.py", "Worker Coordination", "/workers/patients, /workers/follow-ups", "Roster assignment, patient timeline inspection, follow-up scheduling."]
    ]
    add_custom_table(doc, mod_headers, mod_data, "FastAPI Core Application Modules and Service Responsibilities", "5.3", col_widths=[3.8, 3.2, 3.5, 5.0])

    # Insert Figure 5.1 (Swagger Docs)
    fig_51 = img_dir_back / "Figure_5_1_FastAPI_Swagger_Docs.png"
    add_figure(doc, fig_51, "FastAPI Interactive OpenAPI / Swagger Documentation and Route Explorer", "5.1")

    # 5.5 Relational Database Architecture and Data Dictionary
    add_heading_2(doc, "5.5 Relational Database Architecture and Data Dictionary")
    add_body_p(
        doc,
        "The data layer is implemented in PostgreSQL 18.4 utilizing the `pgvector` 0.8.5 extension for high-performance vector operations. "
        "In strict adherence to healthcare relational integrity principles, application entities are modeled across 27 normalized tables "
        "rather than unstructured JSON blobs. Tables enforce foreign key constraints with explicit `ON DELETE CASCADE` or `RESTRICT` "
        "rules, indexed lookup keys, and timestamped audit trails. Table 5.4 catalogues the complete 27-table database schema."
    )
    
    db_cat_headers = ["Schema Entity Category", "Table Name", "Primary Key & Unique Keys", "Core Relational Purpose"]
    db_cat_data = [
        ["Authentication & RBAC", "users", "id (UUID)", "Core identity record: email, hashed_password, is_active, timestamps."],
        ["Authentication & RBAC", "roles", "id (Integer), name (VARCHAR)", "Role definitions: PATIENT, HEALTHCARE_WORKER, ADMIN."],
        ["Authentication & RBAC", "user_roles", "user_id, role_id", "Many-to-many junction mapping users to authorized system roles."],
        ["Authentication & RBAC", "otp_verifications", "id (UUID), phone", "Temporary OTP codes, expiration timestamps, verification status."],
        ["User Profiles", "patient_profiles", "id (UUID), user_id", "Patient demographics: full_name, dob, gender, blood_group, village, emergency_contact."],
        ["User Profiles", "healthcare_worker_profiles", "id (UUID), user_id", "Worker credentials: full_name, badge_number, jurisdiction, role_type (ASHA/ANM)."],
        ["User Profiles", "worker_patient_assignments", "worker_id, patient_id", "Jurisdictional assignment linking ASHA workers to rural patient households."],
        ["Consent & Governance", "consents", "id (UUID), user_id, consent_type", "Granular consent state (AI_PROCESSING, SPEECH_PROCESSING, WORKER_ACCESS)."],
        ["Consent & Governance", "consent_audit_logs", "id (UUID), consent_id", "Immutable audit trail of consent grant, revision, and withdrawal events."],
        ["Clinical Symptoms", "symptom_records", "id (UUID), patient_id", "Patient symptom logs: complaint_text, duration_days, severity, triage_tier."],
        ["Clinical Symptoms", "symptom_entities", "id (UUID), symptom_record_id", "Extracted clinical entities: anatomical_site, sensation, aggravating_factors."],
        ["Conversational AI", "conversations", "id (UUID), user_id", "Session container for multi-turn clinical chat and speech dialogues."],
        ["Conversational AI", "conversation_messages", "id (UUID), conversation_id", "Chat messages: sender_type (PATIENT, AI_COMPANION), message_text, metadata."],
        ["Conversational AI", "message_citations", "id (UUID), message_id", "Persistent citation snapshots: document_id, chunk_id, publisher, page_num."],
        ["Prescriptions & OCR", "prescriptions", "id (UUID), patient_id", "Prescription record: image_url, doctor_name, clinic_name, verification_status."],
        ["Prescriptions & OCR", "prescription_extracted_items", "id (UUID), prescription_id", "Raw OCR output: medicine_text, raw_dosage, confidence_score, verified_by."],
        ["Medications", "medications", "id (UUID), patient_id", "Confirmed medications: generic_name, brand_name, strength, form (tablet/syrup)."],
        ["Medications", "medication_schedules", "id (UUID), medication_id", "Active schedules: dosage, frequency (OD, BD, TDS), meal_relation (AC, PC), start/end."],
        ["Medications", "medication_adherence_logs", "id (UUID), schedule_id", "Daily adherence tracking: scheduled_time, taken_time, status (TAKEN, MISSED, SKIPPED)."],
        ["Health Timeline", "health_timeline_events", "id (UUID), patient_id", "Unified chronological timeline entries: event_type, reference_id, summary, date."],
        ["Worker Coordination", "follow_ups", "id (UUID), patient_id", "Scheduled home visits, clinical follow-ups, worker notes, completion status."],
        ["Worker Coordination", "clinical_alerts", "id (UUID), patient_id", "Automated alerts for high-risk triage, non-adherence streaks, emergency escalation."],
        ["Wellness & Lifestyle", "wellness_logs", "id (UUID), patient_id", "Lifestyle entries: water intake, activity, mood, daily symptom check-ins."],
        ["Wellness & Lifestyle", "wellness_streaks", "id (UUID), patient_id", "Adherence and wellness gamification streaks promoting health engagement."],
        ["Medical Knowledge RAG", "medical_documents", "id (UUID), doc_hash", "Authoritative guideline metadata: title, publisher, edition, publication_year, file_path."],
        ["Medical Knowledge RAG", "knowledge_chunks", "id (UUID), document_id", "Text chunks: chunk_text, page_number, section_title, embedding (vector(384))."],
        ["System Governance", "audit_logs", "id (UUID), user_id", "Comprehensive technical audit log: action, endpoint, client_ip, status_code, timestamp."]
    ]
    add_custom_table(doc, db_cat_headers, db_cat_data, "Unified Relational and Vector Database Entity Catalog (27 Tables)", "5.4", col_widths=[3.0, 3.8, 3.2, 5.5])

    # Insert Figure 8.1 (Database ER Diagram)
    fig_81 = img_dir_arch / "Figure_8_1_Database_ER_Diagram.png"
    add_figure(doc, fig_81, "Entity-Relationship (ER) Diagram of the Unified Relational and pgvector Database", "8.1")

    # 5.6 Medical Document Ingestion and RAG Pipeline
    add_heading_2(doc, "5.6 Medical Document Ingestion and RAG Pipeline")
    add_body_p(
        doc,
        "The Retrieval-Augmented Generation pipeline is engineered to eliminate hallucination by grounding all generative responses "
        "in verified medical guidelines. Medical documents are restricted to authoritative open-access public health publications: "
        "(1) World Health Organization (WHO) Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care; "
        "(2) WHO Hypertension Guidelines 2021; (3) WHO Malaria Guidelines 2025; (4) Indian Council of Medical Research (ICMR) Standard "
        "Treatment Workflows (STW); and (5) National Health Mission (NHM) Primary Healthcare Manuals."
    )
    add_body_p(
        doc,
        "Document ingestion is implemented in Python utilizing `pypdf` for text extraction. The extraction pipeline cleans whitespace, "
        "standardizes ligatures, and filters headers and footers while preserving page numbers and chapter headings. Extracted text is "
        "chunked using character-based sliding windows: 500 characters per window with a 50-character overlap. Chunking strictly respects "
        "page boundaries, ensuring that text from separate pages is never conflated within a single chunk. Every chunk is associated with "
        "rich provenance metadata: `document_title`, `publisher`, `page_number`, `inferred_section`, and `sha256_hash`."
    )

    # 5.7 Vector Storage and Similarity Retrieval
    add_heading_2(doc, "5.7 Vector Storage and Similarity Retrieval")
    add_body_p(
        doc,
        "Dense vector representations are computed using `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. This model produces "
        "384-dimensional dense embeddings and is executed locally via ONNX Runtime with mean pooling, providing low latency (<25 ms per chunk) "
        "on CPU hardware without requiring dedicated GPU acceleration. A PyTorch SentenceTransformer fallback is maintained for environments "
        "lacking ONNX runtimes."
    )
    add_body_p(
        doc,
        "Stored embeddings are managed in PostgreSQL using the `pgvector` extension with a `vector(384)` column type. Retrieval executes "
        "exact nearest-neighbor search utilizing cosine distance (`<=>` operator in pgvector), mapped to cosine similarity via: "
        "\nSimilarity = 1.0 - (embedding <=> query_embedding).\n"
        "At query time, the system retrieves the top-k (k=4) nearest chunks. If the nearest chunk similarity falls below the relevance "
        "threshold (0.65), the system triggers an evidence gap warning, refusing to generate speculative advice and instructing the user "
        "to seek in-person professional evaluation."
    )

    # 5.8 Deterministic Safety Checks and Escalation
    add_heading_2(doc, "5.8 Deterministic Safety Checks and Escalation")
    add_body_p(
        doc,
        "A foundational safety requirement of MedGuide AI is that emergency risk detection MUST NOT depend on probabilistic language "
        "models. High-acuity symptoms are intercepted by an upstream, deterministic red-flag safety ontology implemented in Python. "
        "Incoming user inputs are parsed using regex token matching and clinical keyword combinations before any vector search or LLM "
        "invocation occurs. If an acute red flag is recognized, the system halts execution within 15 milliseconds, returns a Tier 1 "
        "emergency response, and displays localized emergency telephone contacts (108 Ambulance, 112 National Emergency, 104 Health Helpline). "
        "Table 5.6 details the clinical red-flag ontology."
    )
    
    red_headers = ["Clinical Risk Category", "Key Symptom Indicators & Phrases", "Emergency Directive & Action"]
    red_data = [
        ["Acute Coronary Syndrome (ACS) / Myocardial Infarction", "'chest pain', 'chest pressure', 'left arm pain', 'jaw pain', 'crushing chest', 'sweating with chest tightness'", "Immediate 108 ambulance dispatch; keep patient calm, seated; do not drive oneself."],
        ["Cerebrovascular Accident (Stroke / TIA)", "'facial droop', 'arm weakness', 'slurred speech', 'sudden confusion', 'sudden vision loss', 'unilateral numbness'", "FAST protocol activation; immediate emergency transfer within therapeutic thrombolytic window."],
        ["Severe Respiratory Distress", "'cannot breathe', 'gasping for air', 'blue lips', 'severe breathlessness', 'stridor', 'choking'", "Upright positioning; immediate oxygenation/emergency transfer."],
        ["Anaphylaxis / Severe Allergic Reaction", "'swelling of throat', 'tongue swelling', 'difficulty swallowing with rash', 'inability to breathe after sting/drug'", "Administer epinephrine autoinjector if prescribed; immediate emergency transfer."],
        ["Acute Pediatric Red Flags", "'infant not feeding', 'lethargic infant', 'high fever with stiff neck', 'continuous convulsions', 'sunken fontanelle'", "Immediate transfer to nearest pediatric facility; maintain airway."]
    ]
    add_custom_table(doc, red_headers, red_data, "Deterministic Red-Flag Clinical Ontology and Emergency Interception Criteria", "5.6", col_widths=[3.5, 6.0, 6.0])

    # 5.9 AI Providers, Local Models, and Sarvam AI Integrations
    add_heading_2(doc, "5.9 AI Providers, Local Models, and Sarvam AI Integrations")
    add_body_p(
        doc,
        "MedGuide AI features a provider-agnostic AI Gateway (`app.services.ai_gateway`) that decouples application logic from specific LLM "
        "vendors. In runtime production configuration, the platform utilizes Groq's high-speed inference engine running `qwen/qwen3.8-27b`, "
        "achieving generation speeds exceeding 150 tokens/second. For zero-cost, privacy-preserving, or air-gapped on-premise deployments, "
        "the gateway provides native integration with Ollama running quantized `Llama 3.2:3B` or `Qwen3:4B` locally."
    )
    add_body_p(
        doc,
        "Generative prompts strictly bind the model to the retrieved medical passages using an evidence-enforcing system prompt: "
        "\"You are MedGuide AI, an assistive rural healthcare information companion. You must base your response ONLY on the provided "
        "verified medical excerpts. Do not diagnose diseases. Do not prescribe medicines. Always advise consulting a registered healthcare "
        "professional. If the provided excerpts do not contain the answer, explicitly state that verified guidelines are unavailable for this query.\""
    )

    # 5.10 Prescription OCR and Multilingual Speech Pipelines
    add_heading_2(doc, "5.10 Prescription OCR and Multilingual Speech Pipelines")
    add_body_p(
        doc,
        "The prescription digitization pipeline accepts prescription images via camera capture or gallery upload. Images undergo "
        "grayscale conversion, adaptive Gaussian thresholding, and noise removal using OpenCV before character recognition via Tesseract OCR. "
        "Extracted text is parsed using regular expressions and a curated pharmacology dictionary to identify generic medicine names, "
        "strengths (e.g., 500 mg, 10 ml), dosage frequencies (OD, BD, TDS), and timing relative to meals (AC, PC). "
        "Every extracted medicine entity is assigned a confidence score. If confidence is below 85% or handwriting is ambiguous, the system "
        "flags the item for mandatory human verification, displaying an interactive verification card where the user or ASHA worker "
        "must confirm or correct medicine names before any medication reminders can be scheduled."
    )
    add_body_p(
        doc,
        "The speech pipeline integrates Sarvam AI's Indic APIs for streaming speech-to-text (STT) and text-to-speech (TTS) supporting "
        "Hindi, Telugu, and Indian-accented English. Audio streaming operates over full-duplex WebSockets at `/api/v1/voice/session`, "
        "handling 16 kHz mono signed PCM16 audio frames. For offline local environments, the backend includes an adapter for Whisper.cpp "
        "v1.9.2 using the multilingual base model."
    )

    # 5.11 Authentication, Authorization, Permissions, and Consent
    add_heading_2(doc, "5.11 Authentication, Authorization, Permissions, and Consent")
    add_body_p(
        doc,
        "Security and data sovereignty are enforced through Role-Based Access Control (RBAC) and explicit granular consent. Passwords are "
        "hashed using Argon2 / bcrypt. User authentication produces signed, stateless JWT access tokens containing user UUID, role, and "
        "expiration timestamps. System roles include: PATIENT (access restricted strictly to owned records), HEALTHCARE_WORKER (access "
        "restricted to explicitly assigned village patients), and ADMIN (system maintenance and audit access). "
        "Furthermore, MedGuide AI implements granular consent tracking (`consents` table) with independent consent flags: "
        "`AI_PROCESSING` (allows non-emergent RAG processing), `SPEECH_PROCESSING` (authorizes voice transcription), `SPOKEN_GUIDANCE` "
        "(authorizes TTS audio playback), and `WORKER_ACCESS` (authorizes ASHA workers to review medical timelines). Users retain the "
        "statutory right to withdraw consent at any time via `/api/v1/consent/withdraw`."
    )

    # 5.12 Security, Privacy, Reliability, and Error Handling
    add_heading_2(doc, "5.12 Security, Privacy, Reliability, and Error Handling")
    add_body_p(
        doc,
        "In strict compliance with healthcare data protection standards, patient health queries and transcripts are filtered to prevent "
        "personally identifiable information (PII) leakage into server logs. All external API keys and secrets are loaded strictly from "
        "server-side environment variables (`.env`), completely hidden from client bundles. Cross-Origin Resource Sharing (CORS) is restricted "
        "to authorized frontend origins (`http://localhost:3000`). Uploaded prescription images are validated for MIME types (JPEG, PNG, WebP) "
        "and file size limits (maximum 10 MB). Comprehensive error handling returns sanitized, user-friendly error codes to clients while "
        "recording structured technical details in backend audit tables."
    )

    # 5.13 Complete End-to-End Workflows
    add_heading_2(doc, "5.13 Complete End-to-End Workflows")
    add_body_p(
        doc,
        "The operational harmony of MedGuide AI is governed by standardized clinical interaction workflows. Figure 6.2 illustrates "
        "the UML sequence diagram detailing both deterministic emergency interception and evidence-gated RAG generation."
    )
    
    # Insert Figure 6.2 (Sequence Diagram)
    fig_62 = img_dir_arch / "Figure_6_2_UML_Sequence_Diagram.png"
    add_figure(doc, fig_62, "UML Sequence Diagram of Deterministic Emergency Interception and Grounded RAG Flow", "6.2")

    # 5.14 Testing and Evaluation Methodology
    add_heading_2(doc, "5.14 Testing and Evaluation Methodology")
    add_body_p(
        doc,
        "Quality assurance is enforced through extensive automated test suites. The backend test suite contains **414 automated tests** "
        "built with `pytest` and `pytest-asyncio`, covering JWT security, role authorization, deterministic red-flag ontology interception, "
        "vector distance calculations, Pydantic schema validation, and prescription schedule constraints. All backend tests pass with "
        "zero failures in 110.68 seconds. The frontend contains **87 automated test cases** built with Vitest, covering form validation, "
        "component rendering, chat service state transitions, and production configuration rejection of mock modes (`npx tsc --noEmit` passed). "
        "Synthetic test accounts (prefixed `SYN-P001`) are used exclusively during automated evaluations to ensure zero real patient data exposure."
    )

    # 5.15 Offline Behavior and Synchronization
    add_heading_2(doc, "5.15 Offline Behavior and Synchronization")
    add_body_p(
        doc,
        "To operate effectively under limited rural connectivity, MedGuide AI defines clear boundaries between offline and online capabilities. "
        "The mobile app caches patient health timelines, active medication schedules, daily reminder alarms, and emergency first-aid protocols "
        "locally using AsyncStorage / SQLite. When network access is disrupted, patients can record medication adherence, view past prescriptions, "
        "and access offline first-aid guidance. Complex LLM inference, cloud RAG retrieval, and Sarvam AI streaming voice require active "
        "network connectivity. When connectivity is restored, local adherence check-ins and pending wellness logs are synchronized "
        "transactionally with the FastAPI backend via idempotency keys, preventing duplicate event creation."
    )

    # 5.16 Deployment, Maintenance, and Configuration
    add_heading_2(doc, "5.16 Deployment, Maintenance, and Configuration")
    add_body_p(
        doc,
        "MedGuide AI supports flexible deployment configurations. In active development and laboratory evaluation, backend services run "
        "as dedicated host processes (`uvicorn app.main:app --port 8000`) backed by a local PostgreSQL 18.4 instance with pgvector. "
        "For multi-container server deployment, the project defines a Docker Compose architecture orchestrating four isolated containers: "
        "(1) `medguide-frontend` (Next.js web client on port 3000); (2) `medguide-backend` (FastAPI service on port 8000); "
        "(3) `medguide-db` (PostgreSQL with pgvector on port 5432); and (4) `medguide-ollama` (Local model daemon on port 11434). "
        "Database migrations are managed declaratively using Alembic."
    )

print("Chapter 5 defined.")

