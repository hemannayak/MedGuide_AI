"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquareHeart,
  Activity,
  PhoneCall,
  ArrowRight,
  User,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { PatientProfile } from "@/types/user";
import { MedButton } from "@/components/ui/med-button";
import { MedCard } from "@/components/ui/med-card";
import { MedBadge } from "@/components/ui/med-badge";

export default function PatientDashboardPage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  useEffect(() => {
    api.getPatientProfile().then((res) => {
      if (res.success && res.data) {
        setProfile(res.data);
      }
    });
  }, []);

  return (
    <div className="section-container py-10 space-y-10">
      {/* ── Welcome Header ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#161A24]/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold">
              {(profile ? profile.full_name || "Ramesh Kumar" : "Patient").charAt(0)}
            </div>
            <span className="text-xs font-medium text-slate-500">
              Verified Patient &bull; {profile?.primary_language || "Telugu (తెలుగు)"}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#161A24]">
            Good day, {profile ? profile.full_name || "Ramesh Kumar" : "Ramesh Kumar"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {profile?.village_or_town || "Narsipatnam"},{" "}
            {profile?.state || "Andhra Pradesh"}
          </p>
        </div>

        <Link href="/app/chat">
          <MedButton variant="primary" icon={<MessageSquareHeart className="w-4.5 h-4.5" />}>
            Ask MedGuide
          </MedButton>
        </Link>
      </div>

      {/* ── Direct Primary Actions ─────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#0F766E]">
          What would you like to do?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Action 1: Ask AI Companion */}
          <Link href="/app/chat" className="group block">
            <MedCard className="h-full hover:border-[#0F766E]/30 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <MessageSquareHeart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#161A24] mb-1 group-hover:text-[#0F766E] transition-colors">
                  Ask AI Companion
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ask health questions through text or voice. Grounded in clinical reference sources.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0F766E] pt-2">
                Open companion <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </MedCard>
          </Link>

          {/* Action 2: Check Symptoms */}
          <Link href="/app/symptoms" className="group block">
            <MedCard className="h-full hover:border-sky-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#161A24] mb-1 group-hover:text-sky-700 transition-colors">
                  Symptom Checker
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  4-step progressive symptom assessment to determine routine, urgent, or emergency care.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 pt-2">
                Check symptoms <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </MedCard>
          </Link>

          {/* Action 3: Emergency */}
          <Link href="/app/emergency" className="group block">
            <div className="h-full border border-red-200 rounded-2xl p-6 bg-red-50/50 space-y-4 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-red-900 mb-1">
                  Emergency (108 / 112)
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Immediate emergency contacts, red-flag symptoms, and rural ASHA/ANM escalation guide.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 pt-2">
                Emergency guide <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Patient Profile & History ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <MedCard padding="sm" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-[#161A24]">Patient Information</h3>
            <Link href="/app/profile" className="text-xs text-[#0F766E] hover:underline inline-flex items-center gap-1 font-medium">
              <User className="w-3.5 h-3.5" /> Edit
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Age / Gender</span>
              <span className="font-medium text-[#161A24]">42 yrs / Male</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Blood Group</span>
              <span className="font-medium text-[#161A24]">O+</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Known Allergies</span>
              <span className="font-medium text-amber-700">Penicillin</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Emergency Contact</span>
              <span className="font-medium text-[#161A24]">Sunitha Kumar</span>
            </div>
          </div>
        </MedCard>

        {/* Recent Checks Timeline */}
        <MedCard padding="sm" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-[#161A24]">Recent Symptom Checks</h3>
            <span className="text-xs text-slate-400">Activity Log</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MedBadge level="ROUTINE" size="sm" />
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Yesterday, 4:30 PM
                  </span>
                </div>
                <div className="text-slate-700 font-medium">
                  Mild headache and throat irritation (1 day duration).
                </div>
              </div>
              <Link href="/app/symptoms" className="text-[#0F766E] font-bold shrink-0 hover:underline">
                View guidance &rarr;
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MedBadge level="URGENT" size="sm" />
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 3 days ago
                  </span>
                </div>
                <div className="text-slate-700 font-medium">
                  Fever 101°F persisting for 4 days with severe body aches.
                </div>
              </div>
              <Link href="/app/symptoms" className="text-[#0F766E] font-bold shrink-0 hover:underline">
                View guidance &rarr;
              </Link>
            </div>
          </div>
        </MedCard>
      </div>
    </div>
  );
}
