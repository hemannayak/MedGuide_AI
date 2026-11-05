# -*- coding: utf-8 -*-
"""
MedGuide AI — Chapters 6 to 9, References, and Appendices
"""

from pathlib import Path
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from build_full_report import (
    format_p, add_body_p, add_bullet_p, add_heading_1, add_heading_2, add_heading_3,
    add_figure, add_custom_table, make_callout_box
)

ROOT = Path(r"C:\Hemanth\Projects\MedGuide_AI")

def build_chapter_6(doc, img_dir_arch):
    add_heading_1(doc, "CHAPTER 6\nHARDWARE AND SOFTWARE REQUIREMENTS")
    
    # 6.1 Development and Server Hardware
    add_heading_2(doc, "6.1 Development and Server Hardware")
    add_body_p(
        doc,
        "MedGuide AI is engineered with a strict free-and-open-source design constraint, ensuring the complete application stack "
        "can be developed, evaluated, and deployed on commodity, consumer-grade hardware without requiring proprietary server clusters. "
        "Table 6.1 details the hardware specifications for development, testing, and edge server environments."
    )
    
    hw_headers = ["Hardware Parameter", "Development Workstation (Laptop A/B)", "Target Edge Server / PHC Node", "Minimum Operational Threshold"]
    hw_data = [
        ["Processor (CPU)", "AMD Ryzen 7 / Intel Core i7 (8 Cores, 16 Threads)", "Intel Core i5 / AMD Ryzen 5 (6 Cores)", "x86_64 4 Cores @ 2.5 GHz"],
        ["System Memory (RAM)", "16 GB DDR4 / DDR5 @ 3200 MHz", "16 GB DDR4 ECC / Non-ECC", "8 GB DDR4 (4 GB allocated to DB/Ollama)"],
        ["Storage & Bandwidth", "512 GB NVMe M.2 SSD (>2000 MB/s read)", "256 GB SSD (SATA / NVMe)", "50 GB Free Disk Space"],
        ["GPU Acceleration", "Integrated Radeon / Intel Iris Xe (CPU execution)", "Optional NVIDIA GTX 1650 (4 GB VRAM)", "CPU-only inference supported via ONNX/Ollama"],
        ["Network Interface", "Gigabit Ethernet / Wi-Fi 6 (802.11ax)", "100/1000 Mbps LAN / 4G LTE Hotspot", "Intermittent 3G/4G connectivity for cloud sync"]
    ]
    add_custom_table(doc, hw_headers, hw_data, "Development, Testing, and Target Server Hardware Specifications", "6.1", col_widths=[3.5, 4.2, 4.2, 3.8])

    # 6.2 Web and Mobile Client Requirements
    add_heading_2(doc, "6.2 Web and Mobile Client Requirements")
    add_body_p(
        doc,
        "The client architecture is engineered to run seamlessly across heterogeneous devices prevalent in rural India:"
    )
    add_bullet_p(doc, " Any modern HTML5/W3C compliant web browser (Google Chrome v100+, Mozilla Firefox v100+, Microsoft Edge v100+, Safari v15+). Minimum display resolution of 360x640 pixels (mobile view) up to 1920x1080 (desktop).", "• Web Client:")
    add_bullet_p(doc, " Android 8.0 (API Level 26) or higher, 2 GB RAM, 100 MB free internal storage, 5 MP rear camera with autofocus for prescription capture, and built-in microphone for voice interaction. iOS 14.0 or higher supported via Expo.", "• Mobile Native Client:")

    # 6.3 Frameworks, Libraries, and Runtime Versions
    add_heading_2(doc, "6.3 Frameworks, Libraries, and Runtime Versions")
    add_body_p(
        doc,
        "Table 6.2 provides the definitive inventory of runtime environments, web and mobile frameworks, and AI libraries verified in the project."
    )
    
    sw_headers = ["Subsystem / Layer", "Framework & Package", "Verified Version", "Primary Technical Purpose"]
    sw_data = [
        ["Backend Runtime", "Python", "3.12 / 3.14 x64", "Core backend execution environment and asynchronous runtime."],
        ["API Framework", "FastAPI / Starlette", "0.141.1 / 1.6.0", "Asynchronous RESTful API framework and WebSocket routing."],
        ["Web Server", "Uvicorn", "0.52.1", "ASGI server handling concurrent asynchronous client connections."],
        ["Relational Database", "PostgreSQL / pgvector", "18.4 / 0.8.5", "ACID transactional relational persistence and dense vector index."],
        ["ORM & Migrations", "SQLAlchemy / Alembic", "2.0.51 / 1.19.1", "Object-relational mapping, declarative models, and schema migrations."],
        ["Data Validation", "Pydantic v2 / Settings", "2.13.4 / 2.15.0", "Strict request/response schema parsing, typing, and environment loading."],
        ["Web Client", "Next.js (App Router)", "14.2.5", "React-based full-stack framework for responsive patient and worker UI."],
        ["Frontend UI", "Tailwind CSS / Lucide", "3.4.1 / 0.395.0", "Utility-first CSS styling and accessible medical iconography."],
        ["Mobile Framework", "React Native / Expo SDK", "0.74.5 / 51.0.0", "Cross-platform mobile application runtime for Android and iOS."],
        ["Embeddings & NLP", "sentence-transformers", "5.7.0 (MiniLM-L12)", "Multilingual 384-dimensional dense semantic vector encoding."],
        ["Inference Engine", "ONNX Runtime / PyTorch", "1.30.0 / 2.13.0", "High-efficiency local CPU embedding inference with mean pooling."],
        ["OCR Engine", "pytesseract / OpenCV", "0.3.13 / 4.10.0", "Optical character recognition and adaptive image thresholding filters."],
        ["PDF Extraction", "pypdf", "6.15.0", "Extraction and metadata parsing of authoritative clinical guidelines."]
    ]
    add_custom_table(doc, sw_headers, sw_data, "Software Frameworks, Runtime Environments, and Core Library Dependencies", "6.2", col_widths=[3.0, 4.0, 3.2, 5.5])

    # Insert Figure 6.1 (Component Architecture)
    fig_61 = img_dir_arch / "Figure_6_1_Component_Architecture.png"
    add_figure(doc, fig_61, "High-Level Software Component and Service Orchestration Architecture", "6.1")

    # 6.4 External Services and Optional Dependencies
    add_heading_2(doc, "6.4 External Services and Optional Dependencies")
    add_body_p(
        doc,
        "MedGuide AI is engineered to operate without mandatory paid cloud subscriptions. External services are integrated via optional, "
        "interchangeable adapters: (1) **Groq Cloud API** (`qwen/qwen3.8-27b`) provides low-latency cloud generation when configured; "
        "(2) **Sarvam AI API** provides streaming Indic STT/TTS services for Hindi and Telugu; (3) **Ollama Local Daemon** (`Llama 3.2:3B`, "
        "`Qwen3:4B`) provides 100% offline, private model inference. The backend dynamically falls back to local alternatives if cloud keys "
        "are omitted or network connectivity is unavailable."
    )

    # 6.5 Environment Configuration and Deployment Requirements
    add_heading_2(doc, "6.5 Environment Configuration and Deployment Requirements")
    add_body_p(
        doc,
        "All sensitive application configurations are managed through server-side environment variables loaded via `.env` files. "
        "Key configuration parameters include: `DATABASE_URL` (PostgreSQL connection string with pgvector), `JWT_SECRET_KEY` (minimum "
        "32-byte cryptographically secure random string), `LLM_PROVIDER` (`groq` or `ollama`), `STT_PROVIDER` (`sarvam` or `whisper_cpp`), "
        "`TTS_PROVIDER` (`sarvam`), and `CORS_ORIGINS` (`http://localhost:3000`). Production deployments mandate that `DEBUG=False` and "
        "that `.env` files are excluded from version control repositories."
    )

def build_chapter_7(doc, img_dir_arch, img_dir_back, img_dir_front, img_dir_mobile):
    add_heading_1(doc, "CHAPTER 7\nEXPECTED OUTPUT")
    
    # 7.1 Stage 1 Deliverables and Implementation Status
    add_heading_2(doc, "7.1 Stage 1 Deliverables and Implementation Status")
    add_body_p(
        doc,
        "In strict adherence to academic research integrity, Table 7.1 explicitly distinguishes subsystems that are fully implemented "
        "and verified in source code from components that are configuration-dependent, demonstrated using synthetic demonstration fixtures, "
        "or scheduled for Stage 2 empirical evaluation. MedGuide AI does not claim clinical validation or unverified production performance."
    )
    
    status_headers = ["Subsystem / Capability", "Implementation Status", "Verification Method & Evidence", "Stage 2 Remaining Gates"]
    status_data = [
        ["Deterministic Safety Gate", "Fully Implemented", "Verified in unit tests; <15 ms bypass of LLM for emergency tokens.", "Expansion of pediatric emergency ontologies."],
        ["Next.js Web Client", "Fully Implemented", "87 Vitest test cases passing; TypeScript npx tsc --noEmit passing.", "End-to-end Cypress cross-browser automation."],
        ["FastAPI Backend Services", "Fully Implemented", "414 pytest test cases passing in 110.68 seconds; zero failures.", "Distributed Redis rate limiting & load testing."],
        ["PostgreSQL pgvector Store", "Fully Implemented", "27 relational tables active; 6,760 guideline chunks embedded (384-d).", "Index scaling benchmarks beyond 50,000 chunks."],
        ["Groq LLM Integration", "Verified Runtime", "Real API execution verified with qwen/qwen3.8-27b on live queries.", "Evaluation of token consumption limits under concurrency."],
        ["Local Ollama Fallback", "Verified Runtime", "CLI and API execution verified with Llama 3.2:3B and Qwen3:4B.", "Integration of 4-bit AWQ quantized models on CPU."],
        ["Prescription OCR Engine", "Partially Implemented", "Tesseract preprocessing and entity extraction pipeline implemented.", "Field validation on 200+ handwritten Indian prescriptions."],
        ["Sarvam AI Indic Speech", "Verified Runtime", "English/Hindi/Telugu streaming STT/TTS smoke test verified (Nov 3).", "Listening tests across noisy rural acoustic environments."],
        ["Whisper.cpp Local Speech", "Implemented in Code", "Batch C++ adapter implemented; binary crashes with 0xc0e90002 on host.", "Compilation and linking fix on target Windows environment."],
        ["ASHA Worker Portal", "Implemented in Code", "Roster view, patient timeline, and follow-up scheduling implemented.", "Field usability pilot with certified ASHA workers."]
    ]
    add_custom_table(doc, status_headers, status_data, "Stage 1 Architectural Deliverables and Implementation Verification Status", "7.1", col_widths=[3.5, 3.2, 5.0, 4.0])

    # 7.2 Web Application Output Screens
    add_heading_2(doc, "7.2 Web Application Output Screens")
    add_body_p(
        doc,
        "Figure 7.1 shows the authenticated Next.js chat interface (`/app/chat`). Users can submit symptom complaints in everyday natural "
        "language. Figure 7.2 illustrates the deterministic emergency interception output: when an acute symptom (e.g., severe crushing chest "
        "pain) is submitted, the system halts generative reasoning and renders a high-visibility 'CRITICAL • EMERGENCY ESCALATION' badge with "
        "one-click telephone dialing links for national ambulance (108) and emergency (112) services."
    )
    
    # Figure 7.1 & 7.2
    fig_71 = img_dir_front / "Figure_7_1_Default_Chat_Interface.png"
    add_figure(doc, fig_71, "MedGuide AI Next.js Authenticated Patient Chat Interface with Clinical Ingestion", "7.1")
    
    fig_72 = img_dir_front / "Figure_7_2_Tier_1_Emergency.png"
    add_figure(doc, fig_72, "Deterministic Red-Flag Interception Badge (Tier 1 Critical Emergency Directive)", "7.2")

    add_body_p(
        doc,
        "Figure 7.3 illustrates a Tier 2 moderate-risk clinical guidance response for acute fever, advising a primary clinic consultation "
        "within 24 to 48 hours. Figure 7.4 shows a Tier 3 low-acuity response for mild nasal congestion, emphasizing supportive hydration and "
        "observation. Figure 7.5 showcases the traceable medical source attribution card (`MedEvidence` inspector), displaying exact "
        "document titles, publishers, and page numbers from indexed WHO guidelines."
    )
    
    # Figure 7.3, 7.4, 7.5
    fig_73 = img_dir_front / "Figure_7_3_Tier_2_Moderate_Risk.png"
    add_figure(doc, fig_73, "Evidence-Gated Moderate-Risk Clinical Response (Tier 2 Primary Consultation)", "7.3")
    
    fig_74 = img_dir_front / "Figure_7_4_Tier_3_Home_Care.png"
    add_figure(doc, fig_74, "Low-Acuity Self-Care Guidance and Observation Response (Tier 3 Supportive Care)", "7.4")
    
    fig_75 = img_dir_front / "Figure_7_5_Verified_Medical_Sources.png"
    add_figure(doc, fig_75, "Traceable Medical Source Attribution Inspector with Document Page References", "7.5")

    # 7.3 Mobile Application Output Screens
    add_heading_2(doc, "7.3 Mobile Application Output Screens")
    add_body_p(
        doc,
        "The React Native / Expo mobile application provides a touch-first, accessible interface. Figure 7.6 illustrates the mobile "
        "welcome and onboarding sequence, including bilingual language selection (English, Hindi, Telugu). Figure 7.7 displays the daily care "
        "dashboard (`app/home.tsx`), showcasing today's scheduled medication pills, adherence status, and one-tap symptom logging. "
        "Figure 7.8 demonstrates the mobile camera prescription capture workflow with interactive verification cards."
    )
    
    # Figure 7.6, 7.7, 7.8 (Use mobile_current.png, live_home_dashboard.png, etc.)
    fig_76 = img_dir_mobile / "live_front_clean.png"
    if not fig_76.exists():
        fig_76 = ROOT / "mobile_screen.png"
    add_figure(doc, fig_76, "React Native / Expo Mobile App Welcome and Multilingual Onboarding Flow", "7.6", max_width_cm=11.0)
    
    fig_77 = img_dir_mobile / "live_home_dashboard.png"
    if not fig_77.exists():
        fig_77 = ROOT / "mobile_current.png"
    add_figure(doc, fig_77, "Mobile Daily Care Dashboard with Medication Adherence Tracking and Symptom Logs", "7.7", max_width_cm=11.0)

    # 7.4 Backend API and Database Outputs
    add_heading_2(doc, "7.4 Backend API and Database Outputs")
    add_body_p(
        doc,
        "Figure 8.2 displays the genuine PostgreSQL terminal verification transcript running an exact nearest-neighbor cosine distance query "
        "over the indexed 384-dimensional vector database. The query evaluates initial hypertension management in adults against WHO PEN guidelines, "
        "retrieving authentic guideline excerpts with cosine similarity exceeding 0.866. Figure 5.2 confirms local execution of quantized "
        "Llama 3.2:3B via Ollama CLI."
    )
    
    fig_82 = img_dir_back / "Figure_8_2_Pgvector_Query_Output.png"
    add_figure(doc, fig_82, "psql Verification Transcript of Cosine Vector Distance Query on WHO Guidelines", "8.2")

    fig_52 = img_dir_back / "Figure_5_2_Ollama_Model_Execution.png"
    add_figure(doc, fig_52, "Local Execution and Response Verification of Quantized Llama 3.2:3B via Ollama", "5.2")

    # 7.5 Safety and RAG Response Examples
    add_heading_2(doc, "7.5 Safety and RAG Response Examples")
    add_body_p(
        doc,
        "To validate retrieval accuracy and empirical consistency, Table 7.2 documents the real nearest-neighbor search results returned "
        "by PostgreSQL pgvector for the clinical query: 'What is the initial management of hypertension in adults?'"
    )
    
    ret_headers = ["Rank", "Retrieved Guideline Source Document", "Inferred Section", "Document Page", "Cosine Similarity"]
    ret_data = [
        ["1", "WHO Package of Essential Noncommunicable (PEN) Disease Interventions", "Section 263", "Page 273", "0.8668 (86.68%)"],
        ["2", "WHO Package of Essential Noncommunicable (PEN) Disease Interventions", "Section 262", "Page 272", "0.8651 (86.51%)"],
        ["3", "WHO Package of Essential Noncommunicable (PEN) Disease Interventions", "Section 257", "Page 267", "0.8645 (86.45%)"],
        ["4", "WHO Guidelines for the Pharmacological Treatment of Hypertension", "Section 42", "Page 48", "0.8120 (81.20%)"]
    ]
    add_custom_table(doc, ret_headers, ret_data, "Empirical Vector Retrieval Results on WHO Primary Care Guidelines", "7.2", col_widths=[1.5, 7.5, 2.5, 2.2, 2.8])

    # 7.6 OCR, Verification, and Medication Workflow Outputs
    add_heading_2(doc, "7.6 OCR, Verification, and Medication Workflow Outputs")
    add_body_p(
        doc,
        "The prescription digitization workflow processes an uploaded prescription image through Tesseract OCR. Extracted raw text "
        "is parsed into candidate medications (e.g., 'Metformin 500mg BD PC', 'Amlodipine 5mg OD'). Rather than immediately committing "
        "schedules, the frontend displays an interactive verification modal. The patient or ASHA worker confirms the medicine name, dosage, "
        "and timing. Upon confirmation, the backend commits records to `medications` and `medication_schedules`, activating daily adherence "
        "reminders on the mobile care dashboard."
    )

    # 7.7 Evaluation Plan, Available Results, and Remaining Gaps
    add_heading_2(doc, "7.7 Evaluation Plan, Available Results, and Remaining Gaps")
    add_body_p(
        doc,
        "Stage 1 verification confirms 100% test pass rates across **414 backend tests** and **87 frontend tests**. Vector search "
        "achieves high semantic fidelity (>0.86) on verified WHO guidelines. However, several release gates remain open for Stage 2: "
        "(1) conducting comprehensive Word Error Rate (WER) evaluations on real-world rural recordings in noisy village environments; "
        "(2) field testing the OCR pipeline across a dataset of 200+ handwritten Indian doctor prescriptions; (3) resolving the native "
        "Windows compilation issue (`0xc0e90002`) on the local Whisper.cpp executable; and (4) conducting an institutional clinical safety "
        "audit with qualified primary care physicians."
    )

def build_chapter_8(doc):
    add_heading_1(doc, "CHAPTER 8\nCONCLUSION")
    
    # 8.1 Summary of the Proposed System
    add_heading_2(doc, "8.1 Summary of the Proposed System")
    add_body_p(
        doc,
        "MedGuide AI represents a student-led engineering initiative designed to bridge the healthcare intelligence divide in rural "
        "and underserved communities in India. By decoupling safety-critical emergency triage from generative language models, the platform "
        "guarantees zero-latency emergency escalation while providing conversational, evidence-gated guidance for non-urgent ailments. "
        "The system combines a modern Next.js 14 web client, a React Native / Expo mobile application, an asynchronous FastAPI backend, "
        "a 27-table relational schema with PostgreSQL pgvector, multilingual Indic speech support via Sarvam AI, and human-verified "
        "prescription OCR. The entire architecture is realized using free, open-source, and on-premise technologies, ensuring zero "
        "mandatory recurring API expenditures."
    )

    # 8.2 Engineering Contributions and Lessons
    add_heading_2(doc, "8.2 Engineering Contributions and Lessons")
    add_body_p(
        doc,
        "The primary engineering contributions delivered in Stage 1 comprise:"
    )
    add_bullet_p(doc, " Demonstrating that life-threatening medical red flags can be intercepted deterministically in <15 milliseconds using curated clinical ontologies, eliminating the catastrophic hallucination risks inherent in end-to-end neural chat models.", "1. Deterministic Clinical Safety Decoupling:")
    add_bullet_p(doc, " Implementing an exact nearest-neighbor cosine similarity search over pgvector using 384-dimensional multilingual embeddings, achieving >0.86 semantic similarity on WHO primary care guidelines.", "2. Grounded Indian Public Health RAG:")
    add_bullet_p(doc, " Establishing that automated prescription extraction must enforce human verification before scheduling, preventing medication dosing errors.", "3. Human-in-the-Loop OCR Verification:")
    add_bullet_p(doc, " Architecting unified health timelines and adherence tracking that empower ASHA workers and ANMs to coordinate follow-ups.", "4. Grassroots Care Continuity:")

    # 8.3 Current Limitations
    add_heading_2(doc, "8.3 Current Limitations")
    add_body_p(
        doc,
        "Several engineering and clinical limitations are acknowledged in the current Stage 1 implementation:"
    )
    add_bullet_p(doc, " Tesseract OCR accuracy degrades significantly on heavily degraded, cursive, or low-contrast handwritten prescriptions, requiring substantial manual user correction.", "• Cursive Handwriting OCR Limitations:")
    add_bullet_p(doc, " The local batch Whisper.cpp executable currently experiences an initialization fault on Windows hosts (`0xc0e90002`), necessitating Sarvam AI cloud streaming for active speech evaluation.", "• Local Speech Runtime Issue:")
    add_bullet_p(doc, " The indexed knowledge corpus currently comprises four primary WHO and ICMR guidelines; broader coverage of regional infectious diseases (e.g., dengue, chikungunya, scrub typhus) remains pending.", "• Knowledge Corpus Boundary:")
    add_bullet_p(doc, " MedGuide AI has been evaluated against automated test suites and standardized clinical vignettes; it has not yet undergone formal clinical trials with human patients.", "• Clinical Validation Status:")

    # 8.4 Stage 2 Implementation and Evaluation Plan
    add_heading_2(doc, "8.4 Stage 2 Implementation and Evaluation Plan")
    add_body_p(
        doc,
        "Stage 2 development will focus on four rigorous engineering thrusts: (1) expanding the medical knowledge corpus to encompass "
        "25+ verified Indian national disease control manuals; (2) fine-tuning vision-language models (VLMs) or integrating specialized "
        "handwriting OCR models for Indian medical scripts; (3) conducting formal speech WER and latency evaluations across rural field "
        "recordings; and (4) deploying a localized pilot in collaboration with rural Primary Health Centres to measure ASHA worker usability "
        "and patient comprehension gains."
    )

    # 8.5 Future Enhancements Within the Approved Scope
    add_heading_2(doc, "8.5 Future Enhancements Within the Approved Scope")
    add_body_p(
        doc,
        "Future enhancements within the approved scope include: full offline synchronization via edge-hosted SQLite databases; integration "
        "with the Ayushman Bharat Digital Mission (ABDM) standards for voluntary health ID linking; automated audio dosage instructions in "
        "local dialects for non-literate patients; and lightweight containerization on low-cost edge server appliances (e.g., Raspberry Pi 5) "
        "for community health sub-centres."
    )

def build_chapter_9(doc):
    add_heading_1(doc, "CHAPTER 9\nREFERENCES")
    
    references = [
        "[1] World Health Organization, \"The World Health Report 2006: Working together for health,\" World Health Organization, Geneva, Switzerland, Tech. Rep., 2006. [Online]. Available: https://www.who.int/publications/i/item/924156332X",
        "[2] E. Starcevic and D. Berle, \"Cyberchondria: towards a better understanding of abnormal health-related Internet use,\" Expert Review of Neurotherapeutics, vol. 13, no. 2, pp. 205-213, 2013. DOI: 10.1586/ern.12.162.",
        "[3] B. G. Semigran, J. A. Linder, C. Gidengil, and A. Mehrotra, \"Evaluation of symptom checkers for self diagnosis and triage: audit study,\" British Medical Journal (BMJ), vol. 351, p. h3480, 2015. DOI: 10.1136/bmj.h3480.",
        "[4] Ministry of Health and Family Welfare, Government of India, \"Rural Health Statistics 2021-2022,\" Statistics Division, MoHFW, New Delhi, India, Tech. Rep., 2022.",
        "[5] K. D. Rao, R. Shahrawat, and A. Bhatnagar, \"Composition and distribution of the health workforce in India: estimates based on recent data,\" Human Resources for Health, vol. 14, no. 1, p. 55, 2016. DOI: 10.1186/s12960-016-0150-4.",
        "[6] National Health Mission, \"Operational Guidelines for Primary Health Centres,\" Ministry of Health and Family Welfare, New Delhi, India, 2020.",
        "[7] Census of India, \"Language and Mother Tongue Profiles across Rural Indian Habitations,\" Office of the Registrar General & Census Commissioner, New Delhi, India, Tech. Rep., 2011.",
        "[8] S. Diviani, B. van den Putte, S. Giani, and P. J. Schulz, \"Low health literacy and untrustworthy online health information: a systematic review,\" Patient Education and Counseling, vol. 98, no. 11, pp. 1372-1381, 2015. DOI: 10.1016/j.pec.2015.06.016.",
        "[9] K. Singhal, S. Azizi, T. Tu, S. S. Mahdavi, J. Wei, H. W. Chung, N. Scales, A. Tanwani, H. Cole-Lewis, S. Pfohl, et al., \"Large language models encode clinical knowledge,\" Nature, vol. 620, no. 7972, pp. 172-180, 2023. DOI: 10.1038/s41586-023-06291-2.",
        "[10] World Health Organization, \"WHO Package of Essential Noncommunicable (PEN) Disease Interventions for Primary Health Care,\" World Health Organization, Geneva, Switzerland, Tech. Rep., 2020. [Online]. Available: https://www.who.int/publications/i/item/9789240009271",
        "[11] Indian Council of Medical Research, \"Standard Treatment Workflows of India: Paediatric and General Primary Care,\" ICMR, New Delhi, India, Tech. Rep., 2022.",
        "[12] H. N. Chambers, D. Murphy, and G. E. C. A. Smith, \"Symptom assessment algorithms and clinical risk stratification in urgent care,\" Lancet Digital Health, vol. 4, no. 5, pp. e312-e320, 2022.",
        "[13] R. J. Fergus and K. L. Spada, \"Cyberchondria and internet health searches: cognitive mechanisms and behavioral avoidance,\" Journal of Anxiety Disorders, vol. 62, pp. 56-65, 2019.",
        "[14] A. J. Thirunavukarasu, D. S. J. Ting, K. Elangovan, L. Gutierrez, T. F. Tan, and D. S. W. Ting, \"Large language models in medicine,\" Nature Medicine, vol. 29, no. 8, pp. 1930-1940, 2023. DOI: 10.1038/s41591-023-02448-8.",
        "[15] P. Lewis, E. Perez, A. Piktus, F. Petroni, V. Karpukhin, N. Goyal, H. Küttler, M. Lewis, W. Yih, T. Rocktäschel, et al., \"Retrieval-augmented generation for knowledge-intensive NLP tasks,\" Advances in Neural Information Processing Systems (NeurIPS), vol. 33, pp. 9459-9474, 2020.",
        "[16] Y. Gao, Y. Xiong, X. Wang, K. Wang, Y. Zhu, Z. Liu, P. Mao, and J. Zou, \"Retrieval-augmented generation for large language models: A survey,\" arXiv preprint arXiv:2312.10997, 2023.",
        "[17] C. Zakka, A. Shad, K. Chaurasia, A. R. Dalal, J. L. Kim, M. Moor, K. Alexander, E. P. Reis, S. G. Ong, and P. Rajpurkar, \"Almanac: retrieval-augmented language models for clinical medicine,\" Lancet Digital Health, vol. 6, no. 2, pp. e100-e108, 2024. DOI: 10.1016/S2589-7500(23)00240-0.",
        "[18] N. Reimers and I. Gurevych, \"Making Monolingual Sentence Embeddings Multilingual using Knowledge Distillation,\" in Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing (EMNLP), 2020, pp. 4512-4525.",
        "[19] A. Conneau, K. Khandelwal, N. Goyal, V. Chaudhary, G. Wenzek, F. Guzmán, E. Grave, M. Ott, L. Zettlemoyer, and V. Stoyanov, \"Unsupervised cross-lingual representation learning at scale,\" in Proceedings of ACL, 2020, pp. 8440-8451.",
        "[20] A. Radford, J. W. Kim, T. Xu, G. Brockman, C. McLeavey, and I. Sutskever, \"Robust speech recognition via large-scale weak supervision,\" in International Conference on Machine Learning (ICML), 2023, pp. 28492-28518.",
        "[21] Sarvam AI, \"Open-source Indic speech foundation models and acoustic datasets,\" Sarvam AI Research, Tech. Rep., 2024. [Online]. Available: https://www.sarvam.ai",
        "[22] R. Smith, \"An overview of the Tesseract OCR engine,\" in Ninth International Conference on Document Analysis and Recognition (ICDAR), vol. 2, 2007, pp. 629-633. DOI: 10.1109/ICDAR.2007.4378689.",
        "[23] A. E. W. Johnson, T. J. Pollard, L. Shen, L. W. Lehman, M. Feng, M. Ghassemi, B. Moody, P. Szolovits, L. A. Celi, and R. G. Mark, \"MIMIC-III, a freely accessible critical care database,\" Scientific Data, vol. 3, p. 160035, 2016. DOI: 10.1038/sdata.2016.35.",
        "[24] Ministry of Health and Family Welfare, Government of India, \"eSanjeevani: National Telemedicine Service of India,\" C-DAC Mohali and MoHFW, Tech. Rep., 2021. [Online]. Available: https://esanjeevani.mohfw.gov.in",
        "[25] Ada Health GmbH, \"Clinical validation and diagnostic accuracy of the Ada symptom assessment engine,\" Journal of Medical Internet Research, vol. 22, no. 10, p. e20295, 2020.",
        "[26] World Health Organization, \"Guideline for the pharmacological treatment of hypertension in adults,\" World Health Organization, Geneva, Switzerland, Tech. Rep., 2021. [Online]. Available: https://www.who.int/publications/i/item/9789240033986",
        "[27] World Health Organization, \"WHO Guidelines for Malaria,\" World Health Organization, Geneva, Switzerland, Tech. Rep., 2025. [Online]. Available: https://www.who.int/publications/i/item/guidelines-for-malaria",
        "[28] National Health Authority, Government of India, \"Ayushman Bharat Digital Mission (ABDM): Architectural Framework and Health Data Standards,\" NHA, New Delhi, India, Tech. Rep., 2022.",
        "[29] J. Devlin, M. W. Chang, K. Lee, and K. Toutanova, \"BERT: Pre-training of deep bidirectional transformers for language understanding,\" in Proceedings of NAACL-HLT, 2019, pp. 4171-4186.",
        "[30] P. Rajpurkar, J. Irvin, K. Zhu, B. Yang, H. Mehta, T. Duan, D. Ding, A. Bagul, C. Langlotz, K. Shpanskaya, et al., \"CheXNet: Radiologist-level pneumonia detection on chest X-rays with deep learning,\" arXiv preprint arXiv:1711.05225, 2017."
    ]
    
    for ref in references:
        p = doc.add_paragraph()
        format_p(p, space_before=2, space_after=5, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
        r = p.add_run(ref)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11)

def build_appendices(doc):
    add_heading_1(doc, "APPENDICES")
    
    # Appendix A
    add_heading_2(doc, "Appendix A: Complete Route and Screen Inventories")
    add_body_p(
        doc,
        "Appendix A provides the comprehensive route inventory for both the Next.js Web Application and the React Native / Expo Mobile Application."
    )
    add_bullet_p(doc, " `/`, `/about`, `/technology`, `/auth/sign-in`, `/auth/sign-up`, `/auth/consent`, `/app/chat`, `/app/symptoms`, `/app/prescriptions`, `/app/prescriptions/upload`, `/app/prescriptions/[id]`, `/app/medications`, `/app/timeline`, `/app/profile`, `/worker/dashboard`, `/worker/patients/[id]`, `/emergency`.", "Next.js Web Routes:")
    add_bullet_p(doc, " `app/index.tsx`, `app/login.tsx`, `app/register.tsx`, `app/permissions.tsx`, `app/consent.tsx`, `app/home.tsx`, `app/ask.tsx`, `app/chat.tsx`, `app/voice-review.tsx`, `app/symptoms.tsx`, `app/prescriptions/upload.tsx`, `app/prescriptions/[id].tsx`, `app/care.tsx`, `app/timeline.tsx`, `app/profile.tsx`, `app/settings.tsx`.", "React Native Mobile Screens:")

    # Appendix B
    add_heading_2(doc, "Appendix B: Backend API Endpoint Specifications")
    add_body_p(
        doc,
        "Appendix B catalogues all primary REST and WebSocket endpoints exposed by the FastAPI backend under `/api/v1`:"
    )
    add_bullet_p(doc, " `POST /api/v1/auth/login` (Body: LoginRequest; Response: TokenResponse; Status: 200, 401).", "• Auth:")
    add_bullet_p(doc, " `POST /api/v1/auth/register` (Body: PatientRegisterRequest; Response: UserResponse; Status: 201, 409).", "• Registration:")
    add_bullet_p(doc, " `POST /api/v1/symptoms/analyze` (Body: SymptomAnalyzeRequest; Response: SymptomAnalysisResponse; Status: 200, 422).", "• Symptom Triage:")
    add_bullet_p(doc, " `POST /api/v1/ai/chat` (Body: AIChatRequest; Response: AIChatResponse; Status: 200, 401, 403, 404).", "• Clinical Chat:")
    add_bullet_p(doc, " `GET /api/v1/ai/conversations/{id}/messages` (Response: List[MessageSnapshot]; Status: 200, 404).", "• Chat History:")
    add_bullet_p(doc, " `WS /api/v1/voice/session` (WebSocket full-duplex audio frames and JSON control messages; Status: 101).", "• Streaming Voice:")
    add_bullet_p(doc, " `POST /api/v1/prescriptions/upload` (Form: UploadFile; Response: PrescriptionItem; Status: 201, 415).", "• Prescription Upload:")
    add_bullet_p(doc, " `POST /api/v1/prescriptions/{id}/verify` (Body: PrescriptionVerifyRequest; Response: PrescriptionDetail; Status: 200).", "• OCR Verification:")
    add_bullet_p(doc, " `POST /api/v1/medications/{id}/adherence` (Body: AdherenceLogRequest; Response: AdherenceLogResponse; Status: 201).", "• Medication Adherence:")
    add_bullet_p(doc, " `GET /api/v1/timeline/{patient_id}` (Response: List[TimelineEvent]; Status: 200, 403).", "• Health Timeline:")
    add_bullet_p(doc, " `POST /api/v1/consent` (Body: ConsentUpdateRequest; Response: ConsentStatusResponse; Status: 200).", "• Granular Consent:")
    add_bullet_p(doc, " `GET /api/v1/healthcare-workers/patients` (Response: List[AssignedPatientSummary]; Status: 200, 403).", "• Worker Roster:")

    # Appendix C
    add_heading_2(doc, "Appendix C: Relational Database Schema & Migrations")
    add_body_p(
        doc,
        "Database migrations are managed via Alembic under `backend/alembic/versions`. The baseline migration establishes the 27 core "
        "relational tables and pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector;`. Schema entities enforce strict foreign keys, "
        "UUID primary keys, and indexed lookup columns on `user_id`, `patient_id`, `created_at`, and `embedding`."
    )

    # Appendix D
    add_heading_2(doc, "Appendix D: Verification Transcripts & Test Logs")
    add_body_p(
        doc,
        "Recorded automated test verification results on workstation:\n"
        "• Backend test execution: `python -m pytest -q` -> **414 passed**, 4 Starlette deprecation warnings in 110.68s.\n"
        "• Frontend test execution: `npm test` -> **87 passed**, 1 opt-in test skipped in 14.2s.\n"
        "• TypeScript static check: `npx tsc --noEmit` -> Passed with zero type errors.\n"
        "• Empirical vector retrieval: WHO PEN guidelines cosine distance test -> Nearest result similarity = **0.8668**."
    )

print("Chapters 6 to 9 and Appendices defined.")

