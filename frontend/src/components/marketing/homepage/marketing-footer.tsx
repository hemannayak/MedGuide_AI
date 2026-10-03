"use client";
import Link from "next/link";
import { useState } from "react";
import { Brand } from "./shared";
import { SocialLogo } from "../editorial/social-logo";
import { ArrowRight, ChevronRight, Globe, Leaf, Mail, ShieldCheck } from "lucide-react";
import styles from "./marketing-footer.module.css";
import { navigationDirectory } from "./navigation-directory";
const groups = navigationDirectory;
export function MarketingFooter() {
    const [notice, setNotice] = useState("");
    const [subscriptionNotice, setSubscriptionNotice] = useState("");
    return <footer className={styles.footer} aria-label="MedGuide footer">
    <div className={styles.body}>
      <div className={styles.intro}><Link href="/" aria-label="MedGuide AI home"><Brand /></Link><p className={styles.tagline}>HEALTHCARE GUIDANCE<br />CLOSER TO HOME</p><h2 className={styles.headline}>Better information.<br /><span>Healthier communities.</span></h2><p className={styles.description}>Healthcare information, explained simply, in your language. Built around rural and underserved communities.</p><div className={styles.values}><span><Leaf size={16}/>Accessible</span><span><Globe size={16}/>Multilingual</span><span><ShieldCheck size={16}/>Evidence-grounded design</span></div></div>
      <div className={styles.groups}>{groups.map(group => <nav key={group.title} aria-label={`Footer ${group.title}`}><h2>{group.title}</h2>{group.links.map(([label, href]) => <Link key={label} href={href}>{label}<ChevronRight aria-hidden="true"/></Link>)}</nav>)}</div>
      <div className={styles.updates}><section><h2>Stay Updated</h2><p>Explore project updates, research, and healthcare information resources.</p><form className={styles.subscribe} onSubmit={e => { e.preventDefault(); setSubscriptionNotice("Email subscriptions are not connected yet. Visit Research for current project information. No email was saved or sent."); }}><Mail size={18} aria-hidden="true"/><input type="email" disabled aria-label="Email updates are not available yet" placeholder="Email updates coming later"/><button type="submit" aria-label="Check newsletter availability"><ArrowRight size={20}/></button></form><p className={styles.newsletterNote}>Email updates are not available yet.</p><p role="status" className={styles.status}>{subscriptionNotice}</p></section><section><h2>Follow Us</h2><div className={styles.socials}>{["GitHub", "LinkedIn", "YouTube", "X"].map(name => <button key={name} type="button" aria-label={`${name} profile information`} onClick={() => setNotice(`The official ${name} profile is not connected yet.`)}><SocialLogo name={name}/></button>)}</div><p role="status" className={styles.status}>{notice}</p></section><section><h2>Available In</h2><div className={styles.languages}><Link href="/languages">English</Link><Link href="/languages">हिंदी</Link><Link href="/languages">తెలుగు</Link></div></section></div>
    </div><div className={styles.landscape} aria-hidden="true"/><div className={styles.bottom}><p>© {new Date().getFullYear()} MedGuide AI. All rights reserved.<br />Built with care for accessible healthcare in India.</p><span><Leaf size={25} aria-hidden="true"/>Better information. Healthier communities.</span></div>
  </footer>;
}
