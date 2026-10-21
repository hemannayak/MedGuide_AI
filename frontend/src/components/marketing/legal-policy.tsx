import Link from "next/link";
import { MarketingNavbar } from "./homepage/hero-section";
import { MarketingFooter } from "./homepage/marketing-footer";
import styles from "./homepage/homepage.module.css";
type Kind = "privacy" | "terms" | "cookies" | "refunds";
const policies: Record<Kind, { title: string; sections: [string, string][] }> = {
 privacy: { title: "Privacy policy", sections: [
  ["Project status", "MedGuide AI is a student-led major project under development. Use synthetic information for demonstrations. This notice describes current implementation, not legal certification or clinical readiness."],
  ["Data and purposes", "Account identifier, password hash, display name and language preference support sign-in and your profile. Questions, symptoms, prescriptions, extracted medications, schedules, adherence, consent choices and care records support the features you choose. Do not submit Aadhaar, financial information, exact location or unrelated personal details. Technical services may receive connection metadata such as IP address and request time."],
  ["Providers and permissions", "Configured cloud providers may process submitted questions, retrieved context, translations or audio. Integrations include Groq and Sarvam; optional local Ollama inference is available. Configuration varies by deployment. AI and speech consent are separate and can be withdrawn on the permissions page. Text interaction does not require speech consent. Provider retention, processing locations and contracts require review before real patient use."],
  ["Storage and access", "Application records are stored in the backend database and prescription images are stored by the backend. Patients and assigned healthcare workers are subject to access controls. Backend speech recordings are processed in memory rather than retained as recordings; cloud provider practices are separate. Browser sign-in tokens and language preferences are stored as explained in the cookie policy. Visible chat is kept in memory, not a shared persistent cache. Security controls do not guarantee security."],
  ["Retention and requests", "Automatic retention, account-wide erasure/export and a formal grievance workflow are not yet complete. Closing a tab, clearing chat or withdrawing consent does not automatically delete server records or provider copies. The operator must publish retention periods and implement verified access, correction, erasure and request handling before public launch. The contact preview currently delivers no requests."],
  ["Children and other people's information", "Verified parental-consent support is not implemented. Do not create child accounts or submit identifiable children's records during this demonstration. Submit another person's information only with appropriate authority. This project is not yet a compliant children's service."],
  ["Tracking and changes", "No advertising pixels, analytics SDKs or third-party iframe embeds were identified in the audited source. Deployment infrastructure and provider processing still need a separate review. Material changes to processing require a revised notice and consent where applicable."],
 ] },
 terms: { title: "Terms and conditions", sections: [
  ["Purpose and medical limits", "MedGuide provides preliminary health information and tools to organize patient-reported records. It is not a doctor, emergency response service or clinically validated diagnostic product. Replies and OCR can be incorrect. Consult qualified healthcare professionals; do not change treatment or delay emergency care based on the application."],
  ["Responsible use", "Keep credentials private. Provide only necessary information you are authorized to share. Do not access others' records, upload unlawful content or interfere with security. Worker access requires authorization. Do not use this demonstration for identifiable children's information; parental verification is pending."],
  ["Permissions and content", "You must have permission to upload documents. Permission to process data is limited to the selected features; these terms do not grant blanket advertising, research or model-training permission. AI and speech processing choices are separate from accepting terms and can be withdrawn."],
  ["Availability and third parties", "Connected features can fail. Offline operation, reminder delivery and model accuracy are not guaranteed. Third-party links and providers have separate policies. References to organizations do not imply endorsement, partnership or affiliation."],
  ["Copyright and statutory rights", "Third-party documents, images, fonts and trademarks retain their owners' rights. Check licenses before reuse. Report rights concerns through the operator contact once published. Nothing in these terms removes statutory consumer or privacy rights. Operator identity and applicable legal terms require review before public launch."],
 ] },
 cookies: { title: "Cookie and browser-storage policy", sections: [
  ["Current inventory", "No tracking cookies, analytics SDKs, advertising pixels or third-party iframe embeds were identified in application source. This is not a production network audit: development tooling or hosting may introduce cookies and logs."],
  ["Sign-in", "medguide_token is stored in sessionStorage for tab-only sign-in, or localStorage if you select Remember me. It authorizes requests. Sign-out clears both copies; local sign-out does not prove server token revocation. On shared devices, leave Remember me unchecked and sign out."],
  ["Language and chat", "medguide_lang in localStorage remembers language until changed or cleared. Legacy medguide_chat_history and medguide_conv_id entries are removed on chat entry and authentication changes. New visible conversations remain in memory; refreshing clears them without deleting backend records."],
  ["Consent decision and controls", "No optional tracking requiring an accept/reject banner was identified in this implementation, so no tracking consent banner is displayed. This is not a blanket legal exemption. Before introducing optional analytics, advertising or embeds, review applicable jurisdictions and implement prior opt-in where required, with equally usable rejection and withdrawal. You can clear site data in browser settings; blocking storage may prevent sign-in. AI/speech consent is managed separately."],
 ] },
 refunds: { title: "Refund and cancellation policy", sections: [
  ["Current project", "No payment, purchase or subscription checkout was identified in the current application. No refund transaction workflow exists. This notice does not create a paid offering or imply that a purchase occurred."],
  ["Unexpected payment", "Do not pay through unofficial links claiming to represent MedGuide. If you believe an operator charged you, contact the operator once details are published with only the necessary transaction reference. Never send card details, passwords or OTPs."],
  ["Future paid offerings", "Before introducing payments, publish prices, cancellation steps, refund eligibility, timeframes and operator contact details. Applicable statutory rights cannot be removed by this policy."],
 ] },
};
export function LegalPolicy({kind}: {kind: Kind}) {
 const policy=policies[kind];
 return <div className={styles.homepage}><a href="#policy-content" className={styles.skipLink}>Skip to policy</a><MarketingNavbar />
  <section id="policy-content" className="mx-auto max-w-4xl px-6 py-16 text-[#073d37]">
   <h1 className="text-4xl font-serif mb-4">{policy.title}</h1><p className="mb-8">Last reviewed: 11 October 2026 · Development version</p>
   <nav aria-label="Policy pages" className="flex flex-wrap gap-5 mb-10">{Object.entries(policies).map(([key,value])=><Link key={key} href={`/${key}`} aria-current={kind===key?"page":undefined} className="underline min-h-[44px] inline-flex items-center">{value.title}</Link>)}</nav>
   {policy.sections.map(([heading,text])=><section key={heading} className="mb-8"><h2 className="text-2xl font-semibold mb-3">{heading}</h2><p className="leading-8">{text}</p></section>)}
   <section className="border-t border-[#52635f] pt-8"><h2 className="text-2xl font-semibold mb-3">Operator and contact details</h2><p className="leading-8">MedGuide AI is currently a student major project. A legal operator, public business address, contact email and grievance contact have not yet been supplied. These must be finalized before public launch; the contact preview does not send requests. Do not submit real patient information to this development demonstration.</p><Link href="/app/consent" className="underline min-h-[44px] inline-flex items-center mt-4">Review AI and speech permissions</Link></section>
  </section><MarketingFooter /></div>;
}
