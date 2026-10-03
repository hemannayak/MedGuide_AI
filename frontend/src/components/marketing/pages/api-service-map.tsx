import Link from "next/link";
import { Eyebrow } from "../homepage/shared";
import styles from "./api-service-map.module.css";
const services = [
 ["Authentication", "/auth", "Account access and role-related authentication", "/login"],
 ["Patient profiles", "/patients", "Patient profile retrieval and updates", "/app/dashboard"],
 ["Symptoms", "/symptoms", "Reported symptoms and analysis contracts", "/app/symptoms"],
 ["AI companion", "/ai", "Conversation, source, and safety-rule interfaces", "/app/chat"],
 ["Medications", "/medications", "Schedules, adherence, and medication records", "/app/medications"],
 ["Timeline", "/timeline", "Chronological health-information records", "/app/dashboard"],
 ["Alerts", "/alerts", "Alert review and status updates", "/app/emergency"],
 ["Consent", "/consent", "Consent records and sharing preferences", "/privacy"],
 ["Healthcare workers", "/healthcare-workers", "Assigned patient information for authorized workers", "/product#healthcare-workers"],
 ["Follow-ups", "/follow-ups", "Follow-up creation and review contracts", "/product#healthcare-workers"],
] as const;
export function ApiServiceMap() {
 return <section id="service-map" className={styles.section} aria-labelledby="service-map-title">
  <Eyebrow>PRODUCT TO SERVICE MAP</Eyebrow><h2 id="service-map-title">Separate responsibilities.<br />One connected care journey.</h2>
  <p>The current repository registers ten service modules under <code>/api/v1</code>. This inventory describes code responsibilities, not evidence that these services are deployed or connected to the website. The frontend currently uses its configured mock service.</p>
  <details className={styles.disclosure}><summary>Explore the registered service modules</summary><div className={styles.tableWrap} tabIndex={0} role="region" aria-label="API service inventory">
  <table><caption>Registered router prefixes and related frontend destinations</caption><thead><tr><th scope="col">Service</th><th scope="col">Router prefix</th><th scope="col">Responsibility</th><th scope="col">Related experience</th></tr></thead><tbody>{services.map(([name,prefix,purpose,href])=><tr key={prefix}><th scope="row">{name}</th><td><code>/api/v1{prefix}</code></td><td>{purpose}</td><td><Link href={href}>{name === "Healthcare workers" || name === "Follow-ups" ? "Read the project approach" : "Explore the experience"} →</Link></td></tr>)}</tbody></table></div></details>
  <div className={styles.notes}><div><h3>Speech and prescription processing</h3><p>The older service map describes speech-to-text, text-to-speech, translation, and OCR services. Speech and prescription routers are not registered in the current central router. Their frontend previews remain distinct from operational processing.</p><Link href="/languages">Language and voice approach →</Link></div><div><h3>Evaluate before making claims</h3><p>Retrieved evidence does not guarantee a correct response. Source provenance, documented safety rules, role-based authorization, consent, and language-specific evaluation remain essential. No dataset-size, clinical-validation, or compliance claim follows from this architecture.</p><Link href="/research#methodology">Research and evaluation →</Link></div></div>
 </section>;
}
