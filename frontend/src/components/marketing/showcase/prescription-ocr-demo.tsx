"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Upload, ArrowRight, Table, CheckCircle2, SlidersHorizontal, Sparkles } from "lucide-react";

interface PresetExample {
  id: string;
  title: string;
  lang: string;
  extractedText: string;
  medicines: Array<{ name: string; dosage: string; schedule: string }>;
}

const PRESET_EXAMPLES: PresetExample[] = [
  {
    id: "handwritten",
    title: "Handwritten Prescription",
    lang: "Hindi / English",
    extractedText: "Tab. Paracetamol 500mg - 1 t.d.s after food for 3 days.\nSyr. Amoxicillin 125mg/5ml - 5ml b.i.d for 5 days.\nORS Sachet - 1 in 1L boiled water.",
    medicines: [
      { name: "Paracetamol 500mg", dosage: "1 Tablet", schedule: "3 times daily after food (3 days)" },
      { name: "Amoxicillin Syrup 125mg", dosage: "5 ml", schedule: "Twice daily after food (5 days)" },
      { name: "ORS Hydration Sachet", dosage: "1 Sachet in 1L Water", schedule: "Sip throughout the day" },
    ],
  },
  {
    id: "lab_report",
    title: "Diagnostic Blood Test",
    lang: "CBC Report",
    extractedText: "Hemoglobin: 11.2 g/dL (Slightly Low)\nWBC Count: 8,500 /uL (Normal)\nPlatelets: 240,000 /uL (Normal)",
    medicines: [
      { name: "Iron & Folic Acid Tablet", dosage: "1 Tablet daily", schedule: "Once daily after lunch (30 days)" },
      { name: "Vitamin C 500mg", dosage: "1 Tablet", schedule: "Once daily after breakfast" },
    ],
  },
  {
    id: "pharmacy_bill",
    title: "Pharmacy Dispensing Note",
    lang: "Telugu / English",
    extractedText: "Cetirizine 10mg - 1 tab at bedtime.\nAzithromycin 500mg - 1 tab daily for 3 days.",
    medicines: [
      { name: "Cetirizine 10mg", dosage: "1 Tablet", schedule: "At bedtime for 5 days" },
      { name: "Azithromycin 500mg", dosage: "1 Tablet", schedule: "Once daily before food (3 days)" },
    ],
  },
  {
    id: "table_extraction",
    title: "Table Extraction",
    lang: "Clinical Chart",
    extractedText: "Metformin 500mg - 1 BD after meals\nAtorvastatin 10mg - 1 HS at night\nTelmisartan 40mg - 1 OD morning",
    medicines: [
      { name: "Metformin 500mg", dosage: "1 Tablet", schedule: "Twice daily after meals" },
      { name: "Atorvastatin 10mg", dosage: "1 Tablet", schedule: "Once daily at bedtime" },
      { name: "Telmisartan 40mg", dosage: "1 Tablet", schedule: "Once daily in the morning" },
    ],
  },
];

export const PrescriptionOcrDemo: React.FC = () => {
  const [selectedExampleIdx, setSelectedExampleIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [sliderPos, setSliderPos] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeExample = PRESET_EXAMPLES[selectedExampleIdx];

  const handleUploadClick = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 800);
  };

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(10, Math.min(90, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-[#FAFAF8] space-y-8">
      {/* Main Grid matching Sarvam Vision Image 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: Title, Upload, Examples (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title Header */}
          <div className="space-y-1">
            <h3 className="font-sans text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">MedGuide Vision</h3>
            <p className="text-xs text-slate-500 font-normal">
              High-accuracy Indic prescription OCR and structured document digitisation.
            </p>
          </div>

          {/* Upload Card */}
          <div
            onClick={handleUploadClick}
            className="p-5 rounded-2xl border-2 border-dashed border-indigo-200 bg-white hover:bg-indigo-50/40 transition-colors cursor-pointer text-center space-y-2 group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">
                {isScanning ? "Scanning document..." : "Upload your own"}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                PNG, JPG, PDF (Handwritten &amp; Printed)
              </span>
            </div>
          </div>

          {/* Preset Examples List (Matching Image 3 Left Side Examples) */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              EXAMPLES
            </span>

            <div className="space-y-2">
              {PRESET_EXAMPLES.map((ex, idx) => {
                const isSelected = selectedExampleIdx === idx;
                return (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExampleIdx(idx)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-600/20"
                        : "bg-white/70 border-slate-200/80 hover:bg-white text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Document Thumbnail Preview Box */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                        <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <line x1="10" y1="9" x2="8" y2="9" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{ex.title}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{ex.lang}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Interactive Before / After Split Slider (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Interactive Split Slider Container */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            className="relative w-full h-[460px] rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden select-none cursor-ew-resize group"
          >
            {/* LAYER 1: AFTER VIEW (Extracted Digitized Text & Structured Output) - Full Background */}
            <div className="absolute inset-0 bg-white p-6 sm:p-8 flex flex-col justify-between overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Digitized Result
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase">
                    OCR Result
                  </span>
                </div>

                {/* Raw Extracted Text Box */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide block">
                    Extracted Raw Medical Text
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                    {activeExample.extractedText}
                  </div>
                </div>

                {/* Structured Medication Schedule Table */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-indigo-600" /> Structured Schedule
                  </span>
                  <div className="space-y-2">
                    {activeExample.medicines.map((med, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between text-xs gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">{med.name}</span>
                            <span className="text-[11px] text-slate-500 font-medium">{med.schedule}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700 text-[11px] shrink-0">
                          {med.dosage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LAYER 2: BEFORE VIEW (Original Prescription Scan) - Clipped by Slider Pos */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-[#F5F5F0] overflow-hidden border-r-2 border-indigo-600 z-10"
              style={{ width: `${sliderPos}%` }}
            >
              <div
                className="p-6 sm:p-8 h-full flex flex-col justify-between relative bg-[#FAFAF7]"
                style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%" }}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase shadow-2xs">
                    Enhanced Version
                  </span>
                </div>

                {/* Simulated Handwritten Prescription Canvas with Bounding Box */}
                <div className="my-auto p-6 rounded-2xl bg-white border-2 border-orange-500/80 shadow-md space-y-4 relative">
                  <div className="absolute top-2 right-3 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">
                    OCR Scan Region
                  </div>
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <div className="font-serif font-bold text-sm text-slate-900">Dr. Sharma Clinic</div>
                      <div className="text-[10px] text-slate-400">Primary Healthcare Centre</div>
                    </div>
                    <div className="text-xl font-serif text-slate-400 italic">Rx</div>
                  </div>

                  <div className="font-serif text-sm sm:text-base text-slate-800 leading-relaxed italic space-y-2 opacity-90">
                    <p className="border-b border-dashed border-slate-200 pb-1">
                      {activeExample.extractedText.split("\n")[0] || "Tab. Paracetamol 500mg 1 t.d.s"}
                    </p>
                    <p className="border-b border-dashed border-slate-200 pb-1">
                      {activeExample.extractedText.split("\n")[1] || "Syr. Amoxicillin 125mg/5ml"}
                    </p>
                    <p className="pb-1">
                      {activeExample.extractedText.split("\n")[2] || "ORS Sachet - 1 in 1L boiled water"}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  SCAN ID: RX-2026-MEDGUIDE-VISION
                </div>
              </div>
            </div>

            {/* DRAGGABLE SLIDER HANDLE BUTTON (Matching Image 3 Drag Handle) */}
            <div
              className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none"
              style={{ left: `calc(${sliderPos}% - 16px)` }}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg border-2 border-white pointer-events-auto cursor-ew-resize hover:scale-110 transition-transform">
                <SlidersHorizontal className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING CENTERED CTA BUTTON (Matching Image 3 Bottom Center Pill) */}
      <div className="flex justify-center pt-2">
        <Link
          href="/app/chat"
          className="px-6 py-3 rounded-full bg-[#0F766E] text-white font-bold text-xs sm:text-sm hover:bg-[#0D645D] transition-colors shadow-md inline-flex items-center gap-2"
        >
          Try Document Digitisation <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
