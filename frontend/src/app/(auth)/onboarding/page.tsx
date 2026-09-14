"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function OnboardingPage() {
  const router = useRouter();

  const [age, setAge] = useState<number | "">(42);
  const [village, setVillage] = useState("Narsipatnam");
  const [state, setState] = useState("Andhra Pradesh");
  const [allergies, setAllergies] = useState("Penicillin");
  const [consentGiven, setConsentGiven] = useState(false);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven || !disclaimerAgreed) return;
    router.push("/app/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card
        title="Welcome to MedGuide AI"
        subtitle="Complete your profile setup & consent agreement for preliminary AI health guidance."
      >
        <form onSubmit={handleComplete} className="space-y-6">
          {/* Medical & Consent Disclaimer Alert */}
          <Alert type="info" title="Patient Privacy & Safety Consent">
            MedGuide AI processes reported symptoms to provide preliminary health guidance and rule-based emergency triage. Your health information is protected and stored securely.
          </Alert>

          {/* Demographics Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
              Demographic Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 42"
                  className="w-full px-3 py-2.5 min-h-[48px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Known Medical Allergies
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs, None"
                  className="w-full px-3 py-2.5 min-h-[48px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Village / Town Name
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Narsipatnam"
                  className="w-full px-3 py-2.5 min-h-[48px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Andhra Pradesh"
                  className="w-full px-3 py-2.5 min-h-[48px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Mandatory Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 w-5 h-5 accent-teal-600 rounded"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                I give consent to MedGuide AI to process my health data solely for preliminary health guidance, symptom triage, and medical safety support. (M4 Consent Management)
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={disclaimerAgreed}
                onChange={(e) => setDisclaimerAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 accent-teal-600 rounded"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                I understand that MedGuide AI is an AI-assisted guidance platform and does <strong>NOT</strong> replace clinical diagnosis by a qualified medical professional.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={!consentGiven || !disclaimerAgreed}
            className="w-full font-semibold"
          >
            Complete Onboarding & Enter Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
