"use client";
import { HealthcareSituations } from "./rural-context";
import { BotanicalDetail } from "../homepage/shared";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Search } from "lucide-react";
import { MarketingNavbar } from "../homepage/hero-section";
import { MarketingFooter } from "../homepage/marketing-footer";
import { Action, Brand, Eyebrow } from "../homepage/shared";
import { SolutionSection } from "../homepage/problem-solution";
import { InteractiveFlow } from "../editorial/interactive-flow";
import { commonQuestions } from "../editorial/content";
import { ScrollReveal } from "../homepage/scroll-reveal";
import shared from "../homepage/homepage.module.css";
import styles from "./connected-pages.module.css";
import { filterQuestions } from "./faq-filter";
type Kind = "how-it-works" | "safety" | "languages" | "faq";
const introductions: Record<Kind, [
    string,
    string,
    string
]> = {
    "how-it-works": ["THE PRODUCT JOURNEY", "How MedGuide works", "From a question in your own words to clearer information and a better-prepared conversation with a healthcare professional."],
    safety: ["GROUNDING · BOUNDARIES · HUMAN CARE", "Healthcare guidance should know its boundaries.", "Healthcare information needs more than a fluent answer. Evidence, uncertainty, appropriate escalation, and privacy belong in the same conversation."],
    languages: ["LANGUAGES & ACCESSIBILITY", "Understanding starts in familiar words.", "Medical information isn’t always available in the language a person is most comfortable using. MedGuide’s first-phase design brings English, Hindi, and Telugu into a simpler interface."],
    faq: ["A LITTLE CLARITY", "Questions about MedGuide?", "Explore what the current experience offers, where its boundaries sit, and how the wider project is being developed."],
};
const related = [["how-it-works", "How it works", "Follow a question"], ["safety", "Safety", "Understand the boundaries"], ["languages", "Languages", "Explore communication"], ["faq", "FAQs", "Find an answer"]];
function Journey() {
    const reduce = useReducedMotion();
    const [active, setActive] = useState(0);
    const steps = [
        ["ASK", "Start with your own words.", "Type a concern or explore the intended voice and document flows. Symptom input helps structure duration and related details without requiring medical vocabulary.", "Help me understand my symptoms."],
        ["UNDERSTAND", "Check what was understood.", "Review your question, transcript, or extracted document text. Unclear prescription details require verification rather than an invented correction.", "Your words → Duration → Related details"],
        ["GUIDE", "Bring the evidence into view.", "The intended retrieval workflow finds relevant passages from reviewed medical documents. Source metadata stays separate from the generated explanation; insufficient evidence should be disclosed.", "Explanation / Retrieved passage / Publisher & page"],
        ["ACT", "Prepare a clearer next step.", "Ask a follow-up or prepare a professional-care conversation. Guidance must not diagnose, prescribe, change medication instructions, or override a validated escalation decision.", "Follow-up questions → Professional care → Health timeline"],
    ];
    return <section className={styles.journey} aria-labelledby="journey-title">
    <div className={styles.stickyPreview}><Eyebrow>ASK → UNDERSTAND → GUIDE → ACT</Eyebrow><h2 id="journey-title">One question.<br />A thoughtful journey.</h2>
      <div className={styles.screen} id="journey-preview" aria-live="polite"><Brand /><span className={styles.previewLabel}>Illustrative product flow</span><AnimatePresence mode="wait"><motion.div key={active} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : .2 }}><small>0{active + 1} / {steps[active][0]}</small><h3>{steps[active][1]}</h3><p>{steps[active][3]}</p></motion.div></AnimatePresence><p className={styles.caption}>A layout preview, not a live assessment or medical citation.</p></div>
      <div className={styles.stageControls} aria-label="Select journey stage">{steps.map(([label], i) => <button key={label} aria-pressed={active === i} aria-controls="journey-preview" onClick={() => setActive(i)}>{label}</button>)}</div>
    </div>
    <div>{steps.map(([label, title, copy], i) => <motion.article key={label} className={styles.chapter} onViewportEnter={() => setActive(i)} viewport={{ amount: .6 }}><small>0{i + 1} — {label}</small><h3>{title}</h3><p>{copy}</p><Link href={i === 0 ? "/product" : i === 1 ? "/languages" : i === 2 ? "/technology" : "/safety"}>{["Explore product inputs", "Learn about transcript review", "Explore retrieval and sources", "Read the safety approach"][i]} →</Link></motion.article>)}</div>
  </section>;
}
function Safety() {
    return <><section className={`${styles.section} ${styles.dark}`}><Eyebrow>AN EVIDENCE-FOCUSED DESIGN</Eyebrow><h2>A response should have a traceable starting point.</h2><ol className={styles.sourceFlow}>{["Your question", "Knowledge retrieval", "Relevant passages", "Explanation + sources"].map((text, i) => <li key={text}><span>0{i + 1}</span>{text}</li>)}</ol><p>Publisher, title, page, and version metadata should follow the evidence. Retrieved passages and generated text must remain distinguishable. Retrieval supports review; it does not guarantee correctness.</p><Link href="/research#sources">Explore source provenance →</Link></section>
  <InteractiveFlow kind="safety"/>
  <section className={styles.boundaries}><div><Eyebrow>THE ROLE OF MEDGUIDE</Eyebrow><h2>Support understanding.<br />Keep professional care central.</h2><p>MedGuide may explain general information, help structure reported symptoms, and support review by authorized healthcare workers.</p></div><div><h3>Clear medical limits</h3><p>It must not provide definitive diagnoses, independently prescribe, change prescribed dosages, recommend stopping treatment, or override a qualified healthcare professional.</p><h3>Escalation requires documented rules</h3><p>Red-flag and triage decisions require documented guidance, testable rules, and qualified review. A model must not downgrade a validated emergency classification. This website does not assess an emergency.</p><h3>Privacy needs permission</h3><p>Consent, data minimization, and authorized access are project requirements. Use synthetic examples during development; production privacy readiness is not established by a preview.</p><Link href="/privacy">Read privacy principles →</Link></div></section></>;
}
function Languages() {
    return <><InteractiveFlow kind="languages"/><section className={`${styles.section} ${styles.dark}`}><Eyebrow>VOICE WITH A REVIEW STEP</Eyebrow><h2>Speak → Understand → Respond</h2><p>The intended voice experience gives you a chance to confirm the words before they become the basis of a response.</p><div className={styles.voiceSteps}>{[["Speak", "A spoken question becomes a transcript through a connected speech-to-text service."], ["Understand", "Review the transcript and correct unclear words. The same evidence and safety boundaries apply across languages."], ["Respond", "Read the explanation. Spoken playback depends on connected text-to-speech services and available language voices."]].map(([title, copy]) => <div key={title}><h3>{title}</h3><p>{copy}</p></div>)}</div><p className={styles.caption}>These interactions illustrate the design. Speech, translation, pronunciation, and comprehension need separate language-specific evaluation; no live audio processing is performed here.</p></section>
  <section className={styles.boundaries}><div><Eyebrow>ACCESS IS MORE THAN TRANSLATION</Eyebrow><h2>Simple controls.<br />Room for every script.</h2><Link href="/accessibility">Explore accessibility principles →</Link></div><div>{[["Review at your pace", "Keep transcripts readable and editable; do not make audio the only way to understand a response."], ["Use the keyboard or touch", "Visible focus, clear labels, and generous controls support different ways of navigating."], ["Respect motion and connectivity", "Reduced-motion preferences simplify transitions. Server processing and new AI responses may require connectivity; full offline readiness is not claimed."]].map(([title, copy]) => <div key={title}><h3>{title}</h3><p>{copy}</p></div>)}</div></section></>;
}
const categories = ["All", "Product", "Safety", "Languages", "Technology"];
const questionCategories = ["Safety", "Product", "Languages", "Technology", "Safety", "Technology", "Product", "Safety"];
const destinations = ["/safety", "/product", "/languages", "/technology", "/safety", "/technology", "/about", "/research"];
function FAQ() {
    const [category, setCategory] = useState("All");
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState<number | null>(null);
    const reduced = useReducedMotion();
    const matches = filterQuestions(commonQuestions.map((item, index) => ({ ...item, index, category: questionCategories[index] })), query, category);
    return <section className={styles.faq} aria-labelledby="answers-title"><aside><h2 id="answers-title">Find your answer.</h2><label className={styles.search}><Search size={18} aria-hidden="true"/><span className={styles.srOnly}>Search MedGuide FAQs</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search questions"/></label><div className={styles.categories} aria-label="FAQ categories">{categories.map(name => <button key={name} aria-pressed={category === name} onClick={() => { setCategory(name); setOpen(null); }}>{name}</button>)}</div><p className={styles.caption} role="status">{matches.length} {matches.length === 1 ? "answer" : "answers"}</p><Link href="/login">Sign in to MedGuide →</Link></aside><div>{matches.map(({ question, answer, index }) => <article className={styles.answer} key={question}><h3><button id={`question-${index}`} aria-expanded={open === index} aria-controls={`answer-${index}`} onClick={() => setOpen(open === index ? null : index)}>{question}<motion.span animate={{ rotate: open === index ? 180 : 0 }} transition={{ duration: reduced ? 0 : .2 }}><ChevronDown size={20} aria-hidden="true"/></motion.span></button></h3><motion.div id={`answer-${index}`} role="region" aria-labelledby={`question-${index}`} aria-hidden={open !== index} inert={open !== index} animate={{ height: open === index ? "auto" : 0, opacity: open === index ? 1 : 0 }} transition={{ duration: reduced ? 0 : .2 }} className={styles.answerBody}><p>{answer}</p><Link href={destinations[index]}>Explore this topic →</Link></motion.div></article>)}{matches.length === 0 && <div className={styles.empty}><h3>No matching questions.</h3><p>Try a shorter phrase or another category.</p><button onClick={() => { setQuery(""); setCategory("All"); }}>Show all questions</button></div>}</div></section>;
}
export function ConnectedPage({ kind }: {
    kind: Kind;
}) {
    const [label, title, intro] = introductions[kind];
    return <div className={`${shared.homepage} ${styles.page}`}><a href="#page-content" className={shared.skipLink}>Skip to page content</a><MarketingNavbar enhanced/><div id="page-content"><section className={`${styles.hero} ${styles[kind === "how-it-works" ? "productHero" : kind === "faq" ? "faqHero" : kind]}`}><BotanicalDetail /><Eyebrow>{label}</Eyebrow><h1>{title}</h1><p>{intro}</p><div className={styles.heroLinks}><Link href={kind === "faq" ? "#answers-title" : kind === "how-it-works" ? "#journey-title" : "#page-details"}>{kind === "faq" ? "Find an answer" : "Explore the approach"} ↓</Link><Link href="/login">Try MedGuide →</Link></div></section><div id="page-details">{kind === "how-it-works" ? <><Journey /><HealthcareSituations /><ScrollReveal><SolutionSection /></ScrollReveal><section className={styles.section}><Eyebrow>YOUR INFORMATION, IN CONTEXT</Eyebrow><h2>Beyond a single question.</h2><p>The approved product scope includes symptom input, prescription review, medication support, a health timeline, and authorized healthcare-worker involvement. The current interface and product previews demonstrate these experiences; automated speech, OCR, retrieval, and guidance depend on connected services.</p><div className={styles.heroLinks}><Link href="/app/chat">Ask MedGuide →</Link><Link href="/app/symptoms">Symptom Check →</Link><Link href="/app/dashboard">Health Dashboard →</Link><Link href="/product#solution">Prescription preview →</Link></div></section></> : kind === "safety" ? <Safety /> : kind === "languages" ? <Languages /> : <FAQ />}</div><section className={styles.related}><Eyebrow>CONTINUE EXPLORING</Eyebrow><h2>See how the pieces connect.</h2><div>{related.filter(([route]) => route !== kind).map(([route, name, copy]) => <Link key={route} href={`/${route}`}><small>{copy}</small><strong>{name} →</strong></Link>)}</div><Action>Try MedGuide</Action></section></div><MarketingFooter />{kind === "faq" && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: commonQuestions.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }).replace(/</g, "\\u003c") }}/>}</div>;
}
