# -*- coding: utf-8 -*-
"""
MedGuide AI — Master Major Project Report Builder
Assembles:
1. MAJOR_1_Preliminary_Pages.docx & PDF
2. MAJOR_2_Technical_Report.docx & PDF
3. MedGuide_AI_Stage_1_Major_Project_Report.docx & PDF
"""

import os
import sys
import time
from pathlib import Path

# pyrefly: ignore[missing-import]
import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

from report_data import (
    PROJECT_TITLE, DEGREE_TEXT, DEGREE_NAME, BRANCH_NAME,
    COLLEGE_NAME, COLLEGE_AFFILIATION, COLLEGE_ADDRESS,
    ACADEMIC_YEAR, STAGE_TEXT, GUIDE_NAME, GUIDE_DESIGNATION,
    DEPARTMENT_NAME, TEAM_MEMBERS, ABSTRACT_TEXT, KEYWORDS
)

from build_full_report import set_page_setup
from generate_all_reports import build_preliminary_pages
from chapters_1_to_4 import build_chapter_1, build_chapter_2, build_chapter_3, build_chapter_4
from chapter_5 import build_chapter_5
from chapters_6_to_9 import build_chapter_6, build_chapter_7, build_chapter_8, build_chapter_9, build_appendices

ROOT = Path(r"C:\Hemanth\Projects\MedGuide_AI")
OUTPUT_DIR = ROOT / "Major_Project_Stage_1_Report_Outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

IMG_DIR_ARCH = ROOT / "Minor_Project_Outputs" / "Architecture_and_Database_Diagrams"
IMG_DIR_BACK = ROOT / "Minor_Project_Outputs" / "Backend_Screenshots"
IMG_DIR_FRONT = ROOT / "Minor_Project_Outputs" / "Frontend_Screenshots"
IMG_DIR_MOBILE = ROOT / "mobile"

def generate_major_1():
    print("\n--- Generating MAJOR_1: Preliminary Pages ---")
    doc = docx.Document()
    build_preliminary_pages(doc)
    out_docx = OUTPUT_DIR / "MAJOR_1_Preliminary_Pages.docx"
    doc.save(str(out_docx))
    print(f"Saved: {out_docx} ({out_docx.stat().st_size:,} bytes)")
    return out_docx

def generate_major_2():
    print("\n--- Generating MAJOR_2: Technical Report ---")
    doc = docx.Document()
    set_page_setup(doc)
    
    # Build all technical chapters
    print("Building Chapter 1...")
    build_chapter_1(doc, IMG_DIR_ARCH)
    print("Building Chapter 2...")
    build_chapter_2(doc, IMG_DIR_ARCH)
    print("Building Chapter 3...")
    build_chapter_3(doc)
    print("Building Chapter 4...")
    build_chapter_4(doc, IMG_DIR_ARCH)
    print("Building Chapter 5...")
    build_chapter_5(doc, IMG_DIR_ARCH, IMG_DIR_BACK, IMG_DIR_FRONT, IMG_DIR_MOBILE)
    print("Building Chapter 6...")
    build_chapter_6(doc, IMG_DIR_ARCH)
    print("Building Chapter 7...")
    build_chapter_7(doc, IMG_DIR_ARCH, IMG_DIR_BACK, IMG_DIR_FRONT, IMG_DIR_MOBILE)
    print("Building Chapter 8...")
    build_chapter_8(doc)
    print("Building Chapter 9 (References)...")
    build_chapter_9(doc)
    print("Building Appendices...")
    build_appendices(doc)
    
    out_docx = OUTPUT_DIR / "MAJOR_2_Technical_Report.docx"
    doc.save(str(out_docx))
    print(f"Saved: {out_docx} ({out_docx.stat().st_size:,} bytes)")
    return out_docx

def generate_unified_report():
    print("\n--- Generating Unified Stage 1 Major Project Report ---")
    doc = docx.Document()
    set_page_setup(doc)
    
    # 1. Preliminary pages
    print("Adding Preliminary Pages...")
    build_preliminary_pages(doc)
    
    # 2. Technical chapters
    print("Adding Technical Chapters 1 through 9 & Appendices...")
    build_chapter_1(doc, IMG_DIR_ARCH)
    build_chapter_2(doc, IMG_DIR_ARCH)
    build_chapter_3(doc)
    build_chapter_4(doc, IMG_DIR_ARCH)
    build_chapter_5(doc, IMG_DIR_ARCH, IMG_DIR_BACK, IMG_DIR_FRONT, IMG_DIR_MOBILE)
    build_chapter_6(doc, IMG_DIR_ARCH)
    build_chapter_7(doc, IMG_DIR_ARCH, IMG_DIR_BACK, IMG_DIR_FRONT, IMG_DIR_MOBILE)
    build_chapter_8(doc)
    build_chapter_9(doc)
    build_appendices(doc)
    
    out_docx = OUTPUT_DIR / "MedGuide_AI_Stage_1_Major_Project_Report.docx"
    doc.save(str(out_docx))
    print(f"Saved: {out_docx} ({out_docx.stat().st_size:,} bytes)")
    return out_docx

def convert_to_pdf(docx_path):
    pdf_path = docx_path.with_suffix(".pdf")
    print(f"Converting to PDF: {docx_path.name} -> {pdf_path.name}...")
    time.sleep(1.5)
    for attempt in range(1, 4):
        try:
            from docx2pdf import convert
            convert(str(docx_path), str(pdf_path))
            print(f"Successfully generated PDF: {pdf_path} ({pdf_path.stat().st_size:,} bytes)")
            return pdf_path
        except Exception as e:
            print(f"Attempt {attempt} failed for {docx_path.name}: {e}")
            time.sleep(3)
    return None

def main():
    start_time = time.time()
    print("===================================================================")
    print("  MEDGUIDE AI — BTECH STAGE 1 MAJOR PROJECT REPORT COMPILATION")
    print("  Institution: Hyderabad Institute of Technology and Management")
    print("===================================================================")
    
    p1 = generate_major_1()
    p2 = generate_major_2()
    p3 = generate_unified_report()
    
    print("\n--- Converting Generated Word Documents to PDF ---")
    convert_to_pdf(p1)
    convert_to_pdf(p2)
    convert_to_pdf(p3)
    
    elapsed = time.time() - start_time
    print(f"\nAll report deliverables completed in {elapsed:.2f} seconds.")
    print(f"Outputs located at: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()

