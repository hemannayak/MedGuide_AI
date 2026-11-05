# -*- coding: utf-8 -*-
"""
MedGuide AI — Academic Report Text and Structure Data
Contains comprehensive academic chapters, tables, literature matrix,
API inventories, database schemas, and references.
"""

PROJECT_TITLE = "MEDGUIDE AI: AN AI-POWERED RURAL HEALTHCARE INTELLIGENCE AND DIGITAL CARE PLATFORM"
DEGREE_TEXT = "Report submitted in partial fulfillment of the requirements for the award of degree of"
DEGREE_NAME = "BACHELOR OF TECHNOLOGY"
BRANCH_NAME = "COMPUTER SCIENCE AND ENGINEERING (DATA SCIENCE)"
COLLEGE_NAME = "HYDERABAD INSTITUTE OF TECHNOLOGY AND MANAGEMENT"
COLLEGE_AFFILIATION = "(Affiliated to Jawaharlal Nehru Technological University Hyderabad - JNTUH, Approved by AICTE, Accredited by NBA & NAAC with 'A+' Grade)"
COLLEGE_ADDRESS = "Gowdavelly (Vill), Medchal (Mdl), Medchal-Malkajgiri (Dist), Hyderabad - 501401, Telangana"
ACADEMIC_YEAR = "2026–2027"
STAGE_TEXT = "B.Tech Major Project Report (Stage 1)"

GUIDE_NAME = "Ms. Richa Tiwari"
GUIDE_DESIGNATION = "Assistant Professor"
DEPARTMENT_NAME = "Department of Computer Science and Engineering (Data Science)"

TEAM_MEMBERS = [
    {"name": "Kamidi Vinay Venkateshulu", "htno": "23E51A6772"},
    {"name": "Konda Mahesh Sri Sai", "htno": "23E51A6781"},
    {"name": "Nocharla Venkatesh", "htno": "23E51A67C0"},
    {"name": "Pangoth Hemanth Nayak", "htno": "23E51A67C5"}
]

ABSTRACT_TEXT = (
    "Rural and underserved communities in India face persistent challenges in accessing timely, understandable, "
    "and reliable healthcare information. Acute physician shortages in rural Primary Health Centres (PHCs), wide linguistic "
    "and digital-literacy disparities, physical distance to secondary healthcare facilities, and the rampant proliferation "
    "of misinformation on commercial search engines contribute to severe clinical vulnerabilities. Patients frequently alternate "
    "between two dangerous behavioral extremes: delay in seeking urgent intervention for acute, life-threatening symptoms, "
    "and cyberchondria-driven anxiety over benign conditions. Furthermore, handwritten prescriptions and ambiguous dosage "
    "schedules lead to significant medication non-adherence and adverse drug events.\n\n"
    "To resolve these socio-technical challenges, this Stage 1 Major Project introduces MedGuide AI, an intelligent, "
    "multilingual rural healthcare intelligence and digital care companion. MedGuide AI is engineered as a privacy-preserving, "
    "decision-support architecture that decouples safety-critical symptom triage from generative natural language synthesis. "
    "The platform incorporates: (1) an upstream deterministic red-flag safety interception gate that intercepts acute life-threatening "
    "emergencies within milliseconds, bypassing stochastic neural models to deliver standardized emergency protocols and localized hotlines; "
    "(2) an evidence-gated Retrieval-Augmented Generation (RAG) pipeline utilizing multilingual dense embeddings (paraphrase-multilingual-MiniLM-L12-v2) "
    "and PostgreSQL pgvector vector storage across validated Indian public health guidelines (WHO PEN, ICMR Standard Treatment Workflows, "
    "and National Health Mission manuals); (3) a human-in-the-loop Optical Character Recognition (OCR) pipeline for prescription text "
    "and dosage extraction requiring patient or healthcare worker verification before scheduling; (4) a multilingual Indic speech "
    "interface powered by Sarvam AI with local Whisper.cpp offline fallback; and (5) a role-based healthcare worker coordination layer "
    "enabling Accredited Social Health Activists (ASHAs) and Auxiliary Nurse Midwives (ANMs) to review longitudinal patient timelines, "
    "symptom summaries, and adherence records.\n\n"
    "The software architecture comprises a modern Next.js 14 web client, a cross-platform React Native / Expo mobile application, "
    "and an asynchronous FastAPI backend backed by a 27-table relational PostgreSQL schema. Rigorous automated testing confirms 414 "
    "passing backend test cases and 87 frontend test cases. Vector retrieval evaluation demonstrates high semantic alignment "
    "(cosine similarity > 0.86) on primary healthcare queries against indexed WHO guidelines. MedGuide AI explicitly disclaims "
    "autonomous diagnosis or medical replacement, functioning strictly as an accessible preliminary intelligence and digital care bridge."
)

KEYWORDS = [
    "Rural Healthcare Intelligence",
    "Retrieval-Augmented Generation (RAG)",
    "Deterministic Clinical Safety Gate",
    "Multilingual Vector Search",
    "Prescription OCR",
    "PostgreSQL pgvector",
    "FastAPI",
    "Next.js",
    "React Native Expo",
    "ASHA / ANM Digital Support"
]

print("Report metadata and abstract ready.")

