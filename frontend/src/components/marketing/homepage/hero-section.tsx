"use client";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  PlayCircle,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Action, Eyebrow } from "./shared";
import { MedGuidePhoneMockup } from "./device-mockups";
import styles from "./homepage.module.css";

export { PremiumNavbar as MarketingNavbar } from "./premium-navbar";
import { PremiumNavbar as MarketingNavbar } from "./premium-navbar";
export function HeroStats() {
  const stats = [
    {
      label: "Multilingual Support",
      value: "3",
      detail: "Phase-one languages",
      Icon: Brain,
    },
    {
      label: "Knowledge Sources",
      value: "Reviewed",
      detail: "Medical sources",
      Icon: BookOpen,
    },
    {
      label: "Built with",
      value: "RAG + LLM",
      detail: "Evidence-grounded",
      Icon: Settings,
    },
    {
      label: "Design Focus",
      value: "Safety First",
      detail: "Red-flag Detection",
      Icon: ShieldCheck,
    },
  ];
  return (
    <div className={styles.stats}>
      <div className={styles.statsGrid}>
        {stats.map(({ label, value, detail, Icon }, i) => (
          <div className={styles.stat} key={label}>
            <Icon aria-hidden="true" />
            <div>
              <p>{label}</p>
              <strong>
                {value}
                {i === 0 && <sup>*</sup>}
              </strong>
              <span>{detail}</span>
            </div>
          </div>
        ))}
      </div>
      <small className={styles.targetNote}>
        *English, Hindi, Telugu are the first-phase scope. AI performance has
        not been clinically validated.
      </small>
    </div>
  );
}
export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <MarketingNavbar />
      <div className={styles.heroCopy}>
        <Eyebrow>MEDGUIDE AI</Eyebrow>
        <h1 id="hero-title">
          Healthcare guidance,
          <br />
          <span>closer to home.</span>
        </h1>
        <p>
          Ask your questions in your language. Get evidence-based
          <br className={styles.desktopBreak} /> medical information, explained
          simply, with built-in safety guidance.
        </p>
        <div className={styles.heroButtons}>
          <Action>Try MedGuide</Action>
          <Link
            href="#how-it-works"
            className={`${styles.action} ${styles.secondary}`}
          >
            <PlayCircle size={19} />
            See how it works
          </Link>
        </div>
      </div>
      <MedGuidePhoneMockup className={styles.heroPhone} />
      <div className={styles.handwriting} aria-hidden="true">
        Your
        <br />
        Language.
        <br />
        <span>Our</span>
        <br />
        Understanding.
      </div>
      <svg
        className={styles.heroCurve}
        viewBox="0 0 220 210"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0 195 C110 153 110 28 220 5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <HeroStats />
    </section>
  );
}
