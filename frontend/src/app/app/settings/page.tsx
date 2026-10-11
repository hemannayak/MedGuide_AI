"use client";
import { useLanguage, type Language } from "@/lib/i18n/context";
import styles from "@/components/workspace/workspace.module.css";
export default function SettingsPage(){
 const { tr } = useLanguage();
const {language,setLanguage}=useLanguage();return <><div className={styles.welcome}><p className={styles.eyebrow}>{tr("MAKE IT FAMILIAR")}</p><h1>{tr("Your preferences")}</h1><p>{tr("Choose your interface language. Navigation, page text, and controls update immediately. Your preference is saved on this browser.")}</p></div><div className={styles.settings}><label>{tr("Preferred language")}<select value={language} onChange={e=>setLanguage(e.target.value as Language)}><option value="en">{tr("English")}</option><option value="hi">हिंदी</option><option value="te">తెలుగు</option></select></label><p role="status">{tr("Language preference:")}{language==='en'?'English':language==='hi'?'हिंदी':'తెలుగు'}</p><section><h2 className={styles.sectionTitle}>{tr("Accessibility")}</h2><p>{tr("Your device’s reduced-motion setting is respected. Navigation and controls support keyboard use and visible focus.")}</p></section></div></>}
