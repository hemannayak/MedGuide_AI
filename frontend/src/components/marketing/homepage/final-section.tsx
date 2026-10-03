"use client";
import { useState } from "react";
import Link from "next/link";
import { Action, Eyebrow, ReferenceDetail } from "./shared";
import { MedGuideDesktopMockup, MedGuidePhoneMockup } from "./device-mockups";
import styles from "./homepage.module.css";

export function AvailableEverywhere() {
  const [showAvailability, setShowAvailability] = useState(false);
  return (
    <section className={styles.available} aria-labelledby="available-title">
      <Eyebrow>AVAILABLE EVERYWHERE</Eyebrow>
      <h2 id="available-title">On web and mobile.</h2>
      <p>Access MedGuide on your preferred device.</p>
      <div className={styles.finalButtons}>
        <Action compact>Try Web App</Action>
        <button
          type="button"
          onClick={() => setShowAvailability(value => !value)}
          aria-expanded={showAvailability}
          aria-controls="mobile-availability"
          className={`${styles.action} ${styles.secondary} ${styles.compact}`}
          aria-label="Mobile app availability"
        >
          Mobile App Availability
        </button>
      </div>
      <small className={styles.downloadNote}>
        The web experience is available in your browser.
      </small>
      {showAvailability && <p id="mobile-availability" role="status" className={styles.downloadNote}>A downloadable mobile app is not available yet. You can use the responsive web app on your phone through Try Web App.</p>}
      <div className={styles.finalDevices}>
        <MedGuideDesktopMockup />
        <MedGuidePhoneMockup />
      </div>
      <ReferenceDetail
        x={0}
        y={1467}
        width={65}
        height={69}
        className={styles.finalLeftLeaves}
      />
      <ReferenceDetail
        x={575}
        y={1435}
        width={84}
        height={101}
        className={styles.finalRightLeaves}
      />
    </section>
  );
}
export function ResearchCTA() {
  return (
    <section
      id="research"
      className={styles.research}
      aria-labelledby="research-title"
    >
      <Eyebrow>BUILT FOR REAL IMPACT</Eyebrow>
      <h2 id="research-title">
        Accessible healthcare
        <br />
        information for a healthier tomorrow.
      </h2>
      <p>
        MedGuide AI is developed as a research project to explore how AI can
        support access to reliable healthcare information.
      </p>
      <div className={styles.finalButtons}>
        <Action compact secondary href="/research">
          View research
        </Action>
        <Link
          className={`${styles.action} ${styles.secondary} ${styles.compact}`}
          href="/research#methodology"
        >
          Read our methodology
        </Link>
      </div>
    </section>
  );
}
export function FinalSection() {
  return (
    <div className={styles.finalSection}>
      <AvailableEverywhere />
      <ResearchCTA />
    </div>
  );
}
