"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Smile,
  Meh,
  Frown,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { api } from "@/lib/api/client";
import { SymptomTriageResult, RiskLevel } from "@/types/symptom";
import { MedVoice } from "@/components/voice/med-voice";
import { MedButton } from "@/components/ui/med-button";
import { MedCard } from "@/components/ui/med-card";
import { MedBadge } from "@/components/ui/med-badge";

type PageState = "idle" | "submitting" | "result" | "error";

export default function SymptomCheckerPage() {
  const { t, language } = useLanguage();

  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState<string>("");
  const [severityScale, setSeverityScale] = useState<number | null>(null);

  const [pageState, setPageState] = useState<PageState>("idle");
  const [triageResult, setTriageResult] = useState<SymptomTriageResult | null>(null);

  const isValid =
    description.trim().length > 5 &&
    durationDays.trim() !== "" &&
    severityScale !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || pageState === "submitting") return;

    setPageState("submitting");
    try {
      const res = await api.submitSymptoms({
        symptoms_description: description,
        duration_days: Number(durationDays),
        severity_scale: severityScale!,
        language: language,
      });

      if (res.success && res.data) {
        setTriageResult(res.data);
        setPageState("result");
      } else {
        setPageState("error");
      }
    } catch {
      setPageState("error");
    }
  };

  const handleReset = () => {
    setDescription("");
    setDurationDays("");
    setSeverityScale(null);
    setTriageResult(null);
    setPageState("idle");
  };

  return (
    <div className="section-container py-10 max-w-4xl">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="pb-6 mb-8 border-b border-[#161A24]/10 space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#161A24]">
          {t("symptoms.title")}
        </h1>
        <p className="text-sm text-slate-500">
          4-step progressive symptom assessment to determine routine, urgent, or emergency care guidance.
        </p>
      </div>

      {/* ── 4-Step Progressive Indicator Bar ─────────────────────── */}
      <div className="grid grid-cols-4 gap-2 mb-8 text-center text-xs">
        <div className={`p-2.5 rounded-xl border transition-all ${
          description.trim().length > 5
            ? "bg-teal-50 border-[#0F766E] text-[#0F766E] font-bold"
            : "bg-white border-slate-200 text-slate-400"
        }`}>
          <div className="text-[10px] uppercase">01</div>
          <div>Experience</div>
        </div>

        <div className={`p-2.5 rounded-xl border transition-all ${
          durationDays.trim() !== ""
            ? "bg-teal-50 border-[#0F766E] text-[#0F766E] font-bold"
            : "bg-white border-slate-200 text-slate-400"
        }`}>
          <div className="text-[10px] uppercase">02</div>
          <div>Duration</div>
        </div>

        <div className={`p-2.5 rounded-xl border transition-all ${
          severityScale !== null
            ? "bg-teal-50 border-[#0F766E] text-[#0F766E] font-bold"
            : "bg-white border-slate-200 text-slate-400"
        }`}>
          <div className="text-[10px] uppercase">03</div>
          <div>Severity</div>
        </div>

        <div className={`p-2.5 rounded-xl border transition-all ${
          pageState === "result"
            ? "bg-teal-50 border-[#0F766E] text-[#0F766E] font-bold"
            : "bg-white border-slate-200 text-slate-400"
        }`}>
          <div className="text-[10px] uppercase">04</div>
          <div>Result</div>
        </div>
      </div>

      {/* ── Form & Result Container ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form Card */}
        <MedCard hoverEffect={false} className="space-y-6">
          <h2 className="font-semibold text-base text-[#161A24]">
            Report Symptoms
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Step 1: Experience */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="symptom-description"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Step 01 &bull; Describe your symptoms
                </label>
                <MedVoice
                  onTranscription={(text) =>
                    setDescription((prev) => (prev ? `${prev} ${text}` : text))
                  }
                />
              </div>
              <textarea
                id="symptom-description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. High fever for 3 days with chills, severe headache, and fatigue..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] resize-none"
              />
            </div>

            {/* Step 2: Duration */}
            <div className="space-y-2">
              <label
                htmlFor="duration-days"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Step 02 &bull; Duration (in days)
              </label>
              <input
                id="duration-days"
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="e.g. 3"
                className="w-full px-3.5 py-3 min-h-[48px] rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>

            {/* Step 3: Severity Large Choice Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Step 03 &bull; How severe does it feel?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverityScale(3)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    severityScale !== null && severityScale <= 3
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Smile className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <div className="text-xs">Mild</div>
                  <div className="text-[10px] text-slate-400">1 &ndash; 3</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverityScale(6)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    severityScale !== null && severityScale > 3 && severityScale <= 7
                      ? "bg-amber-50 border-amber-500 text-amber-800 font-bold shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Meh className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <div className="text-xs">Moderate</div>
                  <div className="text-[10px] text-slate-400">4 &ndash; 7</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverityScale(9)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    severityScale !== null && severityScale > 7
                      ? "bg-red-50 border-red-500 text-red-800 font-bold shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Frown className="w-5 h-5 mx-auto mb-1 text-red-600" />
                  <div className="text-xs">Severe</div>
                  <div className="text-[10px] text-slate-400">8 &ndash; 10</div>
                </button>
              </div>
            </div>

            {/* Submit */}
            <MedButton
              type="submit"
              disabled={!isValid || pageState === "submitting"}
              variant="primary"
              className="w-full"
              icon={
                pageState === "submitting" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
            >
              {pageState === "submitting" ? "Evaluating symptoms..." : "Submit for Triage"}
            </MedButton>
          </form>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Evaluated by rule-based safeguards. This tool does not provide a definitive clinical diagnosis.
          </p>
        </MedCard>

        {/* Result Display Panel */}
        <div>
          {pageState === "idle" && (
            <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6">
              <ClipboardList className="w-12 h-12 mb-3 text-slate-300" />
              <div className="font-semibold text-base text-slate-700 mb-1">
                Step 04 &bull; Triage result will appear here
              </div>
              <p className="text-xs text-slate-400">
                Complete the 3 steps on the left to evaluate your symptom risk level.
              </p>
            </div>
          )}

          {pageState === "submitting" && (
            <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
              <div className="loading-dots">
                <span />
                <span />
                <span />
              </div>
              <p className="text-xs font-medium text-slate-600">
                Checking symptoms against clinical triage rules...
              </p>
            </div>
          )}

          {pageState === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 mx-auto text-red-600" />
              <div className="font-bold text-red-900 text-sm">Unable to complete triage</div>
              <p className="text-xs text-slate-600">
                There was a network issue submitting your symptoms. Please try again.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-[#0F766E] hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {pageState === "result" && triageResult && (
            <MedCard hoverEffect={false} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-semibold text-sm text-[#161A24]">
                  Triage Risk Assessment
                </h3>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-[#0F766E] hover:underline font-medium"
                >
                  Check again
                </button>
              </div>

              {/* Risk Level Badge Card */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-700">
                  Evaluated Risk Level:
                </span>
                <MedBadge level={triageResult.risk_level} />
              </div>

              {/* Emergency Call Box if critical */}
              {triageResult.risk_level === RiskLevel.EMERGENCY && (
                <div className="p-4 rounded-xl bg-red-700 text-white space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                    CRITICAL &bull; IMMEDIATE MEDICAL HELP REQUIRED
                  </div>
                  <p className="text-xs opacity-95">
                    Your reported symptoms match emergency criteria. Dial 108 or 112 immediately.
                  </p>
                  <a
                    href="tel:108"
                    className="inline-flex items-center gap-2 bg-white text-red-700 font-extrabold px-4 py-2 rounded-full text-xs shadow-sm hover:bg-red-50"
                  >
                    <PhoneCall className="w-4 h-4" /> Dial 108 Ambulance
                  </a>
                </div>
              )}

              {/* Red flags */}
              {triageResult.red_flags_detected.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4" /> Red-Flag Indicators Detected:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {triageResult.red_flags_detected.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action recommendation */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Recommended Action:
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-800">
                  {triageResult.recommended_action}
                </div>
              </div>

              {/* Companion CTA */}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/app/chat"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Ask AI Companion for more details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </MedCard>
          )}
        </div>
      </div>
    </div>
  );
}
