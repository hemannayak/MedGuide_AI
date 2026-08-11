# MedGuide AI — Master Medical Source Registry & Dataset Register (v4.2)

**Project Title:** MedGuide AI: An AI-Powered Rural Healthcare Intelligence and Digital Care Platform  
**Document:** Master Medical Source Registry & Dataset Register (`DS-01` through `DS-05`)  
**Version:** 4.2  
**Status:** **AUTHORITATIVE CORPUS UPDATED & VERIFIED**  

---

# 1. Executive Policy & Exclusion Boundary Rules

In strict compliance with **AGENTS.md Rule #8 (Medical Knowledge Rule)**, **Rule #10 (RAG Rules)**, **Rule #19 (Data Minimization)**, and **Rule #33 (Research Integrity)**:

- **Strict Source Separation:**
  1. **RAG Knowledge Base:** 100% derived from verified, official publications of **MoHFW India**, **ICMR India**, **Central TB Division (NTEP)**, and **WHO Official Guidelines**.
  2. **Speech ASR Evaluation Sets (`DS-05`):** Mozilla Common Voice (Hindi/Telugu/English) & AI4Bharat IndicVoices-R (CC-BY-4.0). Strictly used for speech-to-text benchmark evaluation, NOT medical knowledge.
  3. **Prescription OCR Evaluation Sets (`DS-04`):** 100% synthetic, de-identified prescription images. Strictly used for OCR precision benchmark evaluation, NOT medical knowledge.

- **Prohibited Sources (Strict Exclusion List):**
  ❌ Wikipedia, Healthline, WebMD, Reddit, Quora, Medium, Kaggle PDFs, AI-generated/ChatGPT medical summaries, scraped websites, or local ReportLab generated PDFs.

---

# 2. Authoritative RAG Knowledge Corpus (Tier 1, Tier 2 & Tier 3)

### Tier 1: Indian Government Sources (MoHFW & Central TB Division)

| Source ID | Official Title | Publisher | Official Source URL / Download URL | Target Medical Domain | Priority | Verification Status |
|---|---|---|---|---|---|---|
| **GOV-01** | Standard Treatment Guidelines: Hypertension Quick Reference Guide | MoHFW / NHM India | https://nhm.gov.in/images/pdf/guidelines/nrhm-guidelines/stg/Hypertension_QRG.pdf | BP / Cardiovascular | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **GOV-02** | MoHFW STG: Respiratory Medicine & Asthma | MoHFW / Clinical Establishments | https://clinicalestablishments.mohfw.gov.in/en/standard-treatment-guidelines | Cough / Dyspnea / ARI | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **GOV-03** | MoHFW STG: Paediatrics & Paediatric Care | MoHFW / Clinical Establishments | https://clinicalestablishments.mohfw.gov.in/en/standard-treatment-guidelines | Pediatric Health | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **GOV-04** | MoHFW STG: Gastroenterological Diseases | MoHFW / Clinical Establishments | https://clinicalestablishments.mohfw.gov.in/en/standard-treatment-guidelines | Diarrhea / Abdominal Pain | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **GOV-05** | MoHFW National Guidelines for Clinical Management of Dengue | MoHFW / NVBDCP | https://nvbdcp.gov.in/doc/dengue-guidelines-2021.pdf | Dengue Fever Triage | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **GOV-06** | MoHFW National Guidelines for Diagnosis & Treatment of Malaria | MoHFW / NVBDCP | https://nvbdcp.gov.in/doc/malaria-guidelines-2021.pdf | Malaria Management | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **GOV-07** | National Guidelines on Snake-bite & Emergency Management | MoHFW / Emergency Medical Relief | https://main.mohfw.gov.in/sites/default/files/Snakebite_SOP.pdf | Emergency Red-Flag | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **GOV-08** | National Guidelines for Antimicrobial Stewardship | MoHFW / ICMR India | https://main.icmr.nic.in/content/antimicrobial-stewardship | Antibiotic Safety | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **GOV-09** | National Guidelines for Management of Tuberculosis (NTEP) | Central TB Division / MoHFW | https://tbcindia.mohfw.gov.in/guidelines/ | Pulmonary & Extrapulmonary TB | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |

---

### Tier 2: ICMR Standard Treatment Workflows (ICMR STWs)

| Source ID | Official Title | Publisher | Official Source URL / Download URL | Target Medical Domain | Priority | Verification Status |
|---|---|---|---|---|---|---|
| **ICMR-01** | ICMR STW: Paediatric and Extrapulmonary Tuberculosis (2022) | ICMR / Govt of India | https://www.icmr.gov.in/icmrobject/custom_data/pdf/downloadable-books/ICMR_STW_PTB_EPTB.pdf | Pediatric & EPTB | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **ICMR-02** | ICMR STW: Adult Hypertension Management | ICMR / Govt of India | https://www.icmr.gov.in/standard-treatment-workflows-stws | Adult Hypertension | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **ICMR-03** | ICMR STW: Acute Respiratory Infection & Asthma | ICMR / Govt of India | https://www.icmr.gov.in/standard-treatment-workflows-stws | Respiratory Triage | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **ICMR-04** | ICMR STW: Acute Gastroenteritis & Diarrheal Diseases | ICMR / Govt of India | https://www.icmr.gov.in/standard-treatment-workflows-stws | Dehydration / ORS | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |

---

### Tier 3: Official WHO International Guidelines

| Source ID | Official Title | Publisher | Official Source URL / ISBN / DOI | Target Medical Domain | Priority | Verification Status |
|---|---|---|---|---|---|---|
| **WHO-01** | WHO Guidelines for Malaria (13 August 2025) | World Health Organization | https://doi.org/10.2471/B09514 | Malaria Diagnosis & Case Management | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **WHO-02** | WHO Guideline for the Pharmacological Treatment of Hypertension in Adults (2021) | World Health Organization | ISBN 978-92-4-003398-6 | Hypertension Thresholds & Combination Regimens | 🔴 P0 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **WHO-03** | WHO Guidelines for Primary Health Care in Low-Resource Settings | World Health Organization | https://www.who.int/publications/i/item/9789241548397 | Primary Care Baseline | 🟠 P1 | `VERIFIED_OFFICIAL_DOCUMENT` |
| **WHO-04** | WHO Guideline on Management of Pneumonia and Diarrhoea in Children | World Health Organization | https://www.who.int/publications/i/item/9789240103412 | Pediatric Respiratory/GI | 🟠 P1 | `VERIFIED_OFFICIAL_DOCUMENT` |

---

# 3. ML Evaluation Sets Register (Non-Medical Knowledge)

| Asset ID | Asset Name | Domain | Provider / Source | License | Purpose | Status |
|---|---|---|---|---|---|---|
| **DS-04** | Synthetic Prescription Image Set | OCR Evaluation | Synthetic Generation (Pillow) | 100% De-identified | Evaluate OCR text & dosage extraction precision | `READY` |
| **DS-05** | Multilingual Speech Evaluation Set | Speech ASR Evaluation | Mozilla Common Voice (HI/TE/EN) & IndicVoices-R | CC0 / CC-BY-4.0 | Evaluate Whisper Speech-to-Text WER / CER | `READY` |

---

# 4. Provenance Chain Standard

Every chunk stored in PostgreSQL `knowledge_chunks` MUST satisfy:
```text
Official Publisher → Authentic Document PDF → Source URL / DOI → SHA-256 Hash → Page/Section Metadata → Verbatim Extraction → Semantic Chunk → Multilingual Embedding → pgvector → Grounded Response → Source Attribution
```

---

> **Master Medical Source Registry & Dataset Register v4.2 Updated with Official WHO 2021 Hypertension Guideline.**
