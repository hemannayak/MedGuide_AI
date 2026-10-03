import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Globe,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { Action, Eyebrow, ReferenceDetail } from "./shared";
import styles from "./homepage.module.css";

export function SafetySection() {
  return (
    <section className={styles.safety} aria-labelledby="safety-title">
      <ReferenceDetail
        x={0}
        y={1377}
        width={721}
        height={18}
        className={styles.safetyFloor}
      />
      <ReferenceDetail
        x={0}
        y={1249}
        width={63}
        height={146}
        className={styles.safetyLeaves}
      />
      <div className={styles.safetyCopy}>
        <Eyebrow>SAFETY FIRST</Eyebrow>
        <h2 id="safety-title">
          Some questions
          <br />
          need more than an answer.
        </h2>
        <p>
          A deterministic safety layer checks predefined red-flag symptoms and
          can surface escalation guidance when needed.
        </p>
        <Action compact secondary href="/safety">
          See how safety works
        </Action>
      </div>
      <div className={styles.warningCard}>
        <h3>
          <span>
            <TriangleAlert size={20} />
          </span>
          Red-flag detected
        </h3>
        <p>
          Symptoms like high fever, difficulty breathing, or chest pain may
          require professional medical attention.
        </p>
        <Action compact secondary href="/safety">
          Seek medical care
        </Action>
        <small>Illustrative safety notice</small>
      </div>
      <ol className={styles.safetySteps}>
        {[
          { title: "Symptom input", Icon: Brain, color: "neutral" },
          {
            title: "Safety check (rule-based)",
            Icon: UserRound,
            color: "green",
          },
          { title: "Risk detection", Icon: ShieldCheck, color: "gold" },
          { title: "Escalation guidance", Icon: UserRound, color: "coral" },
        ].map(({ title, Icon, color }) => (
          <li key={title}>
            <span className={`${styles.cardIcon} ${styles[color]}`}>
              <Icon size={16} />
            </span>
            {title}
          </li>
        ))}
      </ol>
    </section>
  );
}
export function LanguageSection() {
  return (
    <section className={styles.languages} aria-labelledby="language-title">
      <Eyebrow>
        <span id="language-title">
          UNDERSTAND IN
          <br />
          MULTIPLE LANGUAGES
        </span>
      </Eyebrow>
      <svg
        className={styles.languageCurve}
        viewBox="0 0 320 150"
        aria-hidden="true"
      >
        <path d="M0 55 C45 65 60 15 100 40 S160 20 195 60 S250 65 320 125" />
      </svg>
      <div className={styles.languageBubbles}>
        <span className={styles.globeBubble}>
          <Globe size={35} />
        </span>
        <span className={styles.englishBubble}>English</span>
        <span className={styles.teluguBubble} lang="te">
          తెలుగు
        </span>
        <span className={styles.tamilBubble}>Phase one</span>
        <span className={styles.hindiBubble} lang="hi">
          हिंदी
        </span>
      </div>
      <p>
        Designed for English, Hindi, and Telugu.
        <br />
        Voice and language features are
        <br />
        being developed and evaluated.
      </p>
      <Link href="/languages" className={styles.textLink}>
        Try in your language <ArrowRight size={14} />
      </Link>
      <ReferenceDetail
        x={948}
        y={1355}
        width={76}
        height={41}
        className={styles.languageLeaves}
      />
    </section>
  );
}
export function SafetyLanguages() {
  return (
    <div className={styles.safetyLanguages}>
      <SafetySection />
      <LanguageSection />
    </div>
  );
}
