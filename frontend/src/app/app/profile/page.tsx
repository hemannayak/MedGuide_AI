"use client";
import { useState, type FormEvent } from "react";
import { usePatientProfile } from "@/components/workspace/use-patient-profile";
import { api } from "@/lib/api/client";
import { isMockMode } from "@/lib/api/config";
import styles from "@/components/care/care.module.css";
export default function ProfilePage() {
 const {profile,loading,error,refresh}=usePatientProfile();
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(""),[saveError,setSaveError]=useState("");
 async function save(event:FormEvent<HTMLFormElement>) {
  event.preventDefault(); setBusy(true);setMessage("");setSaveError("");
  const form=new FormData(event.currentTarget);
  const result=await api.updatePatientProfile({display_name:String(form.get("name")).trim(),preferred_language:form.get("language") as "en"|"hi"|"te"});
  if(result.success){setMessage("Your profile has been saved.");refresh();}else setSaveError(result.message||"Your profile could not be saved.");
  setBusy(false);
 }
 return <div className={styles.page}><header className={styles.heading}><h1>Your profile</h1><p>Review and update your name and preferred language.</p></header>
 {loading&&<p role="status">Loading profile...</p>}{error&&<p role="alert" className={styles.error}>{error}</p>}
 {profile&&<>{isMockMode()&&<p className={styles.notice}>Synthetic sample profile. Saving requires the connected service.</p>}
 <form className={styles.form} onSubmit={save} key={profile.id}><label>Name<input name="name" defaultValue={profile.full_name} required minLength={1} maxLength={255}/></label>
 <label>Preferred language<select name="language" defaultValue={profile.primary_language}><option value="en">English</option><option value="hi">हिंदी</option><option value="te">తెలుగు</option></select></label>
 <button className={styles.button} disabled={busy||isMockMode()}>{busy?"Saving...":"Save profile"}</button></form></>}
 {message&&<p role="status">{message}</p>}{saveError&&<p role="alert" className={styles.error}>{saveError}</p>}</div>;
}
