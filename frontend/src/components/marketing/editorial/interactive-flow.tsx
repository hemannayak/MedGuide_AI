"use client";
import { useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, FileText, Mic, MessageSquare } from "lucide-react";
import { Brand } from "../homepage/shared";
import styles from "./editorial.module.css";

type Step = {
  label: string;
  title: string;
  text: string;
  screenTitle: string;
  screenText: string;
  note: string;
};
const flows: Record<
  string,
  { label: string; title: string; intro: string; steps: Step[] }
> = {
  "how-it-works": {
    label: "EXPLORE THE JOURNEY",
    title: "One question. Four thoughtful steps.",
    intro:
      "Select a step to see how the intended experience moves from a question to useful information and professional-care support.",
    steps: [
      {
        label: "Ask",
        title: "Start with your own words.",
        text: "Describe a concern in text or through the intended voice workflow. The symptom interface can collect duration and relevant details without requiring medical vocabulary.",
        screenTitle: "Your question",
        screenText: "Help me understand my symptoms.",
        note: "Illustrative question · no assessment is performed",
      },
      {
        label: "Understand",
        title: "Review before continuing.",
        text: "Confirm what you shared. Voice transcripts and extracted prescription text should be checked. Unclear details require verification rather than silent correction.",
        screenTitle: "Review your input",
        screenText: "Question → Duration → Related details",
        note: "Your reported information stays distinct from interpretation",
      },
      {
        label: "Guide",
        title: "Keep the evidence in view.",
        text: "The intended information flow retrieves relevant passages from reviewed sources, shows their metadata, and explains limitations. Insufficient evidence should lead to a clear disclosure.",
        screenTitle: "Information & sources",
        screenText: "Explanation / Relevant passage / Publisher & page",
        note: "Layout illustration · not a fabricated clinical citation",
      },
      {
        label: "Act",
        title: "Prepare a clearer care conversation.",
        text: "Ask a follow-up, review your timeline, or seek professional care when appropriate. Generated text must not override qualified care or validated escalation rules.",
        screenTitle: "Your next step",
        screenText: "Follow-up questions · Care information · Timeline",
        note: "MedGuide does not diagnose or prescribe",
      },
    ],
  },
  technology: {
    label: "EXPLORE THE SYSTEM",
    title: "Follow the evidence, not just the answer.",
    intro:
      "An interactive architecture explanation. These stages describe the project design; they do not execute a model or medical decision.",
    steps: [
      {
        label: "Documents",
        title: "Provenance starts with the document.",
        text: "Medical material needs a publisher, title, version, source location, and page metadata. Document processing and chunking must preserve that provenance. Source registration alone does not establish clinical coverage.",
        screenTitle: "Document record",
        screenText: "Title · Publisher · Version · Source URL · Page",
        note: "Metadata contract · no invented source claim",
      },
      {
        label: "Vector search",
        title: "Retrieve a relevant passage.",
        text: "The documented stack uses PostgreSQL with pgvector. Query and document embeddings support similarity retrieval. Retrieval thresholds require calibration; a similarity score is not a clinical certainty score.",
        screenTitle: "Retrieval flow",
        screenText: "Question → Embedding → pgvector → Relevant passages",
        note: "Relevance requires evaluation",
      },
      {
        label: "Generate",
        title: "Explain with the retrieved context.",
        text: "The model receives relevant evidence through the intended RAG workflow. A provider abstraction keeps model selection separate from the user interface. Models require evaluation for language, safety, hardware, licensing, and latency.",
        screenTitle: "Grounded explanation",
        screenText: "Retrieved context + Question → Clear response",
        note: "No production model approval is implied",
      },
      {
        label: "Validate",
        title: "Preserve safety and uncertainty.",
        text: "Response validation should check grounding and safety boundaries. Documented deterministic rules take priority for safety-critical escalation. Unsupported claims and inadequate evidence must remain visible.",
        screenTitle: "Response review",
        screenText: "Grounding · Boundaries · Uncertainty · Source metadata",
        note: "No clinical validation claimed",
      },
    ],
  },
  safety: {
    label: "TRUST, STEP BY STEP",
    title: "Healthcare guidance should know its limits.",
    intro:
      "Explore the safeguards without entering symptoms or receiving a risk score.",
    steps: [
      {
        label: "Evidence",
        title: "Sources you can inspect.",
        text: "Keep retrieved passages and their publisher, title, page, and version alongside the explanation. Evidence visibility helps people review a response; it does not make it infallible.",
        screenTitle: "Evidence alongside information",
        screenText: "Plain-language explanation / Source details",
        note: "Separate evidence from generated text",
      },
      {
        label: "Boundaries",
        title: "Information is not a diagnosis.",
        text: "MedGuide must not independently prescribe, change medication dosages, advise stopping prescribed treatment, or override a qualified healthcare professional.",
        screenTitle: "Clear medical boundaries",
        screenText: "Inform · Explain · Structure · Support professional care",
        note: "No diagnosis · No prescribing",
      },
      {
        label: "Escalation",
        title: "Professional care remains central.",
        text: "The approved scope includes documented red-flag rules and escalation guidance. Such rules require tests and qualified review. A model must not downgrade a validated emergency classification.",
        screenTitle: "Safety pipeline",
        screenText:
          "Reported input → Documented checks → Professional-care guidance",
        note: "Illustrative workflow · not a triage assessment",
      },
      {
        label: "Privacy",
        title: "Access should have a reason.",
        text: "Data minimization, consent, and authorization are core requirements. Patients should access their records; healthcare workers should see only information they are authorized to review.",
        screenTitle: "Permission-aware care",
        screenText: "Consent → Authorized access → Privacy-conscious records",
        note: "Use synthetic examples during development",
      },
    ],
  },
  languages: {
    label: "A FAMILIAR WAY TO ASK",
    title: "Speak. Review. Understand.",
    intro:
      "Switch the examples to explore first-phase native scripts. These are fixed illustrative interface strings, not live translation or speech processing.",
    steps: [
      {
        label: "English",
        title: "A question in familiar words.",
        text: "The voice-first design begins with a spoken or typed question, followed by transcript review. Spoken responses depend on connected text-to-speech services and independent evaluation.",
        screenTitle: "How can I help you today?",
        screenText: "Type your health question…",
        note: "English interface example",
      },
      {
        label: "हिंदी",
        title: "Space for Hindi script.",
        text: "Flexible text layouts support Hindi script without forcing labels into narrow boxes. Voice transcription and pronunciation must be evaluated separately from visual interface translation.",
        screenTitle: "मुझे सिर दर्द हो रहा है, क्या करूँ?",
        screenText: "हिंदी",
        note: "Existing Hindi question example · not health advice",
      },
      {
        label: "తెలుగు",
        title: "Space for Telugu script.",
        text: "Telugu is part of the first-phase language scope. The intended experience keeps transcript confirmation, evidence visibility, and the same safety boundaries across languages.",
        screenTitle: "మీ ప్రశ్న అడగండి",
        screenText: "తెలుగు",
        note: "Existing Telugu interface example",
      },
    ],
  },
  research: {
    label: "LOOK INSIDE THE METHOD",
    title: "A result needs a reproducible method.",
    intro:
      "Explore the research process. No measured accuracy, clinical outcome, or publication result is claimed.",
    steps: [
      {
        label: "Question",
        title: "Define the task before choosing the model.",
        text: "Start with an approved use case and a measurable research question. Define the target language, input type, expected evidence, resource limits, and what constitutes a failure.",
        screenTitle: "Research question",
        screenText: "Task / Language / Constraints / Success criteria",
        note: "Requirements before benchmarks",
      },
      {
        label: "Data",
        title: "Make the evaluation data traceable.",
        text: "Use synthetic, appropriately licensed public, or permitted de-identified data. Record source provenance and annotations. Real patient data must not be used casually for development.",
        screenTitle: "Evaluation set",
        screenText: "Source · License · Synthetic label · Reviewed annotations",
        note: "No dataset-size claim",
      },
      {
        label: "Review",
        title: "Measure the failures as well as successes.",
        text: "Evaluate retrieval relevance, unsupported claims, OCR errors, language comprehension, and missed safety concerns separately. Qualified review is needed for medical safety interpretation.",
        screenTitle: "Evaluation dimensions",
        screenText:
          "Retrieval / Grounding / OCR / Speech / Safety / Accessibility",
        note: "Performance not yet reported",
      },
      {
        label: "Report",
        title: "Publish the limits with the findings.",
        text: "Record the setup, version, method, failures, and uncertainty. A working demonstration is not evidence of clinical validation or real-world deployment readiness.",
        screenTitle: "Transparent report",
        screenText: "Method → Results → Failure analysis → Limitations",
        note: "No clinical validation claimed",
      },
    ],
  },
  about: {
    label: "WHO WE DESIGN FOR",
    title: "Different needs. A shared need for clarity.",
    intro:
      "Explore the people and care relationships described in the approved project scope.",
    steps: [
      {
        label: "Patients",
        title: "A simpler first layer of understanding.",
        text: "Rural and underserved users may face distance, language, literacy, and connectivity barriers. The interface aims for plain language, large controls, and clear next steps.",
        screenTitle: "Patient experience",
        screenText: "Symptoms · Questions · Medication support · Timeline",
        note: "Support professional care, not replace it",
      },
      {
        label: "Families",
        title: "Make room for a useful conversation.",
        text: "Understandable explanations and verifiable source information can help people prepare questions for healthcare professionals. Family support must respect the patient’s consent and privacy.",
        screenTitle: "Clearer conversations",
        screenText: "Read together · Ask follow-ups · Respect privacy",
        note: "No automatic access to someone else’s records",
      },
      {
        label: "Healthcare workers",
        title: "Human expertise stays in the loop.",
        text: "The wider approved scope includes authorized patient information, reviewable summaries, medication records, alerts, and follow-ups for healthcare workers.",
        screenTitle: "Authorized review",
        screenText: "Patient reports → Summary review → Follow-up",
        note: "Access is limited to authorized information",
      },
    ],
  },
};
const defaults = {
  label: "PRODUCT PRINCIPLES",
  title: "Understand what happens to information.",
  intro: "Explore the requirements behind this demonstration.",
  steps: [
    {
      label: "Understand",
      title: "Clear information and clear limits.",
      text: "Use readable explanations, visible source details, and simple controls. The demonstration must not be confused with a clinically validated healthcare service.",
      screenTitle: "MedGuide AI",
      screenText: "Readable information · Visible limits · Professional care",
      note: "Student-led research project",
    },
    {
      label: "Review",
      title: "Privacy and human review matter.",
      text: "Consent, authorized access, and data minimization are project requirements. Use synthetic data in the demonstration and verify uncertain information before acting on it.",
      screenTitle: "Review before continuing",
      screenText: "Consent · Verification · Authorized access",
      note: "No clinical validation claimed",
    },
  ],
};
export function InteractiveFlow({ kind = "how-it-works" }: { kind?: string }) {
  const content = flows[kind] || defaults;
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const step = content.steps[active];
  const baseId = `explore-${kind.replace(/[^a-z]/g, "")}`;
  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % content.steps.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + content.steps.length) % content.steps.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = content.steps.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  }
  return (
    <section
      className={styles.editorialSection}
      aria-labelledby={`${baseId}-heading`}
    >
      <p className={styles.flowLabel}>{content.label}</p>
      <h2 id={`${baseId}-heading`}>{content.title}</h2>
      <p>{content.intro}</p>
      <div
        className={styles.flowTabs}
        role="tablist"
        aria-label={`${kind} visual explainer`}
      >
        {content.steps.map(({ label }, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={active === index}
            aria-controls={`${baseId}-panel`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(e) => move(e, index)}
          >
            <span>0{index + 1}</span>
            {label}
            <ArrowRight size={16} />
          </button>
        ))}
      </div>
      <div
        className={styles.flowContent}
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${active}`}
      >
        <motion.div
          key={active}
          className={styles.flowExplanation}
          initial={reduced ? false : { opacity: 0.5, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </motion.div>
        <div className={styles.flowScreen} aria-live="polite">
          <Brand small />
          <div className={styles.flowScreenIcons}>
            <MessageSquare />
            <Mic />
            <FileText />
          </div>
          <h3
            lang={
              kind === "languages"
                ? active === 1
                  ? "hi"
                  : active === 2
                    ? "te"
                    : "en"
                : undefined
            }
          >
            {step.screenTitle}
          </h3>
          <div className={styles.flowScreenBody}>{step.screenText}</div>
          <div className={styles.flowProof}>
            <Check size={16} />
            <span>{step.note}</span>
          </div>
          <div className={styles.flowProgress} aria-hidden="true">
            {content.steps.map((_, index) => (
              <i key={index} data-active={index <= active} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
