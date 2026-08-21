"use client";

import React from "react";
import Link from "next/link";
import { PhoneCall, AlertTriangle, Hospital, ArrowLeft } from "lucide-react";
import { EMERGENCY_CONFIG } from "@/lib/config/emergency";

export default function EmergencyPage() {
  return (
    <div className="section-container py-8 space-y-8 max-w-4xl">
      {/* Back button */}
      <Link
        href="/app/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      {/* Immediate Static Clinical Red Hero Container */}
      <div
        className="rounded-3xl p-8 bg-[#B42318] text-white space-y-6 shadow-lg"
        role="region"
        aria-label="National Emergency Protocols"
      >
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-white/20 text-white">
          <AlertTriangle className="w-4 h-4" />
          EMERGENCY ESCALATION PROTOCOL
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl leading-tight text-white">
          National Emergency
          <br />
          Health Assistance
        </h1>

        <p className="text-sm sm:text-base leading-relaxed opacity-95 max-w-xl">
          If you or someone near you is experiencing life-threatening symptoms, initiate an emergency call immediately.
        </p>

        {/* Direct Call Action Buttons */}
        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href={`tel:${EMERGENCY_CONFIG.ambulanceNumber}`}
            className="inline-flex items-center gap-3 bg-white text-[#B42318] font-extrabold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-red-50 active:scale-95 transition-all min-h-[56px]"
            aria-label={EMERGENCY_CONFIG.ambulanceLabel}
          >
            <PhoneCall className="w-6 h-6" />
            {EMERGENCY_CONFIG.ambulanceLabel}
          </a>

          <a
            href={`tel:${EMERGENCY_CONFIG.nationalEmergencyNumber}`}
            className="inline-flex items-center gap-3 bg-white/10 text-white border-2 border-white/40 font-extrabold text-lg px-8 py-4 rounded-full hover:bg-white/20 active:scale-95 transition-all min-h-[56px]"
            aria-label={EMERGENCY_CONFIG.nationalEmergencyLabel}
          >
            <PhoneCall className="w-6 h-6" />
            {EMERGENCY_CONFIG.nationalEmergencyLabel}
          </a>
        </div>

        <p className="text-xs opacity-75">
          MedGuide AI displays national emergency contact numbers. The system does not automatically initiate calls without user action.
        </p>
      </div>

      {/* Recognized Red-Flag Conditions */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl text-[#161A24]">
          Recognising Medical Emergencies
        </h2>
        <p className="text-xs text-slate-500">
          Seek immediate emergency care if experiencing any of the following critical conditions:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EMERGENCY_CONFIG.emergencyRedFlags.map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-2xl border border-red-200 bg-red-50/60 space-y-1.5"
            >
              <h3 className="font-bold text-sm text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                {item.title}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Rural Healthcare Escalation */}
      <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-4 shadow-sm">
        <h2 className="font-serif text-2xl text-[#161A24]">
          Rural Primary Healthcare Escalation
        </h2>

        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <Hospital className="w-6 h-6 text-[#0F766E] shrink-0 mt-1" />
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-[#161A24] text-sm">
              Contact Local ASHA / ANM Worker Immediately
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Your local ASHA or ANM worker can facilitate emergency transport to the nearest Primary Health Centre (PHC), Sub-District Hospital, or CHC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
