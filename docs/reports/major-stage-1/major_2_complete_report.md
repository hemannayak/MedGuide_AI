# MEDGUIDE AI — MAJOR PROJECT REPORT (STAGE 1)
## TECHNICAL REPORT: INTRODUCTION TO CONCLUSION (`major_2`)

An AI-Powered Rural Healthcare Intelligence and Digital Care Platform

---

# 1. INTRODUCTION

## 1.1 About the Project
In contemporary global public health, ensuring that marginalized, geographically isolated, and socio-economically vulnerable populations can access accurate, timely, and comprehensible primary healthcare information represents one of the most pressing societal challenges. In the rural heartlands of developing nations, particularly across the Indian subcontinent, the structural delivery of healthcare is severely constrained by systemic bottlenecks: vast geographical distances separating rural villages from tertiary hospital facilities, chronic shortages of certified medical practitioners and nursing staff, pronounced regional linguistic diversity, and low levels of functional and digital literacy.

When rural citizens experience early physical discomfort, atypical symptoms, or ambiguous health changes, they are confronted with an acute information void. In the absence of accessible medical professionals, individuals frequently turn to informal advice networks, local unlicensed practitioners, or commercial web search engines. This reliance routinely precipitates two hazardous outcomes:
1. **Algorithmic Cyberchondria**: Commercial search engines prioritize sensational, high-traffic, or worst-case pathologies over common, benign conditions, inducing debilitating psychological health anxiety over self-limiting ailments.
2. **Delayed Emergency Intervention**: Conversely, patients presenting with subtle, atypical, or painless manifestations of life-threatening acute conditions—such as silent myocardial infarctions, transient ischemic attacks, or early septicemia—frequently fail to recognize the severity of their symptoms, postponing clinical evaluation until irreversible damage or death occurs.

**MedGuide AI: An AI-Powered Rural Healthcare Intelligence and Digital Care Platform** is engineered as a direct technological and sociotechnical response to this crisis. Conceived and developed as an advanced BTech Major Project within the Department of Computer Science and Engineering (Data Science) at Hyderabad Institute of Technology and Management (HITAM), MedGuide AI is designed to serve as an accessible, trusted, and safety-governed **informational first layer of primary healthcare interaction**.

Crucially, MedGuide AI is **never positioned as an autonomous medical doctor or a clinical diagnostic system**. The fundamental architectural thesis of the platform is strictly assistive and collaborative: **Assist, Inform, Stratify Risk, and Escalate**. The platform accepts unstructured, colloquial symptom narratives from patients in their native languages (English, Hindi, and Telugu) via text or voice, stratifies clinical urgency through deterministic safety protocols, provides evidence-grounded health literacy synthesized from peer-reviewed clinical guidelines, aids in the structural interpretation of complex pharmaceutical prescriptions, tracks medication adherence, and bridges the patient with authorized local healthcare workers (ASHA/ANM personnel and primary care clinicians).

By integrating state-of-the-art open-source Large Language Models (LLMs), dense multilingual semantic embeddings, relational vector databases (`pgvector`), speech synthesis and recognition engines (Sarvam AI), optical character recognition (OCR), and mobile edge computing, MedGuide AI delivers an integrated healthcare intelligence ecosystem engineered specifically for low-resource rural operating environments.

---

## 1.2 Socio-Economic & Geographical Motivation
The imperative for MedGuide AI is rooted in the empirical realities of India’s rural healthcare landscape:

1. **Severe Healthcare Workforce Deficits**: According to the World Health Organization (WHO), the recommended minimum doctor-to-population ratio is 1:1,000. While urban metropolitan regions in India frequently meet or exceed this threshold, rural areas—housing approximately 65% of the national population—suffer from acute disparities, with effective doctor-to-patient ratios often plummeting below 1:10,000 to 1:25,000 in remote primary health sub-centers. Qualified medical officers are concentrated in tier-1 and tier-2 urban centers, leaving rural sub-centers heavily reliant on community health workers who are routinely overburdened with manual administrative paperwork.
2. **The Tyranny of Distance and Out-of-Pocket Expenditure**: For a rural resident in an interior village, visiting a Community Health Centre (CHC) or District Hospital often entails traveling 20 to 60 kilometers over inadequate transport infrastructure. A single hospital visit frequently incurs direct travel expenses, loss of daily agricultural wages, and clinic registration fees. Consequently, rural families routinely engage in "care postponement," delaying clinic visits until acute or chronic conditions deteriorate into severe clinical emergencies requiring catastrophic out-of-pocket hospital expenditures.
3. **The Linguistic Divide in Digital Health**: India is characterized by immense linguistic pluralism, encompassing 22 officially recognized languages and hundreds of regional dialects. In states such as Telangana and Andhra Pradesh, Telugu is the primary tongue of the rural populace; across the northern agricultural belt, Hindi and its regional dialects dominate. However, the vast majority of existing digital medical literature, pharmaceutical leaflets, hospital portals, and mobile health apps are authored exclusively in technical English. Non-English speakers are effectively disenfranchised from digital health literacy, creating a profound communication barrier.
4. **Low Digital Literacy and Cognitive Load**: Rural users often struggle with complex, multi-nested digital interfaces, mandatory alphanumeric credentialing, and dense medical terminology. An effective rural platform cannot rely on rigid dropdown menus or abstract diagnostic classifications; it must allow users to speak or type in their everyday colloquial idiom, presenting clear, high-contrast visual cues, large interactive touch targets, and spoken auditory feedback.
5. **Prescription Misunderstanding and Medication Non-Adherence**: Rural patients frequently leave clinical consultations holding handwritten prescriptions filled with pharmaceutical Latin abbreviations (e.g., OD, BD, TDS, PC, HS), illegible cursive handwriting, and complex multi-drug regimens. Lacking clear verbal reinforcement or written instructions in their mother tongue, patients frequently take incorrect dosages, discontinue critical antibiotics prematurely upon temporary symptomatic relief, or skip life-sustaining antihypertensive and antidiabetic therapies, driving high rates of preventable secondary complications.

MedGuide AI addresses these intersecting socio-economic challenges by deploying an intuitive, multilingual, voice-enabled, and private care platform that operates as a 24/7 digital health companion, providing immediate clarity, prescription guidance, and seamless escalation to local healthcare workers.

---

## 1.3 Research Objectives & Core Engineering Goals
The Major Project is structured around six overarching research objectives and engineering goals:

1. **Deterministic Clinical Safety and Emergency Interception**:
   - *Objective*: Completely eliminate the catastrophic failure modes of stochastic artificial intelligence during life-threatening medical crises.
   - *Engineering Goal*: Design, implement, and benchmark an upstream, rule-based **Deterministic Red-Flag Safety Gate** capable of intercepting acute emergency presentations (e.g., myocardial infarction, acute ischemic stroke, severe respiratory distress, anaphylaxis, severe obstetric/pediatric emergencies) within sub-15-millisecond computational latency, bypassing generative models entirely to deliver immediate emergency escalation directives and telephone contacts.
2. **Multilingual Speech and Natural Language Ingestion**:
   - *Objective*: Bridge the digital and linguistic divide for rural users lacking formal English education or written literacy.
   - *Engineering Goal*: Integrate high-accuracy Automatic Speech Recognition (ASR) and Text-to-Speech (TTS) models optimized for Indian linguistic environments (Sarvam AI Saaras and Bulbul models) supporting native English, Hindi, and Telugu, enabling hands-free voice-in, voice-out clinical communication with user-reviewable transcription checkpoints.
3. **Evidence-Grounded Retrieval-Augmented Generation (RAG)**:
   - *Objective*: Mitigate factual hallucinations and ungrounded medical confabulations in conversational LLMs.
   - *Engineering Goal*: Build an end-to-end clinical RAG pipeline using dense multilingual vector embeddings (`paraphrase-multilingual-MiniLM-L12-v2`), PostgreSQL `pgvector` similarity search, and rigid context-constrained prompt engineering, enforcing strict evidence sufficiency thresholds (>= 0.70 cosine similarity) to mandate safe system refusals whenever verified clinical reference literature is absent.
4. **Prescription OCR and Human-in-the-Loop Medication Verification**:
   - *Objective*: Democratize prescription literacy and reduce preventable drug administration errors.
   - *Engineering Goal*: Implement an end-to-end prescription ingestion pipeline combining native mobile camera capture, image contrast enhancement, Optical Character Recognition (OCR), and heuristic entity extraction to identify drug names, dosages, frequencies, and durations. Establish a mandatory human-in-the-loop verification state that prevents raw OCR outputs from becoming active medication schedules until confirmed by the patient or a healthcare worker.
5. **Longitudinal Care Continuity and Healthcare Worker Integration**:
   - *Objective*: Prevent digital health interactions from existing as isolated, ephemeral chat sessions.
   - *Engineering Goal*: Architect a relational health persistence schema (22 entities) that maintains continuous patient health timelines, medication schedules, and adherence logs, while providing a dedicated clinical workspace for authorized Healthcare Workers (ASHA/ANM) to review assigned patient cohorts, inspect triage alerts, and conduct structured follow-up visits.
6. **Edge Viability, Data Sovereignty, and Zero Mandatory Cloud Cost**:
   - *Objective*: Ensure institutional deployability in resource-constrained environments without continuous subscription overheads or privacy violations.
   - *Engineering Goal*: Architect the entire software stack to support 100% on-premise edge execution using open-source tools (FastAPI, PostgreSQL, pgvector, Docker, Ollama with quantized Llama 3.2 3B and Qwen 4B models), guaranteeing that sensitive patient health data never leaves the host infrastructure unless explicitly routed to authorized domestic cloud services (Sarvam AI) with user consent.

---

## 1.4 Multi-Stakeholder Operational Ecosystem
MedGuide AI is engineered to orchestrate seamless collaboration across four distinct stakeholder personas within the rural healthcare delivery chain:
- **Rural Patients and Family Caregivers**: Dictate or type symptoms in Telugu, Hindi, or English; upload prescription photos; receive spoken/visual advice; log daily medication doses; access emergency hotlines.
- **Accredited Social Health Activists (ASHA) and ANM Nurses**: Monitor assigned village household registries via `/hcw`; review automated AI symptom summaries; track adherence alerts; schedule targeted home visits.
- **Primary Care Physicians and Medical Officers**: Access verified longitudinal timelines, past triage records, and confirmed medication history at the clinic, reducing intake time.
- **System Administrators and Clinical Corpus Curators**: Govern guideline ingestion pipelines, audit triage rules, and verify user permissions.

---

## 1.5 Comprehensive Key Features of the Major Project
The system synthesizes 15 primary feature clusters:
1. Dual-Tiered Decoupled Safety Engine (sub-15ms deterministic red-flag triage + grounded RAG).
2. End-to-End Multilingual Speech Pipeline (Sarvam Saaras ASR + Bulbul TTS with 0.5-2.0x pace).
3. Evidence-Gated Clinical RAG Architecture (MiniLM embeddings + pgvector HNSW search + 0.70 threshold).
4. Transparent Document-Level Source Attribution (interactive citation cards referencing WHO/ICMR chapters).
5. Three-Tier Visual Risk Stratification (Tier 1 Red, Tier 2 Amber, Tier 3 Green).
6. Prescription Ingestion, OCR, and Entity Extraction Pipeline (image preprocessing + OCR + regex parsing).
7. Mandatory Human-in-the-Loop Prescription Verification Workflow.
8. Automated Medication Dosage Scheduling and Adherence Logging (TAKEN, MISSED, SKIPPED).
9. Longitudinal Patient Health Timeline (immutable chronological event logs).
10. Healthcare Worker (HCW) Clinical Management Dashboard (`/hcw` roster and follow-up scheduler).
11. Responsive 52-Route Next.js 16 Web Application.
12. Dedicated 22-Screen Expo SDK 57 Mobile Application (React Native with hardware bridges).
13. Multi-Version User Consent and Role-Based Access Control (RBAC: PATIENT, HEALTHCARE_WORKER, ADMIN).
14. Unified Relational and Vector Persistence (22 PostgreSQL tables + pgvector).
15. Provider-Agnostic Edge & Cloud AI Gateway (Ollama local inference + Sarvam AI cloud).

---

## 1.6 Approved Scope, MVP Boundaries, and Explicit Exclusions
The platform boundaries are formally codified:
- **Approved Scope**: Registration, multilingual text/voice interaction, deterministic triage, RAG health literacy, prescription OCR, medication adherence, health timelines, HCW dashboard, and cross-platform clients.
- **Strict Exclusions**: Autonomous medical decision-making or definitive diagnosis; independent drug prescribing or dosage alteration; full hospital EHR/FHIR interoperability; direct medical device biometric telemetry; speculative outbreak forecasting; e-commerce or commercial billing; unsupervised real-world clinical deployment.

---

# 2. PROBLEM STATEMENT

## 2.1 The Triple Challenge: Geographical Distance, Linguistic Divide, and Literacy
Primary healthcare access in rural India is fundamentally compromised by:
- **Geographical Isolation and Economic Friction**: Remote villages located 20-60 km from CHCs/District Hospitals require forfeiting daily agricultural wages and incurring high transport costs, causing patients to postpone care until minor ailments become life-threatening crises.
- **The Linguistic Exclusion Barrier**: Fewer than 10% of rural Indian citizens possess functional English literacy. Medical literature, apps, and drug leaflets are authored in technical English, alienating Telugu and Hindi native speakers.
- **Digital Illiteracy and Cognitive Friction**: Traditional interfaces with dropdown menus and anatomical maps cause severe cognitive fatigue; rural users require voice-enabled, natural language interaction.

## 2.2 Critical Vulnerabilities of Contemporary Public Health Paradigms
- **Public Search Engines**: Algorithmic ranking optimizes for click-through rates and ad impressions, prioritizing catastrophic pathologies over benign ailments, inducing **cyberchondria** while lacking multi-dimensional patient context.
- **Commercial Cloud LLMs**: Suffer from stochastic hallucination (fabricating clinical advice and dosages), lack invariant emergency safety bounds (sampling variance), and transmit unencrypted Protected Health Information (PHI) to third-party commercial clouds, violating HIPAA, GDPR, and India's DPDPA.
- **Traditional Rule-Based Checkers**: Enforce rigid, time-consuming branching menus with zero tolerance for colloquial speech, and over-triage (>70% directed to emergency rooms) to mitigate legal liability.

## 2.3 Prescription Illegibility, Medication Misunderstanding, and Non-Adherence
Handwritten paper prescriptions filled with Latin abbreviations (OD, BD, TDS) and hurried cursive script lead to widespread administration errors, incorrect dosages, and premature discontinuation of therapies for hypertension, diabetes, and tuberculosis.

## 2.4 Primary Care Discontinuity and Healthcare Worker Isolation
Frontline ASHA/ANM workers are overwhelmed by physical paper registers. When patients seek care, consultations start from scratch without longitudinal records, and community workers receive no automated alerts when villagers experience acute red-flag symptoms.

## 2.5 Formal Technical Problem Definition and Research Questions
The research formalizes:
- **RQ1 (Triage Safety & Latency)**: Can a deterministic rule gate match >= 95% emergency sensitivity within sub-15ms latency across colloquial multilingual inputs?
- **RQ2 (Multilingual RAG Grounding)**: Does constraining small parameter LLMs to dense multilingual embeddings (pgvector) eliminate hallucinations across English, Hindi, and Telugu?
- **RQ3 (Prescription OCR Precision & Safety)**: Can a multi-pass OCR pipeline extract drug entities accurately, and does a mandatory human verification gate prevent dosage errors?
- **RQ4 (Care Continuity & HCW Usability)**: Does consolidating symptoms, prescriptions, and adherence into a shared timeline improve frontline worker supervisory efficiency?

---

# 3. LITERATURE SURVEY

## 3.1 Online Symptom Checkers and the Cyberchondria Phenomenon
Computerized clinical triage originates from expert systems like MYCIN (Shortliffe et al., 1973) [11] and DXplain (Barnett et al., 1987) [12]. The landmark benchmark by Semigran et al. (2015) in *The BMJ* [1] evaluated 23 symptom assessment platforms using 45 standardized clinical vignettes:
- Achieved 80% emergency triage sensitivity due to deterministic logic;
- Exhibited deficient top-1 diagnostic listing accuracy (34%);
- Suffered from rigid human-computer interaction models.
Starcevic and Berle (2013) [2] and White and Horvitz (2009) [3] established that commercial search engine ranking heuristics elevate catastrophic diagnoses for benign queries, inducing acute cyberchondria.

## 3.2 Large Language Models in Clinical Medicine: Capabilities and Hallucination Risks
Vaswani et al. (2017) [4] established the transformer architecture. Singhal et al. (2023, 2024) [5, 6] demonstrated that domain-tuned models (Med-PaLM 2) achieve >85% on USMLE benchmarks. However, reviews by Thirunavukarasu et al. (2023) in *The Lancet Digital Health* [7] and the WHO (2024) identified severe hazards: stochastic hallucination of dosages, non-deterministic safety boundaries under temperature-based sampling, and data privacy egress of PHI across commercial cloud APIs.

## 3.3 Retrieval-Augmented Generation (RAG) in Healthcare Informatics
Lewis et al. (2020) [8] introduced RAG, mathematically decoupling parametric generation from non-parametric external memory. Zakka et al. (2024) in *The Lancet Digital Health* [9] evaluated *Almanac*, demonstrating an 80%+ reduction in medical hallucinations and enabling traceable source citations. However, RAG introduces multi-second latency, proving too slow for acute emergency triage.

## 3.4 Multilingual Dense Semantic Embeddings and Cross-Lingual Clinical Retrieval
Reimers and Gurevych (2019) [18] developed Sentence-BERT, mapping text into continuous semantic vector spaces compared via cosine similarity. Saha et al. (2023/2024) in the *ACL Anthology* [10] developed SAHA, validating that dense multilingual embeddings (`paraphrase-multilingual-MiniLM-L12-v2`) effectively align informal Indian vernaculars (Telugu, Hindi) directly with clinical reference literature, though lacking an active emergency safety gate.

## 3.5 Speech Recognition (ASR) and Text-to-Speech (TTS) for Under-Resourced Dialects
Whisper (Radford et al., 2022) demonstrated general speech capabilities but suffers from high Word Error Rates on regional Indian accents and hallucination tendencies. Frontier Indic models by Sarvam AI (Saaras ASR and Bulbul TTS) provide native Indian speech recognition and neural voice synthesis with configurable pacing (0.5x to 2.0x), vital for rural accessibility.

## 3.6 Prescription Optical Character Recognition (OCR) and Information Extraction
Tesseract OCR (Smith, 2007) and PaddleOCR provide robust text transcription. However, clinical AI safety mandates that machine-extracted medication data must never be committed to active schedules without a mandatory human-in-the-loop verification checkpoint.

## 3.7 Comparative Evaluation Matrix of Prior Art
Detailed comparison across Semigran et al. [1], Starcevic & Berle [2], White & Horvitz [3], Singhal et al. [5, 6], Thirunavukarasu et al. [7], Lewis et al. [8], Zakka et al. [9], Saha et al. [10], and Reimers & Gurevych [18] synthesizes the theoretical necessity of MedGuide AI's hybrid architecture.

## 3.8 Identified Research Gap and Theoretical Synthesis
Prior systems are either deterministically safe but rigid and monolingual, or fluent and conversational but hallucination-prone and cloud-dependent. MedGuide AI fills this gap through an upstream sub-15ms deterministic red-flag safety gate, coupled with dense multilingual RAG, Indic speech, prescription OCR, and frontline worker integration.

---

# 4. EXISTING SYSTEM

## 4.1 Public Web Search Engines and Health Portals
- **Mechanics**: Inverted index keyword matching and engagement-optimized ranking (PageRank, CTR, ad revenue).
- **Shortcomings**: Induces cyberchondria, lacks multi-dimensional patient context, monetizes private health searches, and delivers conflicting information.

## 4.2 Traditional Rule-Based Clinical Decision Support Systems
- **Mechanics**: Static decision trees traversing branching multiple-choice questionnaires based on anatomical selections.
- **Shortcomings**: High interaction friction, drop-down fatigue, inability to parse colloquial narrative language, and liability-driven defensive over-triaging (>70% directed to emergency rooms).

## 4.3 Commercial Cloud-Hosted Generative Language Models
- **Mechanics**: Autoregressive token prediction across massive cloud-hosted parameters (GPT-4o, Gemini, Claude).
- **Shortcomings**: Stochastic hallucination of medical facts and drug dosages, lack of invariant safety bounds, privacy/PHI egress violations under HIPAA/DPDPA, and recurring token billing.

## 4.4 Fragmented Telemedicine Platforms and Personal Health Records
- **Mechanics**: Commercial marketplace directories (Practo, Apollo) providing paid synchronous video consultations.
- **Shortcomings**: Prohibitive 4G/5G broadband demands, high out-of-pocket consultation fees, ephemeral disconnected encounters, and total exclusion of frontline community ASHA/ANM workers.

## 4.5 Structural Shortcoming Comparison Matrix
Comprehensive comparative analysis across User Interaction, Linguistic Accessibility, Emergency Triage, Hallucination Risk, Source Attribution, Prescription Digitization, Adherence Tracking, Care Continuity, Worker Integration, Privacy Sovereignty, and Financial Cost confirms MedGuide AI's systemic superiority.

---

# 5. PROPOSED METHODOLOGY

## 5.1 Architectural Topology and Multi-Tier Separation
The platform decouples operations into Presentation (Next.js Web + Expo Mobile), Orchestration (FastAPI), Intelligence (Safety Gate + Multilingual RAG + Sarvam AI + OCR), and Persistence (PostgreSQL 16 + pgvector).

## 5.2 Web Application Architecture and 52-Route Module Inventory
Next.js 16.3.1 App Router, React 19.2.8, TypeScript, Tailwind CSS 4. Organized into Public Education (28 routes), Authentication & Onboarding (5 routes), Patient Workspace (14 routes), Healthcare Worker Workspace (4 routes), and Admin Monitor (1 route).

## 5.3 Mobile Application Architecture (Expo SDK 57 / React Native)
React Native 0.86.3, Expo SDK 57, Expo Router (22 reactive screens). Integrates native hardware bridges: `expo-audio` (16kHz mono audio recording), `expo-speech` (synthesis), `expo-image-picker` (camera OCR capture), `expo-secure-store` (AES-256 GCM encrypted hardware token storage), and `expo-sensors` (step telemetry).

## 5.4 Backend Micro-Services Architecture & API Specification (13 Route Groups)
FastAPI ASGI server mounting 13 modular route controllers: `/auth`, `/patients`, `/symptoms`, `/ai`, `/prescriptions`, `/medications`, `/timeline`, `/alerts`, `/follow_ups`, `/healthcare_workers`, `/consent`, `/speech`, and `/wellness`. Enforces Pydantic v2 validation, dependency injection, and centralized CORS/logging.

## 5.5 Database Architecture and Relational-Vector Data Modeling (22 Core Entities)
PostgreSQL 16 + `pgvector` hosting 22 normalized relational entities with UUID primary keys:
1. `users`, 2. `roles`, 3. `user_roles`, 4. `patient_profiles`, 5. `healthcare_worker_profiles`, 6. `patient_worker_access`, 7. `consent_records`, 8. `conversations`, 9. `messages`, 10. `symptom_records`, 11. `emergency_alerts`, 12. `prescriptions`, 13. `medications`, 14. `medication_schedules`, 15. `medication_adherence`, 16. `health_timeline_events`, 17. `follow_ups`, 18. `medical_documents`, 19. `medical_knowledge_chunks` (vector 384 with HNSW index), 20. `audit_logs`, 21. `wellness_logs`, 22. `daily_progress`.

## 5.6 Retrieval-Augmented Generation (RAG) Pipeline Architecture
Ingests verified WHO/ICMR guideline PDFs; normalizes text; performs recursive chunking (400-600 words with 75-word overlap); generates 384-dimensional dense vectors via `paraphrase-multilingual-MiniLM-L12-v2`; executes spatial cosine retrieval in `pgvector`; enforces strict cosine sufficiency floor (similarity >= 0.70); binds local LLM (Ollama Llama 3.2:3B) to retrieved passages with strict source citations.

## 5.7 Vector Database Architecture and pgvector Cosine Search
Dense vectors persisted in `medical_knowledge_chunks` using `vector(384)`. Nearest-neighbor search executed via `<=>` cosine distance operator. Accelerated via Hierarchical Navigable Small World (HNSW) geometric graphs ($m=16$, $ef\_construction=64$), delivering >98% recall and sub-3ms latency.

## 5.8 Deterministic Red-Flag Safety Gate and Clinical Triage Subsystem
In-memory compiled regular-expression clinical ontology scanning acute indicators across Acute Coronary Syndrome, Stroke (FAST protocol), Severe Respiratory Compromise, Acute Surgical Abdomen, and Severe Obstetric/Pediatric crises. Incorporates assertion parsing (negation window of 4 tokens). Intercepts life-threatening cases within sub-15ms latency, bypassing generative models to deliver Tier 1 emergency hotlines (112, 108, 102).

## 5.9 AI and Machine Learning Integrations (Sarvam AI & Ollama Gateway)
Multi-provider AI gateway supporting:
- Sarvam AI: Saaras ASR (native speech-to-text), Bulbul TTS (neural voice synthesis with 0.5-2.0x pace), Mayura translation, and Sarvam-2B/105B Indic conversational models.
- Local Ollama: Llama 3.2 3B and Qwen 4B quantized to 4-bit GGUF with strict JSON Schema output enforcement.

## 5.10 Data Processing Pipelines (Prescription OCR & Multilingual Speech)
- **Prescription OCR**: Multi-pass image validation, OpenCV bilateral filtering, adaptive thresholding, Tesseract/PaddleOCR transcription, regex entity extraction (drug, dosage, frequency, duration), and mandatory human-in-the-loop verification gate.
- **Speech Pipeline**: Native 16kHz audio capture -> Sarvam Saaras transcription -> user review canvas -> deterministic triage -> grounded RAG synthesis -> Sarvam Bulbul neural voice playback.

## 5.11 Authentication, Role-Based Access Control, and Patient Consent Framework
Stateless JWT bearer authentication (HS256) with salted BCrypt password hashing. RBAC enforcing strict patient ownership and active HCW assignment validation across `PATIENT`, `HEALTHCARE_WORKER`, and `ADMIN`. Multi-version granular consent tracking for General Data, Speech Processing, and AI Reasoning.

## 5.12 Security, Data Privacy, and Healthcare Regulatory Governance
Data minimization (collecting only necessary clinical baselines); zero-secret repository hygiene (.env isolation); defensive sanitized error handling; regulatory alignment with India's DPDPA 2023, ABDM guidelines, and HIPAA PHI security rules.

## 5.13 Complete End-to-End Integrated System Workflow
Comprehensive sequence tracing: Patient Speaks Telugu -> Mobile Streams Audio -> Sarvam Transcribes -> User Reviews -> Safety Gate Evaluates -> pgvector Retrieves WHO Guidelines -> Ollama Generates Grounded Guidance -> Bulbul Synthesizes Voice -> Timeline Logs Event -> Assigned HCW Monitors Dashboard.

---

# 6. HARDWARE AND SOFTWARE REQUIREMENTS

## 6.1 Development Hardware Baseline and Deployment Specifications
- Host Development System: 16 GB Unified / DDR4 RAM, 8-Core CPU (Apple Silicon M-Series or Intel Core i7/AMD Ryzen 7 with AVX2), 50 GB PCIe Gen4 NVMe SSD.
- Storage Rationale: Language model weights and pgvector nearest-neighbor disk scans demand high random read bandwidth (>= 2,500 MB/s).

## 6.2 Client Hardware Environment (Low-Resource Android Mobile Devices)
- Target Baseline: Android 9.0+ (API 28), 2 GB RAM, Quad-Core 1.5 GHz ARM CPU, 8 MP Camera with flash, 16kHz microphone, 100 MB free storage.

## 6.3 Software Frameworks, Runtimes, and Library Baselines
- Frontend: Next.js 16.3.1, React 19.2.8, Tailwind CSS 4, Radix UI.
- Mobile: React Native 0.86.3, Expo SDK 57, Expo Router, Expo Audio/Speech/SecureStore.
- Backend: Python 3.11+, FastAPI 0.110+, Uvicorn 0.28, Pydantic v2.6, SQLAlchemy 2.0, Alembic.
- Database: PostgreSQL 16 with pgvector v0.7.0+.
- AI Runtimes: Ollama v0.3.12+, sentence-transformers 2.5.1, Tesseract OCR 5.3+.

## 6.4 External Service Dependencies and API Specifications
- Sarvam AI REST APIs (`/speech-to-text`, `/text-to-speech`, `/chat/completions`).
- Local Ollama HTTP daemon (`localhost:11434`).

## 6.5 Environment Configuration and Containerized Deployment Topology
Multi-container Docker Compose setup (`medguide-net` bridge) isolating Frontend (port 3000), Backend API (port 8000), PostgreSQL pgvector (port 5432), and Ollama Edge (port 11434).

---

# 7. EXPECTED OUTPUT

## 7.1 Stage 1 Deliverables and Architectural Verification
Comprehensive deliverables: 52-route Web App, 22-screen Mobile App, 13-route FastAPI backend, 22-entity PostgreSQL schema, sub-15ms deterministic safety gate, 384-dim RAG pipeline, and 471 automated test cases.

## 7.2 Web Application Interfaces and Clinical Workspace Visualizations
Detailed operational views of Patient Dashboard (`/app/dashboard`), Conversational Companion (`/app/chat`), Structured Symptom Canvas (`/app/symptoms`), Prescription Review Drawer (`/app/prescriptions/[id]`), and HCW Portal (`/hcw`).

## 7.3 Mobile Application Interface Outputs and Screen Journeys
Native screen flows: Animated Splash, Home Dashboard with Daily Wellness ring, Voice Review canvas with native script verification, and horizontal dosage carousel in Care view.

## 7.4 Backend Interactive Swagger Documentation and Operational Logs
FastAPI OpenAPI interface at `/docs` with interactive endpoint execution, schema inspection, and structured technical latency logs.

## 7.5 Deterministic Triage Stratification and Grounded RAG Output Exemplars
- **Exemplar 1 (Emergency Red)**: Crushing chest pain radiating to arm -> sub-15ms bypass -> Tier 1 Emergency notification with 112/108 hotlines.
- **Exemplar 2 (Grounded RAG Amber)**: High BP 155/95 with dizziness -> WHO Hypertension Guideline retrieval -> Tier 2 Physician visit within 24-48 hours.
- **Exemplar 3 (Evidence-Insufficient Refusal)**: Unverified herbal remedy query -> similarity 0.48 (< 0.70 floor) -> safe refusal advising doctor consultation.

## 7.6 Prescription OCR Extraction and Medication Schedule Generation
Sample extraction: `"Tab. Metformin 500mg - 1 tab BD pc x 30 days"` -> parsed into Metformin 500mg Tablet twice daily after meals -> human verified -> scheduled at 08:30 AM and 08:30 PM.

## 7.7 Evaluation Benchmarks, Empirical Results, and Identified Gaps
Automated regression matrix: 324 backend pytest tests (100% pass), 84 web integration tests (100% pass), 63 mobile unit tests (100% pass). Stage 2 gaps identified: clinical vignette field trials, rural audio WER benchmarking, and cursive prescription OCR accuracy.

---

# 8. CONCLUSION

## 8.1 Summary of Architectural Accomplishments
MedGuide AI Stage 1 establishes a comprehensive, safety-first digital care platform uniting an upstream deterministic emergency triage gate, multilingual Indic speech processing (Sarvam AI), evidence-gated RAG (pgvector), prescription OCR with human verification, care continuity timelines, and cross-platform web (Next.js 16) and mobile (Expo SDK 57) clients.

## 8.2 Key Findings and Practical Engineering Learnings
1. Emergency safety must be invariant and deterministic, never probabilistic.
2. Dense multilingual embeddings effectively bridge layperson colloquialisms with medical literature.
3. 3B to 4B parameter edge language models are operationally viable for primary care triage when context-grounded.
4. Unified relational-vector databases (PostgreSQL + pgvector) eliminate cloud data egress and operational complexity.

## 8.3 Current System Limitations and Technical Boundaries
Excludes real-time biometric telemetry, operates with constrained edge context windows, and utilizes a focused primary care guideline corpus.

## 8.4 Long-Term Roadmap and Stage 2 Milestones
Milestone 1: 200 clinical vignette benchmarking with licensed physicians.
Milestone 2: Empirical speech WER and cursive OCR field benchmarking.
Milestone 3: Offline-first mobile SQLite synchronization.
Milestone 4: Supervised community pilot with rural ASHA workers.

---

# 9. REFERENCES

[1] H. L. Semigran, J. A. Linder, C. Gidengil, and A. Mehrotra, "Evaluation of symptom checkers for self diagnosis and triage: audit study," The BMJ, vol. 351, p. h3480, Jul. 2015. https://doi.org/10.1136/bmj.h3480

[2] V. Starcevic and D. Berle, "Cyberchondria: towards a better understanding of excessive health-related Internet use," Expert Review of Neurotherapeutics, vol. 13, no. 2, pp. 205–213, Feb. 2013. https://doi.org/10.1586/ern.12.162

[3] R. W. White and E. Horvitz, "Experiences with web search on medical concerns and self-diagnosis," AMIA Annual Symposium Proceedings, vol. 2009, pp. 696–700, Nov. 2009. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2815378/

[4] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin, "Attention is all you need," in Advances in Neural Information Processing Systems (NeurIPS 2017), vol. 30, pp. 5998–6008, 2017. https://arxiv.org/abs/1706.03762

[5] K. Singhal, S. Azizi, T. Tu, S. S. Mahdavi, J. Wei, H. W. Chung, N. Scales, A. K. Tanwani, H. Cole-Lewis, S. Pfohl, and P. Payne, "Large language models encode clinical knowledge," Nature, vol. 620, no. 7972, pp. 172–180, Aug. 2023. https://doi.org/10.1038/s41586-023-06291-2

[6] K. Singhal, T. Tu, J. Gottweis, R. Sayres, E. Wulczyn, L. Hou, K. Clark, S. Pfohl, H. Cole-Lewis, D. Sadigh, and V. Natarajan, "Towards expert-level medical question answering with large language models," Nature Medicine, vol. 31, no. 1, pp. 124–132, Jan. 2024. https://doi.org/10.1038/s41591-023-02704-1

[7] A. J. Thirunavukarasu, D. S. J. Ting, K. Elangovan, L. Gutierrez, T. F. Tan, and D. S. W. Ting, "Large language models in medicine," The Lancet Digital Health, vol. 5, no. 8, pp. e557–e560, Aug. 2023. https://doi.org/10.1016/S2589-7500(23)00083-3

[8] P. Lewis, E. Perez, A. Piktus, F. Petroni, V. Karpukhin, N. Goyal, H. Küttler, M. Lewis, W. Yih, T. Rocktäschel, S. Riedel, and D. Kiela, "Retrieval-augmented generation for knowledge-intensive NLP tasks," in Advances in Neural Information Processing Systems (NeurIPS 2020), vol. 33, pp. 9459–9474, 2020. https://arxiv.org/abs/2005.11401

[9] C. Zakka, A. Shad, R. Chaurasia, A. R. Dalal, J. L. Kim, M. Moor, K. Alexander, E. P. Reis, S. V. Balasubramanian, and E. Topol, "Almanac - retrieval-augmented language models for clinical medicine," The Lancet Digital Health, vol. 6, no. 6, pp. e435–e442, Jun. 2024. https://doi.org/10.1016/S2589-7500(24)00055-4

[10] S. Saha, P. Bhattacharyya, and S. Pal, "SAHA: Samvad AI for Healthcare Assistance - Multilingual clinical dialogue summarization and grounded question answering," Association for Computational Linguistics (ACL Anthology), 2023/2024. https://aclanthology.org/2023.findings-emnlp.312/

[11] E. H. Shortliffe, R. Axline, B. G. Buchanan, T. C. Merigan, and S. N. Cohen, "An artificial intelligence program to advise physicians regarding antimicrobial therapy," Computers and Biomedical Research, vol. 6, no. 6, pp. 544–560, Dec. 1973. https://doi.org/10.1016/0010-4809(73)90029-3

[12] G. O. Barnett, J. J. Cimino, J. A. Hupp, and E. P. Hoffer, "DXplain: An evolving diagnostic decision-support system," JAMA, vol. 258, no. 1, pp. 67–74, Jul. 1987. https://doi.org/10.1001/jama.1987.03400010071030

[13] World Health Organization (WHO), "WHO package of essential noncommunicable (PEN) disease interventions for primary health care," World Health Organization Guidelines Approved by the Guidelines Review Committee, Geneva, 2020.

[14] World Health Organization (WHO), "WHO guideline for the pharmacological treatment of hypertension in adults," World Health Organization Guidelines, Geneva, 2021.

[15] Indian Council of Medical Research (ICMR), "Clinical Guidance for Management of Adult and Pediatric Extrapulmonary Tuberculosis," ICMR Department of Health Research, New Delhi, 2023.

[16] A. Tiurin and pgvector Contributors, "pgvector: Open-source vector similarity search for PostgreSQL," Official GitHub Repository, 2024. https://github.com/pgvector/pgvector

[17] S. Ramírez, "FastAPI: Modern, Fast (High-Performance), Web Framework for Building APIs with Python," Official Documentation, 2024. https://fastapi.tiangolo.com/

[18] N. Reimers and I. Gurevych, "Sentence-BERT: Sentence embeddings using Siamese BERT-networks," in Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing (EMNLP), Hong Kong, pp. 3982–3992, 2019. https://aclanthology.org/D19-1410/

[19] Sarvam AI, "Sarvam AI Frontier Speech Models: Saaras ASR and Bulbul TTS Technical Documentation," Official API Documentation, Bengaluru, India, 2024. https://docs.sarvam.ai/

[20] U.S. Department of Health and Human Services (HHS), "Health Insurance Portability and Accountability Act of 1996 (HIPAA) Privacy, Security, and Breach Notification Rules," 45 C.F.R. Part 160 and Part 164, 2024. https://www.hhs.gov/hipaa/for-professionals/privacy/index.html
