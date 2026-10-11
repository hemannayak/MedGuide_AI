"use client";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";
import { Activity, FileText, Pill, ArrowRight } from "lucide-react";
import { usePatientProfile } from "@/components/workspace/use-patient-profile";
import { isMockMode } from "@/lib/api/config";
import styles from "@/components/workspace/workspace.module.css";
export default function PatientDashboardPage(){
 const { tr } = useLanguage();

 const {profile,loading,error}=usePatientProfile();
 return <><div className={styles.welcome}><p className={styles.eyebrow}>{tr("A CLEARER STARTING POINT")}</p><h1>{loading?tr("Welcome to MedGuide"):`${tr("Welcome")}${profile?.full_name?', '+profile.full_name.split(' ')[0]:''}.`}</h1><p>{tr("Ask a question or choose a tool below.")}</p>{isMockMode()&&profile&&<p>{tr("Showing a synthetic sample profile.")}</p>}</div>{error&&<p className={styles.notice} role="alert">{tr(error)}</p>}
 <section className={styles.ask} aria-labelledby="ask-title"><div><h2 id="ask-title">{tr("What would you like to understand?")}</h2><p>{tr("Type your question in your own words.")}</p></div><Link className={styles.primary} href="/app/chat">{tr("Ask MedGuide")}<ArrowRight size={18} aria-hidden="true"/></Link></section>
 <section aria-labelledby="tools-title"><h2 id="tools-title" className={styles.sectionTitle}>{tr("Your everyday tools")}</h2><div className={styles.tools}>{[
 {href:'/app/symptoms',title:tr("Describe symptoms"),copy:tr("Organize what you have noticed and review the information you provide."),Icon:Activity},
 {href:'/app/prescriptions',title:tr("Prescription documents"),copy:tr("View the sample document experience."),Icon:FileText},
 {href:'/app/medications',title:tr("Medication overview"),copy:tr("See sample medication information."),Icon:Pill},
 ].map(({href,title,copy,Icon})=><Link key={href} href={href} className={styles.tool}><Icon size={25} aria-hidden="true"/><h3>{title}</h3><p>{copy}</p><span>{tr("Open tool")}<ArrowRight size={16} aria-hidden="true"/></span></Link>)}</div></section>
 <Link className={styles.informationLink} href="/app/information"><span>{tr("My information")}<small>{tr("Documents, medicines, profile and preferences")}</small></span><ArrowRight size={20} aria-hidden="true"/></Link></>;
}
