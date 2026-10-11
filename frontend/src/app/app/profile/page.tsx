"use client";
import { useLanguage } from "@/lib/i18n/context";
import { usePatientProfile } from "@/components/workspace/use-patient-profile";
import { isMockMode } from "@/lib/api/config";
import styles from "@/components/workspace/workspace.module.css";
export default function ProfilePage(){
 const { tr } = useLanguage();
const {profile,loading,error}=usePatientProfile();return <><div className={styles.welcome}><p className={styles.eyebrow}>{tr("YOUR INFORMATION")}</p><h1>{tr("Your profile")}</h1><p>{tr("Review the information returned by your profile service.")}</p></div>{loading&&<p role="status">{tr("Loading profile…")}</p>}{error&&<p role="alert" className={styles.notice}>{tr(error)}</p>}{profile&&<>{isMockMode()&&<p className={styles.notice}>{tr("Synthetic sample profile · This is not your personal health record.")}</p>}<dl className={styles.details}>{[[tr("Name"),profile.full_name],[tr("Preferred language"),profile.primary_language],[tr("Village or town"),profile.village_or_town],[tr("State"),profile.state],[tr("Age"),profile.age?.toString()],[tr("Gender"),profile.gender],[tr("Known allergies"),profile.known_allergies?.join(", ")],[tr("Health conditions"),profile.chronic_conditions?.join(", ")]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||tr("Not provided")}</dd></div>)}</dl><p className={styles.empty}>{tr("Profile editing is not connected in this frontend yet. No changes to personal records are submitted from this page.")}</p></>}</>}
