"use client";

import React from "react";
import { Cloud, Building2, WifiOff } from "lucide-react";

export const DeploymentModes: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-[#FAFAF8] relative overflow-hidden">
      <div className="section-container relative z-10">
        {/* Section Header (Matching Sarvam AI Reference) */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.08]">
            Built to run anywhere healthcare is needed
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-normal">
            Flexible deployment options designed for rural clinics, primary healthcare centers, and regional health authorities across India.
          </p>
        </div>

        {/* 3 Horizontal Deployment Cards (Matching Sarvam AI 3-Card Deployment Bar) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Option 1: MedGuide Cloud */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex items-center gap-5 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200/80 border border-indigo-200/60 shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Cloud className="w-7 h-7 text-indigo-600" />
            </div>

            <div className="space-y-1">
              <h3 className="italiana-regular font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                MedGuide Cloud
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Fully managed cloud portal, multi-tenant patient access, automatic scaling.
              </p>
            </div>
          </div>

          {/* Option 2: Private PHC Server */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex items-center gap-5 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 via-amber-100 to-rose-200/80 border border-rose-200/60 shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7 text-rose-600" />
            </div>

            <div className="space-y-1">
              <h3 className="italiana-regular font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                Private PHC Server
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Hospital intranet server, strict local security perimeter, full data residency.
              </p>
            </div>
          </div>

          {/* Option 3: Offline Edge App */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex items-center gap-5 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-200/80 border border-emerald-200/60 shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <WifiOff className="w-7 h-7 text-emerald-700" />
            </div>

            <div className="space-y-1">
              <h3 className="italiana-regular font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                Offline Edge App
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Offline-first local caching for zero-connectivity villages, auto-sync when online.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
