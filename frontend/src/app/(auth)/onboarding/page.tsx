"use client";
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthFrame } from '@/components/auth/auth-experience';
import { useLanguage } from '@/lib/i18n/context';
import { getSessionToken } from '@/lib/auth/session';
import { isMockMode } from '@/lib/api/config';
import { saveSetupProfile } from '@/lib/profile/setup';
import styles from '@/components/auth/auth-experience.module.css';
export default function OnboardingPage() {
 const router = useRouter(); const { language, setLanguage } = useLanguage();
 const [saving,setSaving]=useState(false),[error,setError]=useState('');
 const [values,setValues]=useState({name:'',age:'',gender:'',village:'',allergies:'',conditions:''});
 useEffect(()=>{if(!getSessionToken()){router.replace('/login?redirect=/onboarding');return;}},[router]);
 const update=(key:keyof typeof values)=>(event:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>setValues(v=>({...v,[key]:event.target.value}));
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setError('');setSaving(true);try{await saveSetupProfile({full_name:values.name.trim(),primary_language:language});router.replace('/app/chat');}catch(e){setError(e instanceof Error?e.message:'Your details could not be saved. Please try again.');}finally{setSaving(false);}}
 return <AuthFrame kind="setup"><p className={styles.label}>YOUR PROFILE</p><h2>Care in your language.</h2><p className={styles.intro}>Choose your language and a display name. A nickname is enough.</p><p className={styles.status}>{isMockMode() ? 'Preview: use synthetic details only. Saved for this browser session.' : 'Your display name and language are saved to your MedGuide account. Do not enter private medical information here.'}</p>{error&&<p role="alert" className={styles.error}>{error}</p>}<form onSubmit={submit} className={styles.form} aria-busy={saving}>
 <label className={styles.select}>Display name<input required maxLength={80} value={values.name} onChange={update('name')} autoComplete="nickname" disabled={saving}/></label><label className={styles.select}>Preferred language<select disabled={saving} value={language} onChange={e=>setLanguage(e.target.value as 'en'|'hi'|'te')}><option value="en">English</option><option value="hi">हिंदी</option><option value="te">తెలుగు</option></select></label><p className={styles.intro}>Read our <Link href="/privacy">privacy information</Link> and <Link href="/legal/disclaimer">medical boundaries</Link>. AI and speech permissions are managed separately.</p>
 <button disabled={saving} className={styles.submit} type="submit">{saving?'Saving profile…':'Save and ask MedGuide →'}</button></form></AuthFrame>;
}
