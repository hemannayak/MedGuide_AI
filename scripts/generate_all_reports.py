# -*- coding: utf-8 -*-
"""
MedGuide AI — Full Academic Major Project Report Generator (Stage 1)
Hyderabad Institute of Technology and Management (HITAM)
Department of Computer Science and Engineering (Data Science)
Academic Year 2026-2027
"""

import os
import sys
from pathlib import Path
from copy import deepcopy

import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from report_data import (
    PROJECT_TITLE, DEGREE_TEXT, DEGREE_NAME, BRANCH_NAME,
    COLLEGE_NAME, COLLEGE_AFFILIATION, COLLEGE_ADDRESS,
    ACADEMIC_YEAR, STAGE_TEXT, GUIDE_NAME, GUIDE_DESIGNATION,
    DEPARTMENT_NAME, TEAM_MEMBERS, ABSTRACT_TEXT, KEYWORDS
)

from build_full_report import (
    set_page_setup, set_cell_margins, set_cell_shading, set_table_borders,
    format_p, add_body_p, add_bullet_p, add_heading_1, add_heading_2, add_heading_3,
    add_figure, add_custom_table, make_callout_box
)

ROOT = Path(r"C:\Hemanth\Projects\MedGuide_AI")
OUTPUT_DIR = ROOT / "Major_Project_Stage_1_Report_Outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

# Image paths
IMG_DIR_ARCH = ROOT / "Minor_Project_Outputs" / "Architecture_and_Database_Diagrams"
IMG_DIR_BACK = ROOT / "Minor_Project_Outputs" / "Backend_Screenshots"
IMG_DIR_FRONT = ROOT / "Minor_Project_Outputs" / "Frontend_Screenshots"
IMG_DIR_MOBILE = ROOT / "mobile"

# ---------------------------------------------------------------------------
# SECTION BUILDERS
# ---------------------------------------------------------------------------

def build_preliminary_pages(doc):
    """Builds Title Page, Certificate, Declaration, Acknowledgment, Abstract, Contents, List of Figures, List of Tables."""
    set_page_setup(doc)
    
    # 1. Title Page
    p_title_pre = doc.add_paragraph()
    format_p(p_title_pre, space_before=12, space_after=12, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_title_pre.add_run(PROJECT_TITLE)
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    
    p_sub = doc.add_paragraph()
    format_p(p_sub, space_before=10, space_after=10, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_sub.add_run(f"{STAGE_TEXT}\n{DEGREE_TEXT}\n{DEGREE_NAME}\nIN\n{BRANCH_NAME}")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    
    p_by = doc.add_paragraph()
    format_p(p_by, space_before=14, space_after=6, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_by.add_run("Submitted by:")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    
    # Table of Team Members
    tbl_team = doc.add_table(rows=len(TEAM_MEMBERS), cols=2)
    tbl_team.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, member in enumerate(TEAM_MEMBERS):
        row = tbl_team.rows[idx]
        c0 = row.cells[0]
        c1 = row.cells[1]
        p0 = c0.paragraphs[0]
        format_p(p0, space_before=2, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT)
        r0 = p0.add_run(member["name"])
        r0.bold = True
        r0.font.name = "Times New Roman"
        r0.font.size = Pt(11)
        
        p1 = c1.paragraphs[0]
        format_p(p1, space_before=2, space_after=2, align=WD_ALIGN_PARAGRAPH.RIGHT)
        r1 = p1.add_run(f"({member['htno']})")
        r1.bold = True
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(11)
        c0.width = Cm(8.0)
        c1.width = Cm(5.0)
    
    p_guide = doc.add_paragraph()
    format_p(p_guide, space_before=16, space_after=4, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_guide.add_run(f"Under the Esteemed Guidance of\n")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r_g = p_guide.add_run(f"{GUIDE_NAME}\n{GUIDE_DESIGNATION}")
    r_g.bold = True
    r_g.font.name = "Times New Roman"
    r_g.font.size = Pt(12)
    
    p_inst = doc.add_paragraph()
    format_p(p_inst, space_before=20, space_after=4, align=WD_ALIGN_PARAGRAPH.CENTER)
    r_dept = p_inst.add_run(f"{DEPARTMENT_NAME}\n{COLLEGE_NAME}\n")
    r_dept.bold = True
    r_dept.font.name = "Times New Roman"
    r_dept.font.size = Pt(13)
    r_aff = p_inst.add_run(f"{COLLEGE_AFFILIATION}\n{COLLEGE_ADDRESS}\nACADEMIC YEAR: {ACADEMIC_YEAR}")
    r_aff.font.name = "Times New Roman"
    r_aff.font.size = Pt(10)
    
    # 2. Certificate
    doc.add_page_break()
    p_cert_head = doc.add_paragraph()
    format_p(p_cert_head, space_before=12, space_after=12, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_cert_head.add_run(f"{COLLEGE_NAME}\n{DEPARTMENT_NAME}")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    
    p_cert_title = doc.add_paragraph()
    format_p(p_cert_title, space_before=10, space_after=16, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_cert_title.add_run("CERTIFICATE")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    
    add_body_p(
        doc,
        f"This is to certify that the project report entitled \"{PROJECT_TITLE}\" is a bonafide record of work "
        f"carried out by Kamidi Vinay Venkateshulu (23E51A6772), Konda Mahesh Sri Sai (23E51A6781), "
        f"Nocharla Venkatesh (23E51A67C0), and Pangoth Hemanth Nayak (23E51A67C5) in partial fulfillment of the "
        f"requirements for the award of the degree of Bachelor of Technology in Computer Science and Engineering (Data Science) "
        f"from Hyderabad Institute of Technology and Management (HITAM), affiliated to Jawaharlal Nehru Technological "
        f"University Hyderabad (JNTUH), during the academic year 2026–2027."
    )
    add_body_p(
        doc,
        "The results embodied in this report have been verified against real codebase implementations, automated unit and "
        "integration suites, and verified literature benchmarks, and have not been submitted to any other university or "
        "institution for the award of any degree or diploma."
    )
    
    # Signatures Table
    doc.add_paragraph()
    tbl_sig = doc.add_table(rows=2, cols=3)
    tbl_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    sigs = [
        (f"{GUIDE_NAME}\nInternal Guide\nAssistant Professor, CSE (DS)", "Internal Guide"),
        ("Head of Department\nCSE (Data Science)\nHITAM", "Head of the Department"),
        ("Principal\nHITAM\nHyderabad", "Principal")
    ]
    for idx, (sig_text, title) in enumerate(sigs):
        cell_top = tbl_sig.cell(0, idx)
        cell_bot = tbl_sig.cell(1, idx)
        p_t = cell_top.paragraphs[0]
        format_p(p_t, space_before=36, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
        r = p_t.add_run("_____________________\n")
        r.font.name = "Times New Roman"
        r.font.size = Pt(10)
        p_b = cell_bot.paragraphs[0]
        format_p(p_b, space_before=2, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
        r_b = p_b.add_run(sig_text)
        r_b.bold = True
        r_b.font.name = "Times New Roman"
        r_b.font.size = Pt(10)
        cell_top.width = Cm(5.0)
        cell_bot.width = Cm(5.0)
        
    p_ext = doc.add_paragraph()
    format_p(p_ext, space_before=30, space_after=4, align=WD_ALIGN_PARAGRAPH.LEFT)
    r = p_ext.add_run("External Examiner: _______________________          Date of Evaluation: _______________")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    
    # 3. Declaration
    doc.add_page_break()
    p_dec_head = doc.add_paragraph()
    format_p(p_dec_head, space_before=12, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_dec_head.add_run("DECLARATION")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    
    add_body_p(
        doc,
        f"We, the undersigned students of the Department of Computer Science and Engineering (Data Science), Hyderabad "
        f"Institute of Technology and Management (HITAM), hereby declare that the Stage 1 Major Project report entitled "
        f"\"{PROJECT_TITLE}\" is our original work conducted under the guidance of Ms. Richa Tiwari, Assistant Professor."
    )
    add_body_p(
        doc,
        "We affirm that this project adheres to high standards of academic and healthcare engineering integrity. MedGuide AI "
        "is explicitly engineered as an assistive, multilingual rural healthcare intelligence and clinical decision-support tool; "
        "it does not provide autonomous clinical diagnoses, nor does it replace licensed healthcare professionals. "
        "All data representations, database models, API routes, and RAG evaluation statistics reported herein represent authentic "
        "experimental outcomes verified within the project repository."
    )
    
    tbl_dec = doc.add_table(rows=len(TEAM_MEMBERS), cols=3)
    tbl_dec.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, member in enumerate(TEAM_MEMBERS):
        row = tbl_dec.rows[idx]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        p0 = c0.paragraphs[0]; format_p(p0, space_before=4, space_after=4, align=WD_ALIGN_PARAGRAPH.LEFT)
        r0 = p0.add_run(member["name"]); r0.bold = True; r0.font.name = "Times New Roman"; r0.font.size = Pt(11)
        p1 = c1.paragraphs[0]; format_p(p1, space_before=4, space_after=4, align=WD_ALIGN_PARAGRAPH.CENTER)
        r1 = p1.add_run(member["htno"]); r1.font.name = "Times New Roman"; r1.font.size = Pt(11)
        p2 = c2.paragraphs[0]; format_p(p2, space_before=4, space_after=4, align=WD_ALIGN_PARAGRAPH.RIGHT)
        r2 = p2.add_run("Signature: __________________"); r2.font.name = "Times New Roman"; r2.font.size = Pt(11)
        c0.width = Cm(6.5); c1.width = Cm(3.5); c2.width = Cm(5.2)

    # 4. Acknowledgment
    doc.add_page_break()
    p_ack_head = doc.add_paragraph()
    format_p(p_ack_head, space_before=12, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_ack_head.add_run("ACKNOWLEDGMENT")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    
    add_body_p(
        doc,
        "We express our profound gratitude to our internal guide, Ms. Richa Tiwari, Assistant Professor, Department of "
        "Computer Science and Engineering (Data Science), for her invaluable guidance, rigorous technical feedback, and continuous "
        "encouragement throughout the conceptualization, architecture design, and Stage 1 implementation of MedGuide AI."
    )
    add_body_p(
        doc,
        "We extend our sincere thanks to the Head of the Department, Computer Science and Engineering (Data Science), and to "
        "our respected Principal, Hyderabad Institute of Technology and Management, for providing state-of-the-art computational "
        "laboratories, high-speed research facilities, and an encouraging academic environment."
    )
    add_body_p(
        doc,
        "We also acknowledge the open-source software and open-access healthcare research communities, including the World Health "
        "Organization (WHO), the Indian Council of Medical Research (ICMR), the National Health Mission (NHM), Hugging Face, "
        "FastAPI, and PostgreSQL/pgvector contributors, whose authoritative clinical guidelines and software tools made "
        "this low-resource rural healthcare research possible."
    )
    
    # 5. Abstract & Keywords
    doc.add_page_break()
    p_abs_head = doc.add_paragraph()
    format_p(p_abs_head, space_before=12, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_abs_head.add_run("ABSTRACT")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    
    for para in ABSTRACT_TEXT.split("\n\n"):
        add_body_p(doc, para)
        
    p_kw = doc.add_paragraph()
    format_p(p_kw, space_before=8, space_after=4, align=WD_ALIGN_PARAGRAPH.LEFT)
    r_kwh = p_kw.add_run("Keywords: ")
    r_kwh.bold = True
    r_kwh.font.name = "Times New Roman"
    r_kwh.font.size = Pt(11.5)
    r_kwt = p_kw.add_run(", ".join(KEYWORDS))
    r_kwt.font.name = "Times New Roman"
    r_kwt.font.size = Pt(11.5)
    
    # 6. Table of Contents
    doc.add_page_break()
    p_toc_head = doc.add_paragraph()
    format_p(p_toc_head, space_before=12, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_toc_head.add_run("TABLE OF CONTENTS")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    
    toc_data = [
        ("Certificate", "ii"),
        ("Declaration", "iii"),
        ("Acknowledgment", "iv"),
        ("Abstract & Keywords", "v"),
        ("Table of Contents", "vi"),
        ("List of Figures", "viii"),
        ("List of Tables", "ix"),
        ("1. INTRODUCTION", "1"),
        ("   1.1 About the Project", "1"),
        ("   1.2 Socio-Economic and Geographical Motivation", "2"),
        ("   1.3 Research Objectives and Core Engineering Goals", "3"),
        ("   1.4 Stakeholders and Operational Context", "3"),
        ("   1.5 Features and Functional Modules", "4"),
        ("   1.6 Approved Scope, MVP Boundaries, and Exclusions", "5"),
        ("2. PROBLEM STATEMENT", "6"),
        ("   2.1 Distance, Language, and Digital-Literacy Barriers", "6"),
        ("   2.2 Reliability and Safety Challenges in Healthcare Information", "7"),
        ("   2.3 Prescription Understanding and Medication Support", "7"),
        ("   2.4 Care Discontinuity and Healthcare-Worker Coordination", "8"),
        ("   2.5 Technical Problem Definition and Research Questions", "8"),
        ("3. LITERATURE SURVEY", "10"),
        ("   3.1 Online Symptom Checkers and Health Information Seeking", "10"),
        ("   3.2 Large Language Models in Healthcare", "10"),
        ("   3.3 Retrieval-Augmented Generation (RAG)", "11"),
        ("   3.4 Multilingual Embeddings and Cross-Language Retrieval", "11"),
        ("   3.5 Speech Recognition and Text-to-Speech in Healthcare", "12"),
        ("   3.6 Prescription OCR and Information Extraction", "12"),
        ("   3.7 Comparative Literature Matrix", "13"),
        ("   3.8 Research Gaps and Relevance to MedGuide AI", "14"),
        ("4. EXISTING SYSTEM", "15"),
        ("   4.1 Public Search Engines and Health Portals", "15"),
        ("   4.2 Rule-Based Symptom Assessment Systems", "15"),
        ("   4.3 General-Purpose and Cloud-Based Language Models", "16"),
        ("   4.4 Telemedicine and Personal Health Record Systems", "16"),
        ("   4.5 Comparative Limitations and Design Implications", "17"),
        ("5. PROPOSED METHODOLOGY", "19"),
        ("   5.1 Overall System Architecture", "19"),
        ("   5.2 Web Application Architecture and Route Inventory", "19"),
        ("   5.3 Mobile Application Architecture and Screen Inventory", "20"),
        ("   5.4 FastAPI Backend Modules and API Contracts", "22"),
        ("   5.5 Relational Database Architecture and Data Dictionary", "23"),
        ("   5.6 Medical Document Ingestion and RAG Pipeline", "26"),
        ("   5.7 Vector Storage and Similarity Retrieval", "27"),
        ("   5.8 Deterministic Safety Checks and Escalation", "28"),
        ("   5.9 AI Providers, Local Models, and Sarvam AI Integrations", "29"),
        ("   5.10 Prescription OCR and Multilingual Speech Pipelines", "29"),
        ("   5.11 Authentication, Authorization, Permissions, and Consent", "30"),
        ("   5.12 Security, Privacy, Reliability, and Error Handling", "30"),
        ("   5.13 Complete End-to-End Workflows", "31"),
        ("   5.14 Testing and Evaluation Methodology", "31"),
        ("   5.15 Offline Behavior and Synchronization", "32"),
        ("   5.16 Deployment, Maintenance, and Configuration", "32"),
        ("6. HARDWARE AND SOFTWARE REQUIREMENTS", "33"),
        ("   6.1 Development and Server Hardware", "33"),
        ("   6.2 Web and Mobile Client Requirements", "33"),
        ("   6.3 Frameworks, Libraries, and Runtime Versions", "34"),
        ("   6.4 External Services and Optional Dependencies", "35"),
        ("   6.5 Environment Configuration and Deployment Requirements", "35"),
        ("7. EXPECTED OUTPUT", "36"),
        ("   7.1 Stage 1 Deliverables and Implementation Status", "36"),
        ("   7.2 Web Application Output Screens", "37"),
        ("   7.3 Mobile Application Output Screens", "40"),
        ("   7.4 Backend API and Database Outputs", "41"),
        ("   7.5 Safety and RAG Response Examples", "41"),
        ("   7.6 OCR, Verification, and Medication Workflow Outputs", "42"),
        ("   7.7 Evaluation Plan, Available Results, and Remaining Gaps", "42"),
        ("8. CONCLUSION", "43"),
        ("   8.1 Summary of the Proposed System", "43"),
        ("   8.2 Engineering Contributions and Lessons", "43"),
        ("   8.3 Current Limitations", "43"),
        ("   8.4 Stage 2 Implementation and Evaluation Plan", "44"),
        ("   8.5 Future Enhancements Within the Approved Scope", "44"),
        ("9. REFERENCES", "45"),
        ("APPENDICES", "47"),
        ("   Appendix A: Complete Route and Screen Inventories", "47"),
        ("   Appendix B: Backend API Endpoint Specifications", "47"),
        ("   Appendix C: Relational Database Schema & Migrations", "48"),
        ("   Appendix D: Verification Transcripts & Test Logs", "48")
    ]
    
    tbl_toc = doc.add_table(rows=len(toc_data), cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (title, page) in enumerate(toc_data):
        row = tbl_toc.rows[idx]
        c0, c1 = row.cells[0], row.cells[1]
        p0 = c0.paragraphs[0]; format_p(p0, space_before=1, space_after=1, align=WD_ALIGN_PARAGRAPH.LEFT)
        r0 = p0.add_run(title)
        if title.startswith(("1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "APP")):
            r0.bold = True
        r0.font.name = "Times New Roman"; r0.font.size = Pt(10.5)
        p1 = c1.paragraphs[0]; format_p(p1, space_before=1, space_after=1, align=WD_ALIGN_PARAGRAPH.RIGHT)
        r1 = p1.add_run(page)
        if title.startswith(("1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "APP")):
            r1.bold = True
        r1.font.name = "Times New Roman"; r1.font.size = Pt(10.5)
        c0.width = Cm(13.5); c1.width = Cm(2.0)
        
    # 7. List of Figures
    doc.add_page_break()
    p_lof_head = doc.add_paragraph()
    format_p(p_lof_head, space_before=12, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_lof_head.add_run("LIST OF FIGURES")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    
    figures_list = [
        ("Figure 1.1", "System Architecture of the MedGuide AI Rural Healthcare Intelligence Platform", "4"),
        ("Figure 2.1", "Conceptual Evolution from Healthcare Information Seeking to Grounded Decision Support", "9"),
        ("Figure 4.1", "Medical Document Ingestion, Semantic Chunking, and Vectorization Pipeline", "18"),
        ("Figure 4.2", "Proposed Local Multi-Container Deployment Architecture using Docker Compose", "18"),
        ("Figure 5.1", "FastAPI Interactive OpenAPI / Swagger Documentation and Route Explorer", "22"),
        ("Figure 8.1", "Entity-Relationship (ER) Diagram of the Unified Relational and pgvector Database", "26"),
        ("Figure 6.2", "UML Sequence Diagram of Deterministic Emergency Interception and Grounded RAG Flow", "31"),
        ("Figure 6.1", "High-Level Software Component and Service Orchestration Architecture", "35"),
        ("Figure 7.1", "MedGuide AI Next.js Authenticated Patient Chat Interface with Clinical Ingestion", "37"),
        ("Figure 7.2", "Deterministic Red-Flag Interception Badge (Tier 1 Critical Emergency Directive)", "38"),
        ("Figure 7.3", "Evidence-Gated Moderate-Risk Clinical Response (Tier 2 Primary Consultation)", "39"),
        ("Figure 7.4", "Low-Acuity Self-Care Guidance and Observation Response (Tier 3 Supportive Care)", "39"),
        ("Figure 7.5", "Traceable Medical Source Attribution Inspector with Document Page References", "40"),
        ("Figure 7.6", "React Native / Expo Mobile App Welcome and Multilingual Onboarding Flow", "40"),
        ("Figure 7.7", "Mobile Daily Care Dashboard with Medication Adherence Tracking and Symptom Logs", "41"),
        ("Figure 8.2", "psql Verification Transcript of Cosine Vector Distance Query on WHO Guidelines", "41"),
        ("Figure 5.2", "Local Execution and Response Verification of Quantized Llama 3.2:3B via Ollama", "42")
    ]
    
    tbl_lof = doc.add_table(rows=len(figures_list), cols=3)
    tbl_lof.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (fnum, ftitle, fpage) in enumerate(figures_list):
        row = tbl_lof.rows[idx]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        p0 = c0.paragraphs[0]; format_p(p0, space_before=2, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT)
        r0 = p0.add_run(fnum); r0.bold = True; r0.font.name = "Times New Roman"; r0.font.size = Pt(10.5)
        p1 = c1.paragraphs[0]; format_p(p1, space_before=2, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT)
        r1 = p1.add_run(ftitle); r1.font.name = "Times New Roman"; r1.font.size = Pt(10.5)
        p2 = c2.paragraphs[0]; format_p(p2, space_before=2, space_after=2, align=WD_ALIGN_PARAGRAPH.RIGHT)
        r2 = p2.add_run(fpage); r2.font.name = "Times New Roman"; r2.font.size = Pt(10.5)
        c0.width = Cm(2.5); c1.width = Cm(11.0); c2.width = Cm(1.8)
        
    # 8. List of Tables
    doc.add_page_break()
    p_lot_head = doc.add_paragraph()
    format_p(p_lot_head, space_before=12, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_lot_head.add_run("LIST OF TABLES")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    
    tables_list = [
        ("Table 1.1", "Approved MVP Boundaries, Functional Modules, and Explicit Scope Exclusions", "5"),
        ("Table 3.1", "Comparative Literature Matrix of Healthcare AI, Triage, and RAG Systems", "13"),
        ("Table 4.1", "Systematic Comparison of Healthcare Information Paradigms vs. MedGuide AI", "17"),
        ("Table 5.1", "Complete Inventory of Next.js Web Application Routes and Access Controls", "20"),
        ("Table 5.2", "Complete Inventory of React Native / Expo Mobile Application Screens", "21"),
        ("Table 5.3", "FastAPI Core Application Modules and Service Responsibilities", "22"),
        ("Table 5.4", "Unified Relational and Vector Database Entity Catalog (27 Tables)", "24"),
        ("Table 5.6", "Deterministic Red-Flag Clinical Ontology and Emergency Interception Criteria", "28"),
        ("Table 6.1", "Development, Testing, and Target Server Hardware Specifications", "33"),
        ("Table 6.2", "Software Frameworks, Runtime Environments, and Core Library Dependencies", "34"),
        ("Table 7.1", "Stage 1 Architectural Deliverables and Implementation Verification Status", "36"),
        ("Table 7.2", "Empirical Vector Retrieval Results on WHO Primary Care Guidelines", "42")
    ]
    
    tbl_lot = doc.add_table(rows=len(tables_list), cols=3)
    tbl_lot.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (tnum, ttitle, tpage) in enumerate(tables_list):
        row = tbl_lot.rows[idx]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        p0 = c0.paragraphs[0]; format_p(p0, space_before=2, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT)
        r0 = p0.add_run(tnum); r0.bold = True; r0.font.name = "Times New Roman"; r0.font.size = Pt(10.5)
        p1 = c1.paragraphs[0]; format_p(p1, space_before=2, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT)
        r1 = p1.add_run(ttitle); r1.font.name = "Times New Roman"; r1.font.size = Pt(10.5)
        p2 = c2.paragraphs[0]; format_p(p2, space_before=2, space_after=2, align=WD_ALIGN_PARAGRAPH.RIGHT)
        r2 = p2.add_run(tpage); r2.font.name = "Times New Roman"; r2.font.size = Pt(10.5)
        c0.width = Cm(2.5); c1.width = Cm(11.0); c2.width = Cm(1.8)

    print("Preliminary pages built successfully.")

print("Preliminary builder defined.")

