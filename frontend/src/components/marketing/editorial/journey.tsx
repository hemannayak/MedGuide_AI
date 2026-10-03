import Link from "next/link";
import { Eyebrow } from "../homepage/shared";
import styles from "./editorial.module.css";
import story from "./home-refinement.module.css";
export function ProductJourney() {
  return (
    <section
      className={styles.editorialSection}
      id="how-it-works"
      aria-labelledby="journey-heading"
    >
      <div className={styles.split}>
        <div>
          <Eyebrow>FROM QUESTION TO NEXT STEP</Eyebrow>
          <h2 id="journey-heading">
            Ask. Understand.
            <br />
            Guide. Act.
          </h2>
          <p>
            A familiar question becomes a clearer conversation. The intended
            journey keeps your words, the evidence, and professional-care
            boundaries in view.
          </p>
          <div className={styles.featureLinks}>
            <Link href="/how-it-works">Follow the journey →</Link>
            <Link href="/product">Explore the product →</Link>
          </div>
        </div>
        <div className={styles.evidenceVisual}>
          <span>ILLUSTRATIVE PRODUCT JOURNEY</span>
          <blockquote>“Help me understand my symptoms.”</blockquote>
          <div>Your words → Review what you shared</div>
          <div>Relevant information → Visible source details</div>
          <footer>
            Your next step → A conversation with a healthcare professional
          </footer>
        </div>
      </div>
    </section>
  );
}
export function LanguageStory({ detailed = false }: { detailed?: boolean }) {
  return (
    <section className={styles.editorialSection} aria-labelledby="language-story-title">
      <Eyebrow>{detailed ? "LANGUAGE, TRANSCRIPTS, AND UNDERSTANDING" : "HEALTH QUESTIONS START WITH FAMILIAR WORDS"}</Eyebrow>
      <h2 id="language-story-title">{detailed ? <>Check what was understood.<br />Keep your words in view.</> : <>Your language.<br />A clearer starting point.</>}</h2>
      <p>Explaining a health question can be harder in an unfamiliar language. MedGuide’s first-phase experience is designed around English, Hindi, and Telugu—with a voice journey that lets you review what was understood.</p>
      <div className={story.voiceJourney} aria-label="Intended voice journey">
        <span>Speak <small>Use your own words</small></span><span aria-hidden="true">→</span>
        <span>Understand <small>Review the transcript</small></span><span aria-hidden="true">→</span>
        <span>Respond <small>Read a clearer explanation</small></span>
      </div>
      <div className={styles.languageStage}>
        {[
          ["en", "English", "How can I ask my health question?"],
          ["hi", "हिंदी", "मुझे सिर दर्द हो रहा है, क्या करूँ?"],
          ["te", "తెలుగు", "మీ ప్రశ్న అడగండి"],
        ].map(([lang, name, example]) => (
          <div key={lang}><strong lang={lang}>{name}</strong><p lang={lang}>{example}</p></div>
        ))}
      </div>
      <p className={story.caption}>Interface examples. Voice and translation features are in development.</p>
      {detailed && <p>These examples demonstrate native-script layouts, not a live translation or medical response. English, Hindi, and Telugu are the first-phase scope. A spoken question should be transcribed and reviewed before it enters the evidence and safety workflow. Spoken responses depend on connected speech services, available language voices, and separate evaluation of transcription, translation, and comprehension.</p>}
      <div className={styles.featureLinks}>
        <Link href="/languages">Explore language and voice →</Link>
        <Link href="/accessibility">Accessibility principles →</Link>
      </div>
    </section>
  );
}
export function HomeTrust() {
  return (
    <section className={story.trust} aria-labelledby="safety-title">
      <div>
        <Eyebrow>INFORMATION WITH CLEAR BOUNDARIES</Eyebrow>
        <h2 id="safety-title">Healthcare guidance should<br />know its boundaries.</h2>
        <p>MedGuide is designed to make information easier to understand and support conversations with qualified healthcare professionals. It does not replace their care.</p>
        <Link href="/safety">Read the safety approach →</Link>
      </div>
      <ol className={story.trustPrinciples}>
        <li><span>01</span><div><h3>Keep evidence in view</h3><p>An evidence-focused design connects explanations to their source information.</p></div></li>
        <li><span>02</span><div><h3>Recognize the limits</h3><p>Uncertainty and information needing professional review should be clear.</p></div></li>
        <li><span>03</span><div><h3>Stay connected to care</h3><p>Safety and escalation are part of the intended journey, rather than an afterthought.</p></div></li>
      </ol>
    </section>
  );
}
export function HomeQuestions() {
  return (
    <section className={styles.editorialSection} aria-labelledby="explore-title">
      <Eyebrow>CHOOSE YOUR NEXT STEP</Eyebrow>
      <h2 id="explore-title">You’ve met MedGuide.<br />Now explore what matters to you.</h2>
      <p>Try the web experience, see the product journey, or take a closer look at the principles behind it.</p>
      <div className={story.explore}>
        {[
          ["01", "Explore the experience", "See the health companion, symptom input, dashboard, and prescription preview in context.", "/product", "Explore the product"],
          ["02", "Follow a question", "Discover how Ask → Understand → Guide → Act connects your question to a useful next step.", "/how-it-works", "See how it works"],
          ["03", "Understand the approach", "Explore the proposed retrieval architecture, source provenance, and research evaluation.", "/technology", "Explore the technology"],
        ].map(([number, title, copy, href, action]) => (
          <div key={href}><span>{number}</span><h3>{title}</h3><p>{copy}</p><Link href={href}>{action} →</Link></div>
        ))}
      </div>
      <div className={styles.featureLinks}>
        <Link href="/login">Try MedGuide on the web →</Link>
        <Link href="/safety">Read the safety approach →</Link>
        <Link href="/faq">All FAQs →</Link>
        <Link href="/about">Our mission →</Link>
        <Link href="/research">Research and methodology →</Link>
      </div>
    </section>
  );
}
