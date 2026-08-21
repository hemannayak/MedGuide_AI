"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageSquareHeart, ShieldCheck, ArrowRight } from "lucide-react";
import { MedButton } from "@/components/ui/med-button";

export const MedGuideHero: React.FC = () => {
  return (
    <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 bg-[#FCFCFA]">
      {/* Deep Rich Saffron-Orange, Sky-Blue & Medical Teal Continuous Ambient Flow */}
      <div className="absolute top-0 inset-x-0 h-[1800px] pointer-events-none overflow-hidden z-0 [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)]">
        {/* Full-bleed Top Edge Saffron Background */}
        <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_150%_100%_at_50%_0%,#B33000_0%,#D34300_30%,#E65700_60%,transparent_100%)] opacity-95" />
        
        {/* Deep Central Saffron-Orange Radiance Dome */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1600px] h-[750px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C83C00] via-[#E55200] via-45% to-transparent blur-2xl opacity-90 rounded-full" />
        
        {/* Warm Orange Mid Layer */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1300px] h-[650px] bg-gradient-to-b from-[#EE6808]/85 via-[#F78D20]/45 to-transparent blur-3xl rounded-full" />

        {/* Deep Sky-Blue Left Flank - Flowing smoothly down */}
        <div className="absolute top-0 -left-40 w-[900px] h-[1400px] bg-gradient-to-br from-[#1D5FD3]/50 via-[#3B82F6]/30 via-60% to-transparent blur-[100px] rounded-full" />

        {/* Deep Sky-Blue Right Flank - Flowing smoothly down */}
        <div className="absolute top-0 -right-40 w-[900px] h-[1400px] bg-gradient-to-bl from-[#1D5FD3]/50 via-[#3B82F6]/30 via-60% to-transparent blur-[100px] rounded-full" />

        {/* Transition Ambient Teal Radiance Flow into Capabilities */}
        <div className="absolute top-[800px] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0F766E]/15 via-teal-500/10 to-transparent blur-[90px] rounded-full" />
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-xs sm:text-sm font-semibold text-[#0F766E] uppercase tracking-widest">
              India&apos;s Sovereign AI Health Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-5xl sm:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[1.02] max-w-4xl mx-auto"
          >
            Healthcare for all from India
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Built on grounded clinical intelligence. Powered by Sarvam AI and Indic speech models. Delivering population-scale primary care access.
          </motion.p>

          {/* Dual Action Pill Buttons (Clean Inter Typography) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3"
          >
            <Link href="/app/chat" className="w-full sm:w-auto">
              <MedButton variant="primary" size="hero" className="w-full sm:w-auto">
                Ask MedGuide
              </MedButton>
            </Link>

            <Link href="/contact" className="w-full sm:w-auto">
              <MedButton variant="secondary" size="hero" className="w-full sm:w-auto">
                Contact Us
              </MedButton>
            </Link>
          </motion.div>
        </div>

        {/* Bottom Trust & Foundation Partner Strip (Sarvam AI Inspired Logo Bar) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 sm:mt-24 pt-10"
        >
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              MEDGUIDE FOR INDIA IS BUILDING USING THE MENTIONED ORGANIZATIONS
            </span>
          </div>

          {/* Infinite Side-Scrolling Marquee Partner Logos Row */}
          <div className="w-full max-w-5xl mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-2">
            <motion.div
              className="flex items-center gap-12 sm:gap-16 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
            >
              {/* Set 1 */}
              <div className="flex items-center gap-12 sm:gap-16 shrink-0">
                {/* ICMR */}
                <div className="flex items-center justify-center h-10 sm:h-12 px-2 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/ICMR_ide35Ry-oj_1.svg"
                    alt="ICMR Logo"
                    width={140}
                    height={48}
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </div>

                {/* WHO */}
                <div className="flex items-center justify-center h-10 sm:h-12 px-2 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/World_Health_Organization_Logo.svg"
                    alt="World Health Organization Logo"
                    width={160}
                    height={48}
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </div>

                {/* Ayushman Bharat */}
                <div className="flex items-center justify-center h-10 sm:h-12 px-2 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/ayushman-bharat-english-seeklogo.png"
                    alt="Ayushman Bharat Logo"
                    width={160}
                    height={48}
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </div>

                {/* NHM */}
                <div className="flex items-center justify-center h-10 sm:h-12 px-2 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/national-health-mission-seeklogo.png"
                    alt="National Health Mission Logo"
                    width={150}
                    height={48}
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </div>

                {/* SARVAM AI */}
                <div className="flex items-center justify-center gap-2 h-10 sm:h-12 px-2 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/sarvam_logo_pack/logomark-dark.svg"
                    alt="Sarvam AI Mark"
                    width={28}
                    height={28}
                    className="h-5 sm:h-6 w-auto object-contain"
                  />
                  <Image
                    src="/sarvam_logo_pack/wordmark-dark.svg"
                    alt="Sarvam AI Logo"
                    width={100}
                    height={24}
                    className="h-4 sm:h-5 w-auto object-contain"
                  />
                </div>
              </div>

              {/* Set 2 (Duplicated for seamless loop) */}
              <div className="flex items-center gap-12 sm:gap-16 shrink-0">
                {/* ICMR */}
                <div className="flex items-center justify-center h-10 sm:h-12 px-2 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/ICMR_ide35Ry-oj_1.svg"
                    alt="ICMR Logo"
                    width={140}
                    height={48}
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </div>

                {/* WHO */}
                <div className="flex items-center justify-center h-10 sm:h-12 px-2 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/World_Health_Organization_Logo.svg"
                    alt="World Health Organization Logo"
                    width={160}
                    height={48}
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </div>

                {/* Ayushman Bharat */}
                <div className="flex items-center justify-center h-10 sm:h-12 px-2 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/ayushman-bharat-english-seeklogo.png"
                    alt="Ayushman Bharat Logo"
                    width={160}
                    height={48}
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </div>

                {/* NHM */}
                <div className="flex items-center justify-center h-10 sm:h-12 px-2 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/national-health-mission-seeklogo.png"
                    alt="National Health Mission Logo"
                    width={150}
                    height={48}
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </div>

                {/* SARVAM AI */}
                <div className="flex items-center justify-center gap-2 h-10 sm:h-12 px-2 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image
                    src="/sarvam_logo_pack/logomark-dark.svg"
                    alt="Sarvam AI Mark"
                    width={28}
                    height={28}
                    className="h-5 sm:h-6 w-auto object-contain"
                  />
                  <Image
                    src="/sarvam_logo_pack/wordmark-dark.svg"
                    alt="Sarvam AI Logo"
                    width={100}
                    height={24}
                    className="h-4 sm:h-5 w-auto object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
