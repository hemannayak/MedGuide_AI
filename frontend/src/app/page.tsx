"use client";

import React from "react";
import { MedGuideHero } from "@/components/marketing/hero/medguide-hero";
import { CapabilityMap } from "@/components/marketing/features/capability-map";
import { VoiceShowcase } from "@/components/marketing/features/voice-showcase";
import { SafetyPipeline } from "@/components/marketing/safety/safety-pipeline";
import { DeploymentModes } from "@/components/marketing/deployment/deployment-modes";
import { WhyMedGuide } from "@/components/marketing/comparison/why-medguide";
import { ResearchUpdates } from "@/components/marketing/research/research-updates";
import { HeroCtaCard } from "@/components/marketing/cta/hero-cta-card";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* 1. HERO SECTION */}
      <MedGuideHero />

      {/* 2. CAPABILITY MAP (ASK -> UNDERSTAND -> ACT) */}
      <CapabilityMap />

      {/* 3. VOICE & MULTILINGUAL SHOWCASE */}
      <VoiceShowcase />

      {/* 4. SAFETY ARCHITECTURE PIPELINE */}
      <SafetyPipeline />

      {/* 5. DEPLOYMENT MODES */}
      <DeploymentModes />

      {/* 6. WHY MEDGUIDE COMPARISON */}
      <WhyMedGuide />

      {/* 7. RESEARCH & UPDATES */}
      <ResearchUpdates />

      {/* 8. SARVAM AI INSPIRED HERO CTA CARD BEFORE FOOTER */}
      <HeroCtaCard />
    </div>
  );
}
