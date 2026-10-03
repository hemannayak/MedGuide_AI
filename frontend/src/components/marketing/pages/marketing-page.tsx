import { RuralContext } from "../experience/rural-context";
import { BotanicalDetail } from "../homepage/shared";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Globe,
  HeartHandshake,
  Lock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { MarketingNavbar } from "../homepage/hero-section";
import { Action, Eyebrow } from "../homepage/shared";
import { SolutionSection } from "../homepage/problem-solution";
import { RagSection } from "../homepage/rag-section";
import { MarketingFooter } from "../homepage/marketing-footer";
import shared from "../homepage/homepage.module.css";
import styles from "./marketing-page.module.css";
import { InteractiveFlow } from "../editorial/interactive-flow";
import { ApiServiceMap } from "./api-service-map";
import { TopicVisual, PublisherStrip } from "../editorial/topic-visual";

type PageKind =
  | "product"
  | "how-it-works"
  | "technology"
  | "research"
  | "about";
const pageCopy = {
  product: {
    label: "THE MEDGUIDE EXPERIENCE",
    first: "One companion.",
    second: "Many ways to understand.",
    text: "A simpler way to ask health questions, explore information, and prepare for conversations with a healthcare professional.",
    next: "Explore the features",
    anchor: "#solution",
  },
  "how-it-works": {
    label: "HOW IT WORKS",
    first: "Your question.",
    second: "A clearer path to understanding.",
    text: "Start with words, voice, or a document. The intended experience brings plain language, visible sources, and safety guidance together.",
    next: "Follow the journey",
    anchor: "#journey",
  },
  technology: {
    label: "THE TECHNOLOGY",
    first: "Thoughtfully connected.",
    second: "Built to be grounded.",
    text: "Explore how reviewed medical information, language tools, and layered safety checks are designed to support clearer healthcare conversations.",
    next: "Explore the architecture",
    anchor: "#architecture",
  },
  research: {
    label: "RESEARCH & METHODOLOGY",
    first: "Build carefully.",
    second: "Measure honestly.",
    text: "A student research project exploring accessible healthcare information. Our evaluation approach makes uncertainty, evidence, and limitations visible.",
    next: "Read our methodology",
    anchor: "#methodology",
  },
  about: {
    label: "ABOUT MEDGUIDE AI",
    first: "Closer to home.",
    second: "Built around people.",
    text: "MedGuide AI is a student-led healthcare technology project focused on understandable information for rural and underserved communities in India.",
    next: "Meet our purpose",
    anchor: "#purpose",
  },
} as const;

function Section({
  label,
  title,
  children,
  id,
  dark = false,
}: {
  label: string;
  title: string;
  children: ReactNode;
  id?: string;
  dark?: boolean;
}) {
  return (
    <section id={id} className={`${styles.section} ${dark ? styles.dark : ""}`}>
      <Eyebrow>{label}</Eyebrow>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function InfoCards({
  items,
}: {
  items: { title: string; text: string; Icon: typeof Globe }[];
}) {
  return (
    <div className={styles.cards}>
      {items.map(({ title, text, Icon }) => (
        <article key={title}>
          <span className={styles.icon}>
            <Icon size={24} aria-hidden="true" />
          </span>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}
function ProductContent() {
  return (
    <>
      <SolutionSection />
      <Section
        label="DESIGNED AROUND YOUR DAY"
        title="From a first question to a useful conversation."
      >
        <InfoCards
          items={[
            {
              title: "Ask simply",
              text: "Use everyday language. The intended interface helps you ask a question without needing medical vocabulary.",
              Icon: MessageSquare,
            },
            {
              title: "Review clearly",
              text: "Keep source information, uncertainty, and follow-up questions within reach.",
              Icon: BookOpen,
            },
            {
              title: "Stay connected to care",
              text: "Information supports a conversation with a qualified healthcare professional. It does not replace that conversation.",
              Icon: HeartHandshake,
            },
          ]}
        />
        <InfoCards
          items={[
            {
              title: "Preliminary symptom support",
              text: "The intended starting point helps people describe symptoms, their duration, and related concerns. Guidance supports professional care and is not a diagnosis.",
              Icon: ShieldCheck,
            },
            {
              title: "Prescription and medication support",
              text: "Prescription text should be reviewed before medication records are created. The approved scope includes schedules, reminders, and adherence tracking without changing prescribed instructions.",
              Icon: Check,
            },
            {
              title: "Continuity of care",
              text: "A health timeline brings reported symptoms, medication events, and follow-ups together. Authorized healthcare-worker review is part of the wider project scope.",
              Icon: HeartHandshake,
            },
          ]}
        />
        <p className={styles.note}>
          Interactive previews illustrate the experience. Automated guidance,
          speech, document extraction, and translation depend on connected
          services.
        </p>
      </Section>
      <Section id="healthcare-workers" label="CONTINUITY OF CARE" title="A place for authorized healthcare-worker involvement.">
        <p className={styles.intro}>The wider project scope includes assigned patient lists, patient-reported information, summaries, medication review, alerts, and follow-up management. Access must depend on patient consent and worker authorization.</p>
        <p className={styles.note}>A dedicated healthcare-worker portal is not available in this frontend yet. This describes the approved project direction, not a connected clinical service.</p>
        <Link href="/technology#service-map" className={styles.learn}>Explore the service responsibilities <ArrowRight size={16} /></Link>
      </Section>
    </>
  );
}
function HowItWorksContent() {
  const steps = [
    {
      title: "Choose how to ask",
      text: "Type a question, select voice input, or use the document flow. These alternatives are demonstrated in the Product page.",
    },
    {
      title: "Review what you shared",
      text: "Check the question, transcript, or extracted document text. Unclear details should be verified rather than silently corrected.",
    },
    {
      title: "Explore the information",
      text: "The intended response layout separates a plain-language explanation from retrieved source information.",
    },
    {
      title: "Understand the limits",
      text: "Safety notices and uncertainty remain visible. The platform is not intended to diagnose or prescribe.",
    },
    {
      title: "Continue with professional care",
      text: "Use the information to prepare follow-up questions or speak with a healthcare professional.",
    },
  ];
  return (
    <>
      <Section
        id="journey"
        label="YOUR JOURNEY"
        title="A few clear steps. No medical vocabulary needed."
      >
        <details>
          <summary>What to review at each stage</summary>
          <ol className={styles.steps}>
            {steps.map(({ title, text }, i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </details>
      </Section>
      <RagSection />
      <Section
        label="A LITTLE CLARITY AT EVERY STEP"
        title="Know what you are looking at."
        dark
      >
        <InfoCards
          items={[
            {
              title: "Your input",
              text: "Patient-reported text and documents remain distinct from generated summaries.",
              Icon: MessageSquare,
            },
            {
              title: "Retrieved evidence",
              text: "The planned interface shows the source and the retrieved passage, with document titles, publishers, and the relevant passage.",
              Icon: BookOpen,
            },
            {
              title: "Safety and uncertainty",
              text: "Uncertainty should remain visible. This demonstration does not evaluate a symptom or calculate a risk level.",
              Icon: ShieldCheck,
            },
          ]}
        />
      </Section>
    </>
  );
}
function TechnologyContent() {
  const stages = [
    "Input processing",
    "Safety checks",
    "Knowledge retrieval",
    "Grounded response",
    "Response validation",
  ];
  return (
    <>
      <Section
        id="architecture"
        label="INFORMATION YOU CAN TRACE"
        title="A clearer answer starts with better evidence."
      >
        <InfoCards
          items={[
            {
              title: "Reviewed knowledge",
              text: "The project’s knowledge workflow records the publisher, document version, page, and source location of medical material before it is used for retrieval.",
              Icon: BookOpen,
            },
            {
              title: "Relevant passages",
              text: "Retrieval is designed to find passages related to a question. When evidence is insufficient, the response should explain the limitation rather than fill the gap with a guess.",
              Icon: Globe,
            },
            {
              title: "Visible references",
              text: "Source information belongs alongside the explanation so people and authorized healthcare workers can review where it came from.",
              Icon: ShieldCheck,
            },
          ]}
        />
      </Section>
      <Section
        label="INTENDED INFORMATION FLOW"
        title="Evidence and safety shape the response."
        dark
      >
        <ol className={styles.pipeline}>
          {stages.map((stage, i) => (
            <li key={stage}>
              <span>0{i + 1}</span>
              {stage}
            </li>
          ))}
        </ol>
        <p className={styles.intro}>
          The planned flow checks input, retrieves approved knowledge, and
          validates the response. The LLM is not intended to be the sole
          authority for safety-critical decisions.
        </p>
      </Section>
      <Section
        id="apis-models"
        label="APIS & MODELS"
        title="Portable components. Traceable information."
      >
        <p className={styles.intro}>
          The documented stack uses Next.js and React for the interface, FastAPI
          for APIs, and PostgreSQL with pgvector for storage and vector search.
          Models and providers are selected through evaluation; no production
          model approval is implied here.
        </p>
        <details>
          <summary>Explore APIs, retrieval, and model selection</summary>
          <p className={styles.intro}>
            REST contracts separate the user experience from authentication,
            records, retrieval, OCR, and speech services. Medical documents
            retain provenance through processing and embedding. Local inference
            is a project direction; model choice depends on language quality,
            safety, hardware, latency, and licensing.
          </p>
        </details>
        <InfoCards
          items={[
            {
              title: "Language and voice",
              text: "English, Hindi, and Telugu are the first-phase languages. Speech workflows include transcript review; language and speech performance require separate evaluation.",
              Icon: Globe,
            },
            {
              title: "Metadata travels with evidence",
              text: "Source titles, publishers, publication dates, and retrieved passages should accompany knowledge responses.",
              Icon: BookOpen,
            },
            {
              title: "Privacy by design",
              text: "Collect only necessary information. Consent and role-based access are project requirements. Healthcare workers should see only information they are authorized to review.",
              Icon: Lock,
            },
          ]}
        />
      </Section>
      <ApiServiceMap />
    </>
  );
}
function ResearchContent() {
  const evaluations = [
    {
      area: "Retrieval",
      method:
        "Review relevance of retrieved passages and traceability of metadata.",
    },
    {
      area: "Response grounding",
      method:
        "Check whether each claim is supported by retrieved evidence; record unsupported claims.",
    },
    {
      area: "Safety",
      method:
        "Test documented rules and examine missed red flags, with qualified review where needed.",
    },
    {
      area: "OCR",
      method:
        "Compare extracted text and fields with reviewed synthetic document annotations.",
    },
    {
      area: "Speech & language",
      method:
        "Measure transcription errors and review comprehension separately for each evaluated language.",
    },
    {
      area: "Accessibility",
      method:
        "Test keyboard access, readability, responsive layout, and realistic user tasks.",
    },
  ];
  return (
    <>
      <Section
        id="methodology"
        label="OUR METHODOLOGY"
        title="Define the question before measuring the answer."
      >
        <div className={styles.twoColumn}>
          <div>
            <h3>Start with requirements.</h3>
            <p>
              Document the intended task, its constraints, source provenance,
              and what a successful result would mean before choosing a model or
              reporting a metric.
            </p>
          </div>
          <div>
            <h3>Evaluate with appropriate data.</h3>
            <p>
              Use synthetic, appropriately licensed public, or permitted
              de-identified data. Identify synthetic examples clearly and
              preserve a reproducible evaluation procedure.
            </p>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table>
            <caption>
              Planned evaluation areas — results not yet reported
            </caption>
            <thead>
              <tr>
                <th scope="col">Area</th>
                <th scope="col">Evaluation approach</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map(({ area, method }) => (
                <tr key={area}>
                  <th scope="row">{area}</th>
                  <td>{method}</td>
                  <td>
                    <span className={styles.badge}>Not yet evaluated</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section
        id="sources"
        label="SOURCE PROVENANCE"
        title="Know the document behind the information."
      >
        <PublisherStrip />
        <p className={styles.intro}>
          The project source register includes WHO publications and ICMR
          treatment-workflow documents. Each document needs individual
          provenance, version, licensing, and relevance review before use.
          Publisher names are references, not partnerships or approvals.
        </p>
        <p className={styles.sourceLinks}><a href="https://www.who.int/publications/i/item/9789240009226" target="_blank" rel="noopener noreferrer">WHO primary-care publication ↗</a><a href="https://www.icmr.gov.in/standard-treatment-workflows-stws" target="_blank" rel="noopener noreferrer">ICMR treatment workflows ↗</a></p>
      </Section>
      <Section
        label="RESEARCH INTEGRITY"
        title="Progress should be visible. Claims should be earned."
        dark
      >
        <InfoCards
          items={[
            {
              title: "No invented results",
              text: "This website does not report model accuracy, clinical performance, or user-satisfaction scores that have not been measured.",
              Icon: Check,
            },
            {
              title: "No fabricated references",
              text: "Demonstration source cards are labeled as illustrations. Actual references must be verified and supplied with source metadata.",
              Icon: BookOpen,
            },
            {
              title: "Limits are part of the work",
              text: "Clinical validation, real-world deployment, and broad language coverage must not be implied by a polished interface.",
              Icon: ShieldCheck,
            },
          ]}
        />
        <p className={styles.note}>
          No clinical validation or peer-reviewed publication is claimed here.
          This page describes the project’s evaluation approach.
        </p>
      </Section>
    </>
  );
}
function AboutContent() {
  return (
    <>
      <Section
        id="purpose"
        label="OUR PURPOSE"
        title="Understandable information, wherever home may be."
      >
        <p className={styles.intro}>
          Distance, unfamiliar language, and complex terminology can make
          healthcare information harder to understand. MedGuide AI explores how
          a simple, multilingual interface can support a first layer of
          information and continuity of care.
        </p>
        <InfoCards
          items={[
            {
              title: "Rural and underserved communities",
              text: "A calm, mobile-friendly experience that keeps limited connectivity and digital literacy in mind.",
              Icon: Globe,
            },
            {
              title: "People before complexity",
              text: "Readable text, large controls, familiar language, and straightforward navigation guide the interface.",
              Icon: HeartHandshake,
            },
            {
              title: "Healthcare-worker involvement",
              text: "The wider project includes authorized healthcare-worker review and follow-up. Human expertise remains central.",
              Icon: ShieldCheck,
            },
          ]}
        />
      </Section>
      <Section
        label="WHAT GUIDES THE PROJECT"
        title="Careful engineering is part of care."
        dark
      >
        <div className={styles.twoColumn}>
          <div>
            <h3>Safety and honesty.</h3>
            <p>
              General information must not become a definitive diagnosis.
              Medical rules require documented sources, and uncertainty should
              never be hidden.
            </p>
          </div>
          <div>
            <h3>Privacy and access.</h3>
            <p>
              Use only necessary personal information, protect sensitive
              records, and prioritize free and open-source resources where
              practical.
            </p>
          </div>
        </div>
      </Section>
      <Section
        label="A STUDENT-LED RESEARCH PROJECT"
        title="Learning through a real, useful problem."
      >
        <p className={styles.intro}>
          MedGuide AI brings frontend engineering, APIs, language processing,
          retrieval, speech, document understanding, and secure information
          management into one research-oriented project. Components are
          developed incrementally and evaluated before stronger claims are made.
        </p>
        <Link href="/research" className={shared.textLink}>
          Explore our research approach <ArrowRight size={16} />
        </Link>
      </Section>
    </>
  );
}
export function MarketingPage({ kind }: { kind: PageKind }) {
  const copy = pageCopy[kind];
  const contents = {
    product: ProductContent,
    "how-it-works": HowItWorksContent,
    technology: TechnologyContent,
    research: ResearchContent,
    about: AboutContent,
  };
  const Content = contents[kind];
  return (
    <div className={`${shared.homepage} ${styles.page}`}>
      <a href="#page-content" className={shared.skipLink}>
        Skip to page content
      </a>
      <MarketingNavbar />
      <section className={styles.hero}><BotanicalDetail />
        <div className={styles.heroCopy}>
          <Eyebrow>{copy.label}</Eyebrow>
          <h1>
            {copy.first}
            <br />
            <span>{copy.second}</span>
          </h1>
          <p>{copy.text}</p>
          <div className={styles.heroActions}>
            <Action>Try MedGuide</Action>
            <Action secondary href={copy.anchor}>
              {copy.next}
            </Action>
          </div>
        </div>
        <TopicVisual kind={kind} />
      </section>
      <div id="page-content">
        <InteractiveFlow kind={kind} />
        <Content />{kind === "about" && <section className={styles.section}><RuralContext /></section>}
      </div>
      <section className={styles.closing}>
        <Eyebrow>CLOSER TO HOME</Eyebrow>
        <h2>Explore a simpler healthcare information experience.</h2>
        <p>
          Frontend demonstration. Not a substitute for a qualified healthcare
          professional.
        </p>
        <Action>Try MedGuide</Action>
      </section>
      <MarketingFooter />
    </div>
  );
}
