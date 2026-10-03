import { BotanicalDetail } from "../homepage/shared";
import Link from "next/link";
import { MarketingNavbar } from "../homepage/hero-section";
import { MarketingFooter } from "../homepage/marketing-footer";
import { Action, Eyebrow } from "../homepage/shared";
import { LanguageStory } from "./journey";
import { commonQuestions } from "./content";
import { InteractiveFlow } from "./interactive-flow";
import { UtilityVisual } from "./utility-visual";
import { ContactForm } from "./contact-form";
import shared from "../homepage/homepage.module.css";
import styles from "./editorial.module.css";
import page from "../pages/marketing-page.module.css";
export type InformationKind =
  | "safety"
  | "languages"
  | "faq"
  | "contact"
  | "accessibility"
  | "privacy"
  | "terms"
  | "disclaimer";
export const informationTitles: Record<InformationKind, [string, string]> = {
  safety: [
    "Healthcare guidance should know its boundaries.",
    "Grounded intelligence. Clear limits. A place for professional care.",
  ],
  languages: [
    "Your language belongs in the conversation.",
    "A first-phase focus on English, Hindi, and Telugu, with voice designed around understanding.",
  ],
  faq: [
    "A little clarity before you begin.",
    "Answers about the product, evidence, language, privacy, and project status.",
  ],
  contact: [
    "Let’s make the conversation useful.",
    "Questions, product feedback, accessibility concerns, and research collaboration.",
  ],
  accessibility: [
    "Access begins with the interface.",
    "Readable language, clear controls, and flexible ways to interact.",
  ],
  privacy: [
    "Your health information deserves care.",
    "Privacy principles and the limits of this development demonstration.",
  ],
  terms: [
    "Use MedGuide with clear expectations.",
    "Research demonstration terms and responsible-use boundaries.",
  ],
  disclaimer: [
    "Information supports care. It does not replace it.",
    "Medical and research boundaries for using MedGuide AI.",
  ],
};
const safetyDetails = [
  [
    "Grounded information & evidence visibility",
    "Reviewed documents should retain publisher, title, page, and version metadata. Relevant passages need to be distinguished from generated explanations. RAG and source visibility support review; they do not guarantee correctness.",
  ],
  [
    "Red-flag detection & triage",
    "The design prioritizes documented, deterministic rules for safety-critical concerns. Rules require testing and qualified review. A generated response must not override a validated escalation decision.",
  ],
  [
    "Emergency escalation & human care",
    "The approved scope includes escalation interfaces and professional-care guidance. A frontend preview is not an emergency assessment service. Do not wait for an AI response when urgent professional help is needed.",
  ],
  [
    "Medical boundaries",
    "MedGuide must not diagnose, prescribe, change prescribed dosages, recommend stopping medication, or override a qualified healthcare professional.",
  ],
  [
    "Privacy & authorized access",
    "Data minimization, consent, and role-based access are project requirements. Healthcare workers should access only authorized patient information. Use synthetic examples during development.",
  ],
];
const legalContent: Record<string, string[][]> = {
  privacy: [
    [
      "Development demonstration",
      "Use synthetic examples. The public demo does not establish production privacy or security readiness. Connected services, storage practices, and deployment settings must be reviewed before real health data is used.",
    ],
    [
      "Information minimization",
      "The project requires collection of only necessary information, consent for health-data processing, and authorized access. Marketing language preferences are stored locally by the current interface.",
    ],
    [
      "Contact and newsletter previews",
      "The demonstration contact form does not send or store its contents. No newsletter subscription is created. Official contact and social destinations are not yet connected.",
    ],
    [
      "Connected service review",
      "Retention, deletion, export, encryption, and service-provider practices require an implementation-specific policy before deployment. No unverified encryption or compliance certification is claimed here.",
    ],
  ],
  terms: [
    [
      "Purpose and status",
      "MedGuide AI is a student-led research and development project. The interface demonstrates intended workflows; service availability may vary and clinical validation is not claimed.",
    ],
    [
      "Responsible use",
      "Do not use the demonstration as a diagnosis, prescription, emergency assessment, or substitute for professional care. Do not upload real patient information casually during development.",
    ],
    [
      "Professional care",
      "Keep following your healthcare professional’s instructions. Prescription extraction and generated explanations require review; they must not independently change treatment.",
    ],
    [
      "Availability and changes",
      "Some experiences depend on connected services. Offline readiness and model performance have not been established by this website. These development terms require review before public clinical deployment.",
    ],
  ],
  disclaimer: [
    [
      "No diagnosis or prescribing",
      "MedGuide provides an information-oriented interface. It must not claim to be a doctor, establish a definitive diagnosis, prescribe medication, or change a prescribed dosage.",
    ],
    [
      "Uncertainty and review",
      "Generated explanations and extracted document text may be incomplete or incorrect. Source metadata and verification steps support review; they are not guarantees.",
    ],
    [
      "Urgent concerns",
      "Use qualified professional and emergency services for urgent concerns. Do not delay care while waiting for a demonstration or generated response.",
    ],
    [
      "Research status",
      "No clinical validation, healthcare approval, partnership, or measured clinical outcome is established by the public website.",
    ],
  ],
};
export function InformationPage({ kind }: { kind: InformationKind }) {
  const [title, description] = informationTitles[kind];
  return (
    <div className={`${shared.homepage} ${page.page}`}>
      <a href="#information-content" className={shared.skipLink}>
        Skip to page content
      </a>
      <MarketingNavbar />
      <section className={`${styles.editorialSection} ${["faq","contact","accessibility","privacy","terms","disclaimer"].includes(kind)?styles.utilityHero:""}`}><BotanicalDetail /><div><Eyebrow>MEDGUIDE / {kind.toUpperCase()}</Eyebrow><h1 className={styles.utilityHeading}>{title}</h1><p>{description}</p></div><UtilityVisual kind={kind}/></section>
      <div id="information-content">
        {!["faq", "contact", "privacy", "terms", "disclaimer"].includes(
          kind,
        ) && <InteractiveFlow kind={kind} />}
        {kind === "languages" ? (
          <>
            <LanguageStory detailed />
            <section className={`${styles.editorialSection} ${styles.dark}`}>
              <Eyebrow>VOICE-FIRST ACCESS</Eyebrow>
              <h2>Speak. Review. Listen.</h2>
              <ol className={styles.journey}>
                {[
                  [
                    "SPEAK",
                    "Speech-to-text makes a spoken question available as text.",
                  ],
                  [
                    "REVIEW",
                    "The user checks the transcript before continuing.",
                  ],
                  [
                    "RESPOND",
                    "The normal evidence and safety workflow applies.",
                  ],
                  [
                    "LISTEN",
                    "Native-language TTS is an intended accessibility feature; quality needs evaluation.",
                  ],
                ].map(([label, text]) => (
                  <li key={label}>
                    <small>{label}</small>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
              <p>
                Audio samples are not connected in this demonstration. Language
                selection does not establish speech accuracy or automatic
                translation availability.
              </p>
            </section>
          </>
        ) : kind === "safety" ? (
          <section className={`${styles.editorialSection} ${styles.dark}`}>
            <Eyebrow>SAFETY BY DESIGN</Eyebrow>
            <h2>Evidence, uncertainty, and human judgment belong together.</h2>
            <ol className={styles.journey}>
              {[
                "Patient input",
                "Documented safety checks",
                "Relevant evidence",
                "Response review",
              ].map((text) => (
                <li key={text}>
                  <h3>{text}</h3>
                </li>
              ))}
            </ol>
            <div className={styles.disclosure}>
              {safetyDetails.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
            
          </section>
        ) : kind === "faq" ? (
          <section className={styles.editorialSection}>
            <div className={styles.disclosure}>
              {commonQuestions.map(({ question, answer }) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: commonQuestions.map(({ question, answer }) => ({
                    "@type": "Question",
                    name: question,
                    acceptedAnswer: { "@type": "Answer", text: answer },
                  })),
                }).replace(/</g, "\\u003c"),
              }}
            />
          </section>
        ) : kind === "contact" ? (
          <section className={styles.editorialSection}>
            <h2>Share a question or suggestion.</h2>
            <p>
              Official contact details are pending. The form below previews the
              feedback experience without sending a message.
            </p>
            <ContactForm />
          </section>
        ) : kind === "accessibility" ? (
          <section className={styles.editorialSection}>
            <h2>Simple to see. Clear to use.</h2>
            <div className={styles.disclosure}>
              {[
                [
                  "Keyboard and screen readers",
                  "Navigation, buttons, forms, feature tabs, and expandable sections use semantic controls and visible focus. Accessibility still requires testing across assistive technologies.",
                ],
                [
                  "Readable and multilingual",
                  "Responsive typography and flexible layouts support English, Hindi, and Telugu scripts. Plain language and clear labels reduce unnecessary complexity.",
                ],
                [
                  "Touch and motion",
                  "Controls provide generous touch areas. Reduced-motion preferences disable decorative movement. Color is paired with text and icons rather than being the only signal.",
                ],
                [
                  "Connectivity",
                  "Low-bandwidth and offline-first behavior are design requirements. This site does not claim full offline capability or a completed WCAG certification.",
                ],
              ].map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : (
          <section className={styles.editorialSection}>
            <div className={styles.disclosure}>
              {legalContent[kind]?.map(([q, a]) => (
                <details open key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
      <section className={styles.editorialSection}>
        <div className={styles.featureLinks}>
          <Link href="/how-it-works">How it works →</Link>
          <Link href="/safety">Safety approach →</Link>
          <Link href="/research">Research →</Link>
          <Link href="/contact">Contact →</Link>
        </div>
        <p>
          MedGuide AI supports information and professional-care conversations.
          It does not replace a qualified healthcare professional.
        </p>
        <Action>Ask MedGuide</Action>
      </section>
      <MarketingFooter />
    </div>
  );
}
