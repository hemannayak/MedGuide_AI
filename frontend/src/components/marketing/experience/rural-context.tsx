import Image from "next/image";
import styles from "./rural-context.module.css";

/** Original editorial illustrations: context, not patient cases or clinical outcomes. */
export function RuralContext() {
  return <figure className={styles.village}>
    <div aria-hidden="true">{["coconut-tree", "banyan-tree", "village-road-bus", "paddy-carrier"].map(asset => <Image key={asset} src={`/marketing/rural/${asset}.svg`} width={300} height={190} alt="" />)}</div>
    <figcaption>Designed around everyday life in rural communities—familiar language, clear information, and a connection to professional care.</figcaption>
  </figure>;
}
export function HealthcareSituations() {
  const scenes = [
    ["health-question", "A question at home", "Start in your own words.", "Describe a concern without needing medical terminology. MedGuide’s text interface helps you begin; voice processing remains a connected-service capability."],
    ["prescription-review", "A prescription to understand", "Review before relying on it.", "The document experience is designed around checking extracted text. Unclear medicine names or instructions need human verification; OCR must not guess."],
    ["care-conversation", "A conversation with a healthcare professional", "Bring your questions to care.", "Use clearer information to prepare questions for a qualified professional. MedGuide supports understanding and must not replace diagnosis or prescribing."],
  ];
  return <section className={styles.situations} aria-labelledby="situations-title">
    <p className={styles.label}>IN EVERYDAY HEALTHCARE MOMENTS</p><h2 id="situations-title">Different situations.<br />A clearer place to start.</h2>
    {scenes.map(([asset, alt, title, copy]) => <article key={asset}><Image src={`/marketing/rural/${asset}.svg`} width={300} height={190} alt={alt}/><div><h3>{title}</h3><p>{copy}</p></div></article>)}
    <RuralContext />
  </section>;
}
