# -*- coding: utf-8 -*-
"""
MedGuide AI — Chapters 1 to 4 Technical Content
"""

from pathlib import Path
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from build_full_report import (
    format_p, add_body_p, add_bullet_p, add_heading_1, add_heading_2, add_heading_3,
    add_figure, add_custom_table, make_callout_box
)

ROOT = Path(r"C:\Hemanth\Projects\MedGuide_AI")

def build_chapter_1(doc, img_dir_arch):
    add_heading_1(doc, "CHAPTER 1\nINTRODUCTION")
    
    # 1.1 About the Project
    add_heading_2(doc, "1.1 About the Project")
    add_body_p(
        doc,
        "In modern healthcare delivery, providing the general public with accurate, timely, and accessible clinical "
        "guidance remains an enduring systemic challenge, particularly across developing economies. In India, where over "
        "65% of the population resides in rural and semi-urban habitations, primary healthcare access is severely constrained "
        "by structural deficits in clinical infrastructure, geographical remoteness, and acute shortages of qualified medical "
        "professionals [1]. When experiencing early physical discomfort or ambiguous health symptoms, individuals overwhelmingly "
        "resort to commercial search engines or informal community networks. This behavior frequently precipitates a documented "
        "behavioral disorder termed cyberchondria, wherein anxiety is intensified by search algorithms that commercially prioritize "
        "catastrophic or rare diagnoses over common, self-limiting ailments [2]."
    )
    add_body_p(
        doc,
        "Conversely, patients presenting with subtle or atypical manifestations of acute, life-threatening conditions—such as "
        "silent myocardial infarctions, transient ischemic attacks, acute respiratory distress, or pediatric septicemia—frequently "
        "fail to recognize the gravity of their symptoms, leading to catastrophic delays in seeking emergency intervention [3]. "
        "Simultaneously, primary health centres (PHCs) and community health centres (CHCs) experience chronic operational congestion, "
        "where up to 40% of outpatient consultations consist of low-acuity, self-limiting presentations that could be safely managed "
        "through basic health literacy, supportive home care, and structured non-emergency follow-ups [4]."
    )
    add_body_p(
        doc,
        "MedGuide AI is engineered as an AI-powered rural healthcare intelligence and digital care companion. It provides an "
        "accessible first layer of digital healthcare support for rural and underserved communities in India. The system synthesizes "
        "a web application, a dedicated cross-platform React Native / Expo mobile application, an asynchronous FastAPI backend, "
        "a 27-table relational PostgreSQL schema, dense vector retrieval using pgvector, multilingual speech recognition, and Optical "
        "Character Recognition (OCR) for prescription parsing. Critically, MedGuide AI is engineered with rigorous healthcare safety "
        "boundaries: it operates as a clinical decision-support and information platform, strictly disclaiming autonomous medical "
        "diagnosis, prescription writing, or replacing licensed medical practitioners."
    )
    
    make_callout_box(
        doc,
        "MedGuide AI is designed to support patients and authorized healthcare workers through multilingual communication, "
        "preliminary symptom triage, prescription understanding, medication support, and continuity of care. The platform "
        "MUST NEVER be positioned, marketed, or operated as an autonomous doctor, a definitive diagnostic tool, or a replacement "
        "for qualified healthcare professionals.",
        title="PRIMARY CLINICAL MANDATE"
    )

    # 1.2 Socio-Economic and Geographical Motivation
    add_heading_2(doc, "1.2 Socio-Economic and Geographical Motivation")
    add_body_p(
        doc,
        "The motivation for MedGuide AI stems directly from the acute disparities characterizing India's rural health landscape. "
        "According to the Rural Health Statistics published by the Ministry of Health and Family Welfare (MoHFW), the doctor-to-population "
        "ratio in rural India remains significantly lower than the World Health Organization (WHO) recommended threshold of 1:1,000, "
        "often exceeding 1:10,000 in remote tribal and agrarian districts [5]. Over 70% of India's healthcare infrastructure and human "
        "resources are concentrated in Tier-1 and Tier-2 urban metropolitan centers, leaving over 800 million citizens dependent on an "
        "overburdened network of Sub-Centres (SCs), Primary Health Centres (PHCs), and Community Health Centres (CHCs) [6]."
    )
    add_body_p(
        doc,
        "Geographical remoteness imposes severe financial and physical friction on rural households. In remote villages, seeking a basic "
        "clinical consultation often requires traveling 15 to 40 kilometers over unpaved roads, incurring substantial out-of-pocket "
        "transportation expenses and the loss of daily agricultural wages. In many instances, rural citizens postpone seeking medical "
        "attention until an illness progresses to a critical stage, drastically worsening clinical prognoses and multiplying acute inpatient "
        "expenditures. Furthermore, linguistic diversity presents a major barrier: while clinical literature and prescription instructions "
        "are predominantly printed in English, rural populations predominantly communicate in regional languages such as Hindi, Telugu, "
        "and local dialects, with limited English literacy [7]."
    )

    # 1.3 Research Objectives and Core Engineering Goals
    add_heading_2(doc, "1.3 Research Objectives and Core Engineering Goals")
    add_body_p(
        doc,
        "MedGuide AI addresses these challenges through five foundational engineering and research objectives:"
    )
    add_bullet_p(doc, " To build a hard-coded, zero-latency clinical red-flag interception ontology that immediately detects life-threatening emergency symptoms (acute chest pain, stroke signs, severe dyspnea, anaphylaxis) within 15 milliseconds, bypassing probabilistic language generation entirely to issue unambiguous emergency directives and hotlines (108/112).", "1. Deterministic Emergency Triage:")
    add_bullet_p(doc, " To implement an evidence-gated RAG pipeline using multilingual dense embeddings (paraphrase-multilingual-MiniLM-L12-v2, 384 dimensions) and pgvector cosine similarity search, binding generative language models strictly to authoritative Indian public health guidelines (WHO PEN, ICMR Standard Treatment Workflows, and National Health Mission protocols).", "2. Evidence-Gated Multilingual RAG:")
    add_bullet_p(doc, " To develop a human-in-the-loop Optical Character Recognition (OCR) pipeline utilizing Tesseract and image pre-processing to extract medicine names, dosages, and frequencies, enforcing patient or healthcare worker verification before medication schedules can be created.", "3. Human-Verified Prescription Understanding:")
    add_bullet_p(doc, " To integrate streaming speech-to-text (STT) and text-to-speech (TTS) interfaces supporting Hindi, Telugu, and Indian-accented English, bridging digital-literacy barriers through conversational voice interaction.", "4. Multilingual Speech Accessibility:")
    add_bullet_p(doc, " To implement role-based digital care workflows enabling Accredited Social Health Activists (ASHAs) and Auxiliary Nurse Midwives (ANMs) to review patient longitudinal health timelines, adherence logs, and symptom histories.", "5. Healthcare-Worker Continuity of Care:")

    # 1.4 Stakeholders and Operational Context
    add_heading_2(doc, "1.4 Stakeholders and Operational Context")
    add_body_p(
        doc,
        "The operational lifecycle of MedGuide AI engages four distinct stakeholder categories across the rural care continuum:"
    )
    add_bullet_p(doc, " Rural citizens and semi-urban households seeking rapid, understandable, and free health guidance in their native language (English, Hindi, Telugu). Patients can describe symptoms via text or voice, upload prescriptions for dosage clarification, and maintain a personal health timeline.", "• Patients and Family Caregivers:")
    add_bullet_p(doc, " Grassroots community healthcare facilitators who act as the primary health interface in rural villages. MedGuide AI provides ASHAs with structured patient summaries, medication adherence tracking, and follow-up reminders during home visits.", "• Community Healthcare Workers (ASHAs / ANMs):")
    add_bullet_p(doc, " Medical officers at PHCs and CHCs who receive patients referred through the platform. Clinicians benefit from structured, chronological symptom logs and verified medication histories, reducing intake assessment time.", "• Primary Care Physicians:")
    add_bullet_p(doc, " Technical personnel responsible for maintaining medical guideline ingestion, database migrations, audit logging, model configuration, and role-based access control.", "• System Administrators:")

    # 1.5 Features and Functional Modules
    add_heading_2(doc, "1.5 Features and Functional Modules")
    add_body_p(
        doc,
        "MedGuide AI encompasses eight cohesive functional subsystems spanning client applications, backend services, and AI pipelines:"
    )
    add_bullet_p(doc, " Comprehensive public portal built in Next.js 14 providing health literacy resources, system overview, role-based authentication, and emergency dialing shortcuts.", "1. Public Web Portal & Onboarding:")
    add_bullet_p(doc, " Contextual symptom intake interface allowing users to describe complaints in conversational natural language, with duration, severity chips, and body region selectors.", "2. Conversational Symptom Intake:")
    add_bullet_p(doc, " Hard-coded ontology parsing raw inputs against emergency criteria, routing high-acuity presentations to immediate 108/112 emergency escalation.", "3. Deterministic Red-Flag Safety Gate:")
    add_bullet_p(doc, " Dense semantic search over PostgreSQL pgvector indexed clinical guidelines, enforcing strict evidence attribution cards with document, chapter, and page references.", "4. Evidence-Gated Clinical RAG:")
    add_bullet_p(doc, " Camera capture, image preprocessing, Tesseract OCR text extraction, medicine entity parsing, confidence scoring, and interactive human verification modal.", "5. Prescription OCR & Verification:")
    add_bullet_p(doc, " Automated schedule generation, daily reminder notifications, adherence logging, missed dose tracking, and wellness streak calculations.", "6. Medication Support & Adherence:")
    add_bullet_p(doc, " Chronological health event aggregation combining symptom evaluations, prescription uploads, medication milestones, and clinical follow-ups.", "7. Longitudinal Health Timeline:")
    add_bullet_p(doc, " Secure portal enabling authorized health workers to view assigned patient rosters, clinical summaries, adherence alerts, and schedule field visits.", "8. Healthcare-Worker Dashboard:")

    # Insert Figure 1.1
    fig_path = img_dir_arch / "Figure_1_1_System_Architecture.png"
    add_figure(doc, fig_path, "System Architecture of the MedGuide AI Rural Healthcare Intelligence Platform", "1.1")

    # 1.6 Approved Scope, MVP Boundaries, and Exclusions
    add_heading_2(doc, "1.6 Approved Scope, MVP Boundaries, and Exclusions")
    add_body_p(
        doc,
        "To preserve clinical safety, engineering focus, and research integrity, MedGuide AI enforces strict MVP boundaries. "
        "Features that expand scope into commercial, speculative, or high-risk autonomous clinical domains are explicitly excluded."
    )
    
    mvp_headers = ["Functional Dimension", "Approved Stage 1 MVP Scope", "Explicit Scope Exclusions"]
    mvp_data = [
        ["Clinical Decision Making", "Preliminary symptom triage, risk stratification (Tiers 1-3), evidence-based education.", "Autonomous medical diagnosis, ungrounded treatment recommendations."],
        ["Prescriptions & Meds", "OCR extraction, dosage clarification, human verification, adherence tracking.", "Autonomous prescribing, altering dosages, instructing patients to stop meds."],
        ["Linguistic Scope", "English, Hindi, Telugu text and streaming voice support.", "Unvalidated translation into 20+ dialects without clinical review."],
        ["Medical Knowledge", "WHO PEN, ICMR Standard Treatment Workflows, NHM primary care manuals.", "Uncurated web crawling, dynamic scraping of commercial health blogs."],
        ["Platform Architecture", "Next.js Web, React Native Expo Mobile, FastAPI, PostgreSQL/pgvector.", "E-commerce, medicine delivery, paid teleconsultation billing, crypto/NFTs."]
    ]
    add_custom_table(doc, mvp_headers, mvp_data, "Approved MVP Boundaries, Functional Modules, and Explicit Scope Exclusions", "1.1", col_widths=[3.5, 6.0, 6.0])

def build_chapter_2(doc, img_dir_arch):
    add_heading_1(doc, "CHAPTER 2\nPROBLEM STATEMENT")
    
    # 2.1 Distance, Language, and Digital-Literacy Barriers
    add_heading_2(doc, "2.1 Distance, Language, and Digital-Literacy Barriers")
    add_body_p(
        doc,
        "The primary healthcare delivery architecture in rural India faces systemic physical and cognitive bottlenecks. "
        "Physical distance to accredited secondary and tertiary medical facilities often forces rural citizens to undertake arduous "
        "journeys, leading to diagnostic procrastination. When individuals attempt to seek health information digitally, they encounter "
        "severe linguistic and cognitive exclusion. Over 85% of online medical resources are published in English, employing complex "
        "clinical nomenclature (e.g., 'dyspnea', 'pruritus', 'angina pectoris') that is unintelligible to rural populations [8]. "
        "Consequently, rural citizens are unable to express their ailments effectively or comprehend standard health advisories, "
        "creating an acute need for intuitive, voice-enabled interfaces supporting regional languages (Hindi and Telugu)."
    )
    
    # 2.2 Reliability and Safety Challenges in Healthcare Information
    add_heading_2(doc, "2.2 Reliability and Safety Challenges in Healthcare Information")
    add_body_p(
        doc,
        "The uncontrolled proliferation of medical misinformation on commercial search engines and social platforms poses grave risks "
        "to public health. Commercial search algorithms optimize for user engagement, click-through rates, and ad impressions, frequently "
        "elevating sensationalized, worst-case medical scenarios in response to benign symptom queries. Conversely, the recent emergence "
        "of general-purpose commercial Large Language Models (LLMs) has introduced acute hallucination hazards. When queried on clinical "
        "topics without retrieval grounding, standard LLMs confabulate medically plausible but factually erroneous guidance, invent "
        "fictitious drug dosages, and fail to enforce deterministic safety boundaries during acute emergencies [9]. In healthcare, "
        "probabilistic generation without rigorous verification can lead to fatal delays in emergency care."
    )
    
    # 2.3 Prescription Understanding and Medication Support
    add_heading_2(doc, "2.3 Prescription Understanding and Medication Support")
    add_body_p(
        doc,
        "Prescription misinterpretation represents a major cause of adverse drug reactions and clinical morbidity in rural settings. "
        "Physician prescriptions in India are overwhelmingly handwritten, frequently illegible, and utilize Latin abbreviations "
        "(e.g., 'OD', 'BD', 'TDS', 'SOS', 'AC', 'PC') that are obscure to patients [10]. Rural patients routinely struggle to recall "
        "which medication corresponds to which symptom, whether a pill should be consumed before or after food, and the required duration "
        "of antibiotic courses. This confusion leads to widespread medication non-adherence, premature cessation of therapy, accidental "
        "overdoses, and the acceleration of antimicrobial resistance (AMR)."
    )
    
    # 2.4 Care Discontinuity and Healthcare-Worker Coordination
    add_heading_2(doc, "2.4 Care Discontinuity and Healthcare-Worker Coordination")
    add_body_p(
        doc,
        "Rural healthcare in India is profoundly fragmented. Patient medical histories exist predominantly as crumpled paper slips, "
        "isolated laboratory receipts, and faded prescriptions maintained informally by patients. When presenting at a PHC or visiting "
        "an ASHA worker, patients are rarely able to provide an accurate chronological account of their symptoms, prior diagnoses, "
        "or drug regimens [11]. ASHA workers and ANMs—who form the vital backbone of grassroots public health—lack lightweight, "
        "structured digital tools to track patient adherence, review symptom trajectories, or coordinate referrals, perpetuating severe "
        "discontinuity of care across rural communities."
    )
    
    # 2.5 Technical Problem Definition and Research Questions
    add_heading_2(doc, "2.5 Technical Problem Definition and Research Questions")
    add_body_p(
        doc,
        "To resolve these challenges, MedGuide AI formulates the following formal technical problem definition and research questions:"
    )
    add_body_p(
        doc,
        "\"How can a distributed, multi-modal software architecture combine deterministic clinical safety ontologies, multilingual "
        "dense vector retrieval across validated public health guidelines, and human-in-the-loop OCR verification to deliver accurate, "
        "low-latency, and privacy-preserving healthcare intelligence to rural patients and community health workers on consumer hardware?\"",
        italic_prefix="Problem Statement: "
    )
    add_body_p(doc, "The project investigates four foundational research questions (RQs):")
    add_bullet_p(doc, " How can deterministic rule-based safety interception be formally decoupled from generative language models to guarantee zero-latency emergency escalation while maintaining conversational natural language capability for non-emergent complaints?", "• RQ1 (Deterministic Safety Decoupling):")
    add_bullet_p(doc, " How effectively does dense semantic retrieval using paraphrase-multilingual-MiniLM-L12-v2 across localized WHO and ICMR clinical guidelines constrain generative language models against hallucination in rural healthcare queries?", "• RQ2 (Multilingual RAG Faithfulness):")
    add_bullet_p(doc, " What architectural constraints, bounding box confidence thresholds, and verification workflows are necessary to prevent erroneous OCR extraction from generating dangerous automated medication schedules?", "• RQ3 (Human-in-the-Loop OCR Verification):")
    add_bullet_p(doc, " How can a hybrid edge-and-cloud architecture maintain offline patient timeline and reminder availability while synchronizing seamlessly with centralized healthcare-worker portals under intermittent rural connectivity?", "• RQ4 (Offline Resilience & Continuity):")

    # Figure 2.1
    fig_path = img_dir_arch / "Figure_2_1_Conceptual_Evolution.png"
    if not fig_path.exists():
        fig_path = ROOT / "report_figures" / "figure-2.1.png"
    add_figure(doc, fig_path, "Conceptual Evolution from Healthcare Information Seeking to Grounded Decision Support", "2.1")

def build_chapter_3(doc):
    add_heading_1(doc, "CHAPTER 3\nLITERATURE SURVEY")
    
    # 3.1 Online Symptom Checkers and Health Information Seeking
    add_heading_2(doc, "3.1 Online Symptom Checkers and Health Information Seeking")
    add_body_p(
        doc,
        "Digital health information seeking has been widely investigated across clinical informatics. In a landmark benchmark study "
        "published in the British Medical Journal (BMJ), Semigran et al. [12] evaluated 23 commercial online symptom checkers across "
        "45 standardized clinical vignettes. The authors revealed that symptom checkers achieved a correct triage recommendation in only "
        "57% of clinical presentations, with emergency triage accuracy varying widely between 54% and 80%. A critical finding of the study "
        "was that rule-based symptom checkers exhibited systemic 'risk-aversion bias', frequently advising low-acuity patients to visit "
        "emergency departments to minimize developer liability. This over-triaging exacerbates hospital congestion while eroding user trust. "
        "Furthermore, Starcevic et al. [13] demonstrated that unstructured web search for medical information significantly amplifies "
        "cyberchondria, emphasizing that conversational decision-support systems must provide grounded, clear risk stratification."
    )
    
    # 3.2 Large Language Models in Healthcare
    add_heading_2(doc, "3.2 Large Language Models in Healthcare")
    add_body_p(
        doc,
        "The introduction of transformer-based Large Language Models (LLMs) has reshaped medical artificial intelligence. In 2023, "
        "Singhal et al. [14] presented Med-PaLM and subsequently Med-PaLM 2, demonstrating expert-level performance on United States "
        "Medical Licensing Examination (USMLE) style questions. While Med-PaLM 2 achieved scores exceeding 85%, the authors noted that "
        "open-ended parametric generation remains vulnerable to subtle factual hallucinations, reasoning failures on edge cases, and "
        "unpredictable omissions of contraindications. Thirunavukarasu et al. [15] reviewed the clinical utility of generative models "
        "in Lancet Digital Health, concluding that unconstrained LLMs cannot be safely deployed in direct patient care without rigorous "
        "safety boundaries, external knowledge grounding, and clear institutional disclaimers."
    )
    
    # 3.3 Retrieval-Augmented Generation (RAG)
    add_heading_2(doc, "3.3 Retrieval-Augmented Generation (RAG)")
    add_body_p(
        doc,
        "Retrieval-Augmented Generation (RAG), pioneered by Lewis et al. [16] at NeurIPS 2020, addresses parametric hallucination by "
        "conditioning language models on retrieved text passages from external, verified knowledge repositories. In the clinical domain, "
        "Zakka et al. [17] developed 'Almanac', a clinical RAG decision-support system that coupled generative models with indexed "
        "medical literature, demonstrating substantial reductions in clinical hallucination and establishing verifiable citation provenance. "
        "Gao et al. [18] presented a comprehensive survey of RAG architectures, distinguishing Naive RAG from Advanced and Modular RAG. "
        "Modular RAG introduces pre-retrieval query routing, semantic chunking, and post-retrieval evidence gating. MedGuide AI adopts "
        "a modular RAG design, enforcing an upstream deterministic safety filter before vector search and requiring citation validation "
        "before response generation."
    )
    
    # 3.4 Multilingual Embeddings and Cross-Language Retrieval
    add_heading_2(doc, "3.4 Multilingual Embeddings and Cross-Language Retrieval")
    add_body_p(
        doc,
        "In multilingual and low-resource healthcare contexts, dense semantic representations are essential for bridging vernacular queries "
        "with formal clinical guidelines. Reimers and Gurevych [19] introduced Multilingual Sentence-BERT, demonstrating that multilingual "
        "distillation maps semantically equivalent sentences across diverse languages into aligned embedding spaces. The model "
        "paraphrase-multilingual-MiniLM-L12-v2 encodes text across 50+ languages into a compact 384-dimensional vector space [20]. "
        "This allows a user query formulated in Hindi or Telugu to retrieve semantically aligned clinical guidance passages indexed "
        "from English-language WHO and ICMR guidelines without requiring lossy end-to-end machine translation prior to retrieval."
    )
    
    # 3.5 Speech Recognition and Text-to-Speech in Healthcare
    add_heading_2(doc, "3.5 Speech Recognition and Text-to-Speech in Healthcare")
    add_body_p(
        doc,
        "Voice interaction is critical for overcoming digital-literacy barriers among rural populations. Radford et al. [21] introduced "
        "Whisper, a robust sequence-to-sequence automatic speech recognition (ASR) model trained on 680,000 hours of multilingual audio. "
        "While Whisper demonstrates high accuracy on English, its performance on Indic regional languages and specialized medical "
        "terminology exhibits elevated Word Error Rates (WER) [22]. To address Indic linguistic nuances, Sarvam AI developed foundational "
        "Indic speech models optimized for Indian phonetics, code-switching (e.g., Hinglish, Telugish), and rural acoustic conditions [23]. "
        "MedGuide AI leverages Sarvam AI's Indic streaming STT/TTS pipeline for high-fidelity regional interaction, maintaining an "
        "offline-capable Whisper.cpp batch adapter for local edge execution."
    )
    
    # 3.6 Prescription OCR and Information Extraction
    add_heading_2(doc, "3.6 Prescription OCR and Information Extraction")
    add_body_p(
        doc,
        "Optical Character Recognition (OCR) in healthcare faces extreme complexity due to the irregular orthography of physician "
        "handwriting, varied document degradation, and idiosyncratic abbreviations. Smith [24] detailed the architecture of Tesseract OCR, "
        "which combines line finding, character classification, and multi-lingual LSTM language models. In biomedical information extraction, "
        "studies on the MIMIC-III and Indian hospital prescription datasets [25] demonstrate that raw OCR achieves character recognition "
        "rates below 75% on handwritten doctor scripts. Consequently, modern clinical informatics emphasizes that OCR pipelines must "
        "never autonomously commit medication orders. Instead, systems must incorporate bounding box confidence scoring and mandatory "
        "human verification (patient or healthcare worker review) before committing extracted dosages to active schedules."
    )
    
    # 3.7 Comparative Literature Matrix
    add_heading_2(doc, "3.7 Comparative Literature Matrix")
    add_body_p(
        doc,
        "Table 3.1 synthesizes the evaluative dimensions of eight landmark healthcare AI, triage, and RAG literature sources, "
        "highlighting their contributions, technical limitations, and direct relevance to MedGuide AI."
    )
    
    lit_headers = ["Study & Citation", "Focus / Domain", "Key Methodology", "Reported Strengths", "Critical Limitations", "Relevance to MedGuide AI"]
    lit_data = [
        ["Semigran et al. [12] (BMJ 2015)", "Evaluation of 23 Symptom Checkers", "Standardized clinical vignettes (45 cases)", "First large-scale audit of diagnostic and triage accuracy.", "High risk-aversion bias; poor emergency detection (54%).", "Highlights need for deterministic emergency interception."],
        ["Singhal et al. [14] (Nature 2023)", "LLMs in Medicine (Med-PaLM)", "Domain-tuned 540B PaLM model on USMLE", "State-of-the-art medical question answering (>85%).", "Massive computational requirement; stochastic hallucinations.", "Demonstrates necessity of RAG grounding and small models."],
        ["Zakka et al. [17] (Lancet DH 2023)", "Clinical Decision Support (Almanac)", "Retrieval-Augmented Generation with BM25/Dense", "Reduced hallucination; verifiable citation tracking.", "English-only; hospital desktop focus; no speech/OCR.", "Validates citation-gated generation for primary care."],
        ["Reimers et al. [19] (EMNLP 2020)", "Cross-Lingual Embeddings", "Knowledge distillation into Multilingual SBERT", "Compact 384-d vectors; cross-lingual semantic parity.", "Requires domain fine-tuning for complex pharmacology.", "Underpins MedGuide AI's Hindi/Telugu/English vector search."],
        ["Radford et al. [21] (ICML 2023)", "Speech Recognition (Whisper)", "Weakly supervised multi-task transformer", "Zero-shot robustness across standard acoustics.", "Elevated WER on Indic accents and rural dialects.", "Informs adoption of Sarvam AI with Whisper.cpp fallback."],
        ["Smith [24] (ICDAR 2007)", "Optical Character Recognition", "Tesseract OCR engine with LSTM classifiers", "Open-source, highly portable, customizable dictionaries.", "Fails on irregular cursive handwritten prescriptions.", "Dictates mandatory human verification before scheduling."],
        ["eSanjeevani / C-DAC [26] (MoHFW 2021)", "National Telemedicine Platform", "Hub-and-spoke video/audio teleconsultation", "Massive nationwide rollout; connects rural PHCs to doctors.", "Requires stable high bandwidth; long patient waiting queues.", "MedGuide AI acts as an asynchronous preliminary care bridge."],
        ["Ada Health [27] (JIR 2020)", "Probabilistic Symptom Assessment", "Bayesian network reasoning engine", "High diagnostic accuracy in controlled clinical trials.", "Proprietary closed-source; commercial licensing; English/German.", "Demonstrates value of structured symptom intake ontologies."]
    ]
    add_custom_table(doc, lit_headers, lit_data, "Comparative Literature Matrix of Healthcare AI, Triage, and RAG Systems", "3.1", col_widths=[2.5, 2.5, 2.5, 2.5, 2.5, 2.7])
    
    # 3.8 Research Gaps and Relevance to MedGuide AI
    add_heading_2(doc, "3.8 Research Gaps and Relevance to MedGuide AI")
    add_body_p(
        doc,
        "The literature review reveals four critical research and engineering gaps in current digital health systems:"
    )
    add_bullet_p(doc, " Existing conversational agents rely either entirely on rigid rule-based branching trees (which frustrate users) or entirely on unconstrained LLM generation (which hallucinates). There is an acute gap for a hybrid architecture that enforces deterministic interception for emergencies while leveraging RAG for conversational guidance.", "1. Absence of Decoupled Safety Gates in Conversational AI:")
    add_bullet_p(doc, " State-of-the-art medical RAG systems are evaluated almost exclusively on Western biomedical corpora (PubMed, clinical trials). There is a critical lack of RAG architectures grounded in Indian public health realities (WHO PEN, ICMR guidelines, rural epidemiology).", "2. Western Biomedical Bias in Medical RAG Systems:")
    add_bullet_p(doc, " Rural digital health platforms routinely overlook speech-driven interaction in Indic languages (Hindi, Telugu), effectively disenfranchising non-literate and elderly populations.", "3. Neglect of Multilingual Indic Voice Interfaces:")
    add_bullet_p(doc, " Digital tools treat patients in isolation, omitting the vital role played by community healthcare workers (ASHAs and ANMs) in longitudinal follow-up, adherence monitoring, and care coordination.", "4. Lack of Collaborative Patient-Worker Workflows:")

def build_chapter_4(doc, img_dir_arch):
    add_heading_1(doc, "CHAPTER 4\nEXISTING SYSTEM")
    
    # 4.1 Public Search Engines and Health Portals
    add_heading_2(doc, "4.1 Public Search Engines and Health Portals")
    add_body_p(
        doc,
        "Public search engines (e.g., Google, Microsoft Bing) and commercial health information portals (e.g., WebMD, Healthline) "
        "represent the default digital health information seeking channel for over 80% of internet users. However, their core architecture "
        "presents fundamental deficiencies when applied to preliminary clinical triage. Search engines rely on PageRank and SEO algorithms "
        "that optimize for user traffic, dwell time, and commercial advertising. As a consequence, common, non-urgent symptoms "
        "(such as tension headaches or mild abdominal cramps) frequently yield search results emphasizing catastrophic diagnoses "
        "(such as glioblastomas or acute aortic dissections), triggering severe cyberchondria [2]. Furthermore, search portals cannot "
        "synthesize multi-symptom narratives, assess chronicity, or issue actionable, localized emergency directives."
    )
    
    # 4.2 Rule-Based Symptom Assessment Systems
    add_heading_2(doc, "4.2 Rule-Based Symptom Assessment Systems")
    add_body_p(
        doc,
        "First-generation clinical decision-support systems, such as the NHS 111 Online pathway and early WebMD symptom checkers, utilize "
        "static, rule-based expert decision trees. While these systems maintain high clinical safety because every branching node is "
        "manually authored by medical committees, their user interaction model is exceptionally rigid and time-consuming. Users must "
        "manually click through dozens of drop-down menus, anatomical maps, and boolean question sequences. These systems demonstrate "
        "zero tolerance for conversational nuance, colloquial language, or multi-symptom descriptions. Crucially, out of institutional "
        "liability concerns, rule-based checkers terminate by directing a disproportionate percentage of users to emergency care, "
        "severely congesting rural PHCs [12]."
    )
    
    # 4.3 General-Purpose and Cloud-Based Language Models
    add_heading_2(doc, "4.3 General-Purpose and Cloud-Based Language Models")
    add_body_p(
        doc,
        "The advent of general-purpose commercial conversational models (such as OpenAI ChatGPT, Google Gemini, and Anthropic Claude) "
        "introduced intuitive conversational capabilities. Users can describe complex symptom narratives in natural language. However, "
        "their deployment in healthcare presents severe clinical and regulatory risks:"
    )
    add_bullet_p(doc, " Standard models generate answers based on probabilistic token distributions learned during pre-training, routinely hallucinating clinical guidelines, drug dosages, and contraindications.", "• Stochastic Hallucinations:")
    add_bullet_p(doc, " General models lack an upstream deterministic safety boundary; their refusal behavior is governed by soft alignment prompts, which can be bypassed or fail during acute clinical emergencies.", "• Inconsistent Emergency Boundaries:")
    add_bullet_p(doc, " Querying commercial cloud APIs transmits identifiable patient health queries to third-party overseas servers, violating health data privacy principles and incurring continuous token subscription fees.", "• Data Sovereignty & Recurring Costs:")

    # 4.4 Telemedicine and Personal Health Record Systems
    add_heading_2(doc, "4.4 Telemedicine and Personal Health Record Systems")
    add_body_p(
        doc,
        "National telemedicine initiatives, such as the Government of India's eSanjeevani platform, have demonstrated significant success "
        "in connecting rural patients with remote specialist physicians via tele-consultation [26]. Similarly, the Ayushman Bharat Digital "
        "Mission (ABDM) and personal health record (PHR) apps provide centralized repository standards for electronic health records. "
        "However, telemedicine platforms require stable, high-bandwidth internet connectivity for video/audio streaming—a condition rarely "
        "met in remote rural habitations. Furthermore, telemedicine systems require a live doctor on the other end of the connection, "
        "leading to long waiting queues during peak hours. They do not provide automated preliminary symptom triage, prescription "
        "clarification, or daily medication adherence support."
    )
    
    # 4.5 Comparative Limitations and Design Implications
    add_heading_2(doc, "4.5 Comparative Limitations and Design Implications")
    add_body_p(
        doc,
        "Table 4.1 establishes a systematic comparative evaluation between existing healthcare information paradigms and MedGuide AI."
    )
    
    comp_headers = ["Evaluative Dimension", "Public Search Engines", "Rule-Based Checkers", "Cloud LLMs (ChatGPT)", "Telemedicine (eSanjeevani)", "MedGuide AI (Proposed)"]
    comp_data = [
        ["Interaction Model", "Keyword queries; blue links", "Rigid decision-tree clicks", "Free-form text chat", "Live video / audio call", "Natural language chat & streaming Indic voice"],
        ["Emergency Interception", "None (ad-driven ranking)", "Rule-based; high over-triage", "Inconsistent soft prompts", "Human triage / operator", "Deterministic hard-coded safety gate (<15 ms)"],
        ["Hallucination Risk", "High (unverified websites)", "Zero (hardcoded static text)", "High (parametric memory)", "None (licensed clinician)", "Mitigated via Evidence-Gated RAG & citations"],
        ["Language Accessibility", "English-dominated; translation", "Limited regional options", "Multilingual text; poor voice", "Regional doctor dependent", "Bilingual text & streaming voice (EN, HI, TE)"],
        ["Prescription Support", "None", "None", "Unvalidated text analysis", "Doctor writes prescription", "OCR extraction + mandatory human verification"],
        ["Worker Integration", "None", "None", "None", "Doctor-to-doctor mode", "Dedicated ASHA/ANM dashboard & timeline"],
        ["Data Privacy / Cost", "Ad tracking; search logs", "Centralized corporate DB", "Cloud server logs; API fees", "Government server DB", "Stateless JWT, RBAC, free/open-source stack"]
    ]
    add_custom_table(doc, comp_headers, comp_data, "Systematic Comparison of Healthcare Information Paradigms vs. MedGuide AI", "4.1", col_widths=[2.5, 2.5, 2.5, 2.5, 2.7, 2.8])

    # Insert Figure 4.1 & 4.2
    fig_41 = img_dir_arch / "Figure_4_1_Ingestion_Vectorization_Pipeline.png"
    if not fig_41.exists():
        fig_41 = ROOT / "report_figures" / "figure-4.2.png"
    add_figure(doc, fig_41, "Medical Document Ingestion, Semantic Chunking, and Vectorization Pipeline", "4.1")

    fig_42 = img_dir_arch / "Figure_4_2_Docker_Deployment_Architecture.png"
    if not fig_42.exists():
        fig_42 = ROOT / "report_figures" / "figure-4.2.png"
    add_figure(doc, fig_42, "Proposed Local Multi-Container Deployment Architecture using Docker Compose", "4.2")

print("Chapters 1 to 4 defined.")
