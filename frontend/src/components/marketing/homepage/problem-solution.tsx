"use client";
import { useState, type KeyboardEvent } from "react";
import { solutionFeatures, type FeatureMode } from "./feature-data";
import Link from "next/link";
import Image from "next/image";
import { Eyebrow, ReferenceDetail } from "./shared";
import { MedGuideDesktopMockup, MedGuidePhoneMockup } from "./device-mockups";
import styles from "./homepage.module.css";
import story from "../editorial/home-refinement.module.css";

const problems = [
  {
    title: "Distance",
    image: "distance-1536.webp",
    text: "Healthcare facilities may not always be nearby.",
    x: 458,
    width: 162,
    color: "green",
    label: "A rural mountain road and a village bus",
  },
  {
    title: "Language",
    image: "language-v2-1536.webp",
    text: "Medical information isn’t always available in the language you are most comfortable using.",
    x: 633,
    width: 171,
    color: "coral",
    label: "Regional language text beside a smartphone",
  },
  {
    title: "Reliability",
    image: "reliability-v2-1536.webp",
    text: "Finding information online doesn’t guarantee that it is grounded in a trusted source.",
    x: 818,
    width: 168,
    color: "gold",
    label: "A stack of medical reference books",
  },
];
export function ProblemSection() {
  return (
    <section className={story.problem} aria-labelledby="problem-title">
      <div className={story.problemIntro}>
        <Eyebrow>WHY MEDGUIDE EXISTS</Eyebrow>
        <h2 id="problem-title">Healthcare information<br />isn’t always within reach.</h2>
        <p>A health question should be easier to understand, wherever you live and whichever language feels familiar.</p>
      </div>
      <ol className={story.problemSequence}>
        {problems.map(({ title, text, label, image }, index) => (
          <li key={title}>
            <Image
              src={`/marketing/problem/${image}`}
              sizes="(max-width: 380px) 80px, (max-width: 760px) 110px, 29vw"
              width={1536} height={1024} alt={label} loading="lazy" decoding="async"
              className={story.problemImage}
            />
            <span className={story.chapter}>0{index + 1} <span aria-hidden="true">→</span></span>
            <h3>{title}</h3><p>{text}</p>
          </li>
        ))}
      </ol>
      <div className={story.problemBridge}>
        <p>MedGuide brings a simpler place to ask, familiar-language interfaces, and an evidence-focused approach to these everyday barriers.</p>
        <Link href="/about">Meet the mission →</Link>
      </div>
    </section>
  );
}
export function SolutionSection() {
  const [activeMode, setActiveMode] = useState<FeatureMode>("text");
  const activeFeature = solutionFeatures.find(
    (feature) => feature.id === activeMode,
  )!;
  function navigateFeatures(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const movement: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 2,
      ArrowUp: -2,
    };
    let next: number;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = solutionFeatures.length - 1;
    else if (event.key in movement)
      next =
        (index + movement[event.key] + solutionFeatures.length) %
        solutionFeatures.length;
    else return;
    event.preventDefault();
    setActiveMode(solutionFeatures[next].id);
    const tabs =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]',
      );
    tabs?.[next].focus();
  }
  return (
    <section
      id="solution"
      className={styles.solution}
      aria-labelledby="solution-title"
    >
      <ReferenceDetail
        x={0}
        y={950}
        width={65}
        height={64}
        className={styles.solutionLeaves}
      />
      <div className={styles.solutionCopy}>
        <Eyebrow>THE SOLUTION</Eyebrow>
        <h2 id="solution-title">
          One place to ask.
          <br />
          Multiple ways to understand.
        </h2>
        <p>
          Interact with MedGuide through text, voice, or documents —
          <br className={styles.desktopBreak} /> in the language you are
          comfortable with.
        </p>
        <div
          className={styles.featureGrid}
          role="tablist"
          aria-label="Explore MedGuide features"
        >
          {solutionFeatures.map(({ Icon, title, id }, index) => (
            <button
              type="button"
              role="tab"
              id={`feature-tab-${id}`}
              aria-selected={id === activeMode}
              aria-controls="feature-preview"
              tabIndex={id === activeMode ? 0 : -1}
              onClick={() => setActiveMode(id)}
              onKeyDown={(event) => navigateFeatures(event, index)}
              className={id === activeMode ? styles.selectedFeature : undefined}
              key={id}
            >
              <span>
                <Icon size={21} aria-hidden="true" />
              </span>
              {title}
            </button>
          ))}
        </div>
        <div className={styles.featureDescription} aria-live="polite">
          <strong>{activeFeature.heading}</strong>
          <p>{activeFeature.description}</p>
        </div>
      </div>
      <div
        id="feature-preview"
        role="tabpanel"
        aria-labelledby={`feature-tab-${activeMode}`}
        className={styles.solutionScene}
      >
        <ReferenceDetail
          x={373}
          y={819}
          width={61}
          height={178}
          className={styles.deviceLeftLeaves}
        />
        <ReferenceDetail
          x={947}
          y={772}
          width={77}
          height={238}
          className={styles.deviceRightLeaves}
        />
        <MedGuideDesktopMockup
          mode={activeMode}
          className={styles.solutionDesktop}
        />
        <MedGuidePhoneMockup
          mode={activeMode}
          className={styles.solutionPhone}
        />
        <ReferenceDetail
          x={482}
          y={967}
          width={338}
          height={31}
          className={styles.stone}
        />
        <ReferenceDetail
          x={285}
          y={998}
          width={739}
          height={16}
          className={styles.ground}
        />
      </div>
    </section>
  );
}
