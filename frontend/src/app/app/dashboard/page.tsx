"use client";
import Link from "next/link";
import { Activity, FileText, Pill, ArrowRight } from "lucide-react";
import { usePatientProfile } from "@/components/workspace/use-patient-profile";
import { isMockMode } from "@/lib/api/config";
import styles from "@/components/workspace/workspace.module.css";
export default function PatientDashboardPage(){
 const {profile,loading,error}=usePatientProfile();
 return <><div className={styles.welcome}><p className={styles.eyebrow}>A CLEARER STARTING POINT</p><h1>{loading?'Welcome to MedGuide':`Welcome${profile?.full_name?', '+profile.full_name.split(' ')[0]:''}.`}</h1><p>Your questions, documents, and medication information—in one calm workspace.</p>{isMockMode()&&profile&&<p>Showing a synthetic sample profile.</p>}</div>{error&&<p className={styles.notice} role="alert">{error}</p>}
 <section className={styles.ask} aria-labelledby="ask-title"><div><h2 id="ask-title">What would you like to understand?</h2><p>Start with a health question in your own words. Keep professional care at the centre of your next steps.</p></div><Link className={styles.primary} href="/app/chat">Ask MedGuide<ArrowRight size={18} aria-hidden="true"/></Link></section>
 <section aria-labelledby="tools-title"><h2 id="tools-title" className={styles.sectionTitle}>Your everyday tools</h2><div className={styles.tools}>{[
 {href:'/app/symptoms',title:'Describe symptoms',copy:'Organize what you have noticed and review the information you provide.',Icon:Activity},
 {href:'/app/prescriptions',title:'Prescription documents',copy:'Explore the document-review experience. Automated OCR is not connected yet.',Icon:FileText},
 {href:'/app/medications',title:'Medication overview',copy:'Review medication information and the scheduling interface.',Icon:Pill},
 ].map(({href,title,copy,Icon})=><Link key={href} href={href} className={styles.tool}><Icon size={25} aria-hidden="true"/><h3>{title}</h3><p>{copy}</p><span>Open tool<ArrowRight size={16} aria-hidden="true"/></span></Link>)}</div></section>
 <section className={styles.empty}><h2 className={styles.sectionTitle}>Your care, in context</h2><p>Conversation history and health timeline records will appear here when those services are connected. This overview does not invent past visits or symptom checks.</p><Link href="/app/profile">Review your profile →</Link></section></>;
}
