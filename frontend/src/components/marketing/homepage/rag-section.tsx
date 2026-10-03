import Link from "next/link";
import { ArrowRight, Files, Search } from "lucide-react";
import { Eyebrow, ReferenceDetail } from "./shared";
import styles from "./homepage.module.css";

export function RagSection() {
  return (
    <section
      id="how-it-works"
      className={styles.rag}
      aria-labelledby="rag-title"
    >
      <ReferenceDetail
        x={0}
        y={1036}
        width={58}
        height={162}
        className={styles.ragLeftLeaves}
      />
      <ReferenceDetail
        x={978}
        y={1081}
        width={46}
        height={117}
        className={styles.ragRightLeaves}
      />
      <div className={styles.ragCopy}>
        <Eyebrow>HOW MEDGUIDE THINKS</Eyebrow>
        <h2 id="rag-title">
          It doesn’t just generate.
          <br />
          It looks for evidence first.
        </h2>
        <p>
          MedGuide uses Retrieval-Augmented Generation (RAG) to search trusted
          medical sources, retrieve relevant information, and then generate a
          clear and understandable response.
        </p>
        <Link className={styles.textLink} href="/how-it-works">
          Learn more <ArrowRight size={14} />
        </Link>
      </div>
      <div
        id="technology"
        className={styles.ragDiagram}
        aria-label="Illustrative retrieval pipeline: question, knowledge search, relevant sources, evidence-grounded response"
      >
        <div className={styles.searchStage}>
          <span className={styles.searchIcon}>
            <Search size={32} />
          </span>
          <div className={styles.questionBubble}>“Why am I feeling dizzy?”</div>
          <strong>
            Search
            <br />
            medical knowledge
          </strong>
        </div>
        <svg
          className={styles.ragConnector}
          viewBox="0 0 75 70"
          aria-hidden="true"
        >
          <path d="M0 15 C40 10 25 55 70 50" />
          <path d="m64 45 6 5-6 4" />
        </svg>
        <div className={styles.sourceStage}>
          <strong>Relevant sources</strong>
          <div className={styles.sourceStack}>
            {[
              ["WHO Guidelines", "Dizziness and Vertigo"],
              ["ICMR Publication", "Common Causes of Dizziness"],
              ["Medical Reference", "Evaluation and Management"],
            ].map(([title, subtitle]) => (
              <div key={title}>
                <Files size={22} />
                <span>
                  <b>{title}</b>
                  <small>{subtitle}</small>
                </span>
              </div>
            ))}
          </div>
          <small className={styles.diagramNote}>
            Illustrative source cards, not citations
          </small>
        </div>
        <ArrowRight className={styles.blueArrow} size={27} />
        <div className={styles.responseStage}>
          <strong>
            Evidence-grounded
            <br />
            response
          </strong>
          {[100, 92, 74, 100, 88].map((width, i) => (
            <span key={i} style={{ width: `${width}%` }} />
          ))}
        </div>
        <svg
          className={styles.ragCurve}
          viewBox="0 0 120 130"
          aria-hidden="true"
        >
          <path d="M0 125 C75 110 55 10 120 5" />
        </svg>
      </div>
    </section>
  );
}
