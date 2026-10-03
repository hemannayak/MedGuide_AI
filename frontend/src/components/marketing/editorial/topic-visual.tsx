import Image from "next/image";
import { BookOpen, Check, Mic, ShieldCheck } from "lucide-react";
import { MedGuidePhoneMockup } from "../homepage/device-mockups";
import styles from "./editorial.module.css";

export function TopicVisual({ kind }: { kind: string }) {
  if (kind === "product")
    return (
      <div className={styles.productVisual}>
        <MedGuidePhoneMockup />
        <span>Text · Voice · Documents</span>
      </div>
    );
  if (kind === "about")
    return (
      <figure className={styles.communityPhoto}>
        <Image
          src="/marketing/community-about.webp"
          width={1536}
          height={1024}
          sizes="(max-width: 760px) 88vw, 43vw"
          alt="Conceptual illustration of two women reviewing a smartphone together in a rural Indian courtyard"
        />
        <figcaption>
          Conceptual illustration · not a real patient or deployment
        </figcaption>
      </figure>
    );
  if (kind === "research")
    return (
      <div className={styles.notebook}>
        <span>MEDGUIDE / RESEARCH NOTES</span>
        <h2>
          Evidence before
          <br />
          assumptions.
        </h2>
        <dl>
          <dt>01 / Question</dt>
          <dd>Can health information become easier to understand?</dd>
          <dt>02 / Method</dt>
          <dd>Review sources. Test the task. Record limitations.</dd>
          <dt>03 / Status</dt>
          <dd>Research in progress · No clinical validation claimed</dd>
        </dl>
      </div>
    );
  if (kind === "technology")
    return (
      <div className={styles.evidenceVisual}>
        <span>QUESTION → RETRIEVAL → EXPLANATION</span>
        <blockquote>“Where does this information come from?”</blockquote>
        <div>
          <BookOpen />
          <p>
            Reviewed document
            <br />
            <small>Publisher · Page · Version</small>
          </p>
        </div>
        <div>
          <Check />
          <p>
            Relevant passage
            <br />
            <small>Evidence kept separate from interpretation</small>
          </p>
        </div>
        <footer>
          <ShieldCheck />
          Clear limits. Visible sources.
        </footer>
      </div>
    );
  return (
    <div className={styles.journeyVisual}>
      <span>ASK → UNDERSTAND → GUIDE → ACT</span>
      <blockquote>“Help me understand my health question.”</blockquote>
      <div>
        <Mic /> Speak or type in a familiar language
      </div>
      <div>
        <BookOpen /> Review the information and its source
      </div>
      <footer>A clearer question for your next care conversation.</footer>
    </div>
  );
}

export function PublisherStrip() {
  return (
    <div
      className={styles.publishers}
      aria-label="Medical publishers referenced in the project"
    >
      <p>
        Source provenance matters.
        <br />
        <small>
          Documents are reviewed individually. Publisher references do not imply
          endorsement.
        </small>
      </p>
      <Image
        src="/World_Health_Organization_Logo.svg"
        width={130}
        height={55}
        alt="World Health Organization"
      />
      <Image
        src="/ICMR_ide35Ry-oj_0.png"
        width={100}
        height={60}
        alt="Indian Council of Medical Research"
      />
      <span>
        Document title
        <br />
        Publisher
        <br />
        Page & version
      </span>
    </div>
  );
}
