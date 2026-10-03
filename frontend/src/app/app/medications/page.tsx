"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Pill,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  FileText,
  Search,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  BellRing,
} from "lucide-react";
import { MedFeedbackState } from "@/components/ui/med-feedback-states";
import { MedCard } from "@/components/ui/med-card";
import { MedButton } from "@/components/ui/med-button";
import { api } from "@/lib/api/client";
import { Medication, MedicationSchedule } from "@/types/medication";
import { StandardResponse } from "@/types/api";

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "ACTIVE" | "PENDING">("ALL");

  useEffect(() => {
    setLoading(true);
    api
      .getMedications()
      .then((res: StandardResponse<Medication[]>) => {
        if (res.success && res.data) {
          setMedications(res.data);
        }
      })
      .catch((err: unknown) => {
        console.error("Error loading medications:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredMeds = medications.filter((med) => {
    const matchesSearch =
      med.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.instructions.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === "ACTIVE") return med.status === "ACTIVE" && med.verification_status === "VERIFIED";
    if (selectedFilter === "PENDING") return med.verification_status === "PENDING";
    return true;
  });

  const pendingVerificationCount = medications.filter(
    (m) => m.verification_status === "PENDING"
  ).length;

  return (
    <div className="min-h-screen bg-[#FCFCFA] pb-24 sm:pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1">
              <Pill className="w-3.5 h-3.5" />
              <span>Patient Care Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Medications & Schedules
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/app/prescriptions">
              <MedButton variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1.5 text-slate-500" />
                Prescriptions
              </MedButton>
            </Link>
            <Link href="/app/prescriptions/upload">
              <MedButton variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Upload Rx
              </MedButton>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Safety & Verification Notice if any pending */}
        {pendingVerificationCount > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-amber-950">
                {pendingVerificationCount} Medication{pendingVerificationCount > 1 ? "s" : ""} Pending Review
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                Prescriptions extracted via OCR must be reviewed and confirmed. Never change or start unverified dosages without clinical advice.
              </p>
            </div>
            <Link href="/app/prescriptions">
              <span className="text-xs font-semibold text-amber-800 underline hover:text-amber-950 whitespace-nowrap">
                Review Now &rarr;
              </span>
            </Link>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by medicine name or dosage..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl self-start sm:self-auto">
            {(["ALL", "ACTIVE", "PENDING"] as const).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => setSelectedFilter(filterKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedFilter === filterKey
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {filterKey === "ALL" && "All"}
                {filterKey === "ACTIVE" && "Verified Active"}
                {filterKey === "PENDING" && "Pending Review"}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white border border-slate-200/60 p-5 animate-pulse flex items-center justify-between"
              >
                <div className="space-y-2.5 w-1/2">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                </div>
                <div className="h-8 w-24 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredMeds.length === 0 ? (
          <MedFeedbackState
            variant="empty"
            title="No medications found"
            description={
              searchQuery
                ? `No medications match "${searchQuery}". Try a different search.`
                : "You currently have no active or scheduled medications recorded."
            }
            actionLabel="Upload Prescription"
            onAction={() => {
              window.location.href = "/app/prescriptions/upload";
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMeds.map((med) => (
              <MedCard key={med.id} className="p-5 sm:p-6" hoverEffect={false}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                        {med.medicine_name}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                        {med.dosage}
                      </span>
                      {med.verification_status === "VERIFIED" ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertCircle className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {med.instructions}
                    </p>

                    {/* Schedules Strip */}
                    {med.schedules && med.schedules.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Schedules:
                        </span>
                        {med.schedules.map((sch: MedicationSchedule) => (
                          <span
                            key={sch.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold"
                          >
                            <BellRing className="w-3 h-3 text-teal-600" />
                            {sch.time_of_day} • {sch.dosage_amount}
                            {sch.meal_relation !== "INDEPENDENT" && ` (${sch.meal_relation.toLowerCase()} food)`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Added {new Date(med.created_at).toLocaleDateString()}
                    </span>
                    <Link href={`/app/medications/${med.id}`}>
                      <MedButton variant="outline" size="sm" className="text-xs">
                        Details <ChevronRight className="w-3 h-3 ml-1" />
                      </MedButton>
                    </Link>
                  </div>
                </div>
              </MedCard>
            ))}
          </div>
        )}

        {/* Footer Provenance Note */}
        <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <span>MedGuide AI Clinical Safety Framework</span>
          </div>
          <Link href="/app/medications/history" className="hover:underline text-[#0F766E] font-medium">
            View Adherence History &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
