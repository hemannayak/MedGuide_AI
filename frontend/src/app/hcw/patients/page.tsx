"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import type { CarePatient } from "@/types/care";
import styles from "@/components/care/care.module.css";
export default function AuthorizedPatientsPage() {
  const [patients, setPatients] = useState<CarePatient[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(""), [search, setSearch] = useState("");
  useEffect(() => { let active = true; api.getWorkerPatients().then(result => { if (!active) return; if (result.success && result.data) setPatients(result.data); else setError(result.message || "Patient list unavailable."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return <section className={styles.page}><div className={styles.heading}><h1>Authorized patients</h1><p>Only patients assigned to your account appear here. Access is managed by an administrator.</p></div>
    <div className={styles.form}><label>Find a patient by name<input type="search" value={search} onChange={e => setSearch(e.target.value)} /></label></div>
    {loading ? <p role="status">Loading authorized patients…</p> : error ? <p className={styles.error} role="alert">{error}</p> : patients.length === 0 ? <p>No patients have been assigned. Contact your administrator.</p> : <>
      {patients.filter(p => p.display_name.toLowerCase().includes(search.toLowerCase())).map(patient => <article key={patient.id} className={styles.card}><h2>{patient.display_name}</h2><p>Preferred language: {patient.preferred_language}</p><Link href={`/hcw/patients/${patient.id}`}>Review patient records →</Link></article>)}
      {!patients.some(p => p.display_name.toLowerCase().includes(search.toLowerCase())) && <p>No assigned patients match this name.</p>}
    </>}
  </section>;
}
